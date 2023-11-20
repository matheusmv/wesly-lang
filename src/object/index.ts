import { Block } from '../ast/block-stmt.js';
import { FieldList } from '../ast/field-decl.js';
import { Env, Environment, Value } from './environment.js';
import { Interpreter } from '../interpreter/index.js';
import { VoidType } from '../type/atomic.js';
import { Type } from '../type/index.js';
import { ObjType } from '../type/object.js';
import {
    arrCopy,
    arrEqual,
    isArray,
    isError,
    isFunc,
    isReturn,
    mapEqual,
} from '../util/index.js';

export type ObjKind =
    | 'Error'
    | 'Int'
    | 'Float'
    | 'Char'
    | 'String'
    | 'Bool'
    | 'Nil'
    | 'Return'
    | 'Break'
    | 'Continue'
    | 'Func'
    | 'Object'
    | 'Array'
    | 'TypeSpec'
    | 'Callable';

export interface Obj {
    kind(): ObjKind;
    copy(): Obj;
    equals(o: Obj): boolean;
    toString(): string;
}

export class ErrorObject implements Obj {
    constructor(
        public message: string,
        public err?: ErrorObject,
    ) {}

    kind(): ObjKind {
        return 'Error';
    }

    copy(): Obj {
        return new ErrorObject(this.message, this.err?.copy() as ErrorObject);
    }

    equals(o: Obj): boolean {
        if (!(o instanceof ErrorObject)) return false;

        return (
            this.message === o.message &&
            (this.err?.equals(o.err as Obj) || false)
        );
    }

    errAsString(): string {
        if (!this.err) return '';

        return `\n${this.err.toString()}`;
    }

    toString(): string {
        return `${this.message}${this.errAsString()}`;
    }
}

export class IntObject implements Obj {
    constructor(public value: number) {}

    kind(): ObjKind {
        return 'Int';
    }

    copy(): Obj {
        return new IntObject(this.value);
    }

    equals(o: Obj): boolean {
        if (!(o instanceof IntObject)) return false;

        return this.value === o.value;
    }

    toString(): string {
        return `${this.value}`;
    }
}

export class FloatObject implements Obj {
    constructor(public value: number) {}

    kind(): ObjKind {
        return 'Float';
    }

    copy(): Obj {
        return new FloatObject(this.value);
    }

    equals(o: Obj): boolean {
        if (!(o instanceof FloatObject)) return false;

        return this.value === o.value;
    }

    toString(): string {
        return `${this.value}`;
    }
}

export class CharObject implements Obj {
    constructor(public value: string) {}

    kind(): ObjKind {
        return 'Char';
    }

    copy(): Obj {
        return new CharObject(this.value);
    }

    equals(o: Obj): boolean {
        if (!(o instanceof CharObject)) return false;

        return this.value === o.value;
    }

    toString(): string {
        return this.value;
    }
}

export class StringObject implements Obj {
    constructor(public value: string) {}

    kind(): ObjKind {
        return 'String';
    }

    copy(): Obj {
        return new StringObject(this.value);
    }

    equals(o: Obj): boolean {
        if (!(o instanceof StringObject)) return false;

        return this.value === o.value;
    }

    toString(): string {
        return this.value;
    }
}

export class BooleanObject implements Obj {
    constructor(public value: boolean) {}

    kind(): ObjKind {
        return 'Bool';
    }

    copy(): Obj {
        return new BooleanObject(this.value);
    }

    equals(o: Obj): boolean {
        if (!(o instanceof BooleanObject)) return false;

        return this.value === o.value;
    }

    toString(): string {
        return `${this.value}`;
    }
}

export class NilObject implements Obj {
    kind(): ObjKind {
        return 'Nil';
    }

    equals(o: Obj): boolean {
        return o instanceof NilObject;
    }

    copy(): Obj {
        return new NilObject();
    }

    toString(): string {
        return 'nil';
    }
}

export class ReturnObject extends Error implements Obj {
    constructor(public value?: Value) {
        super();
    }

    kind(): ObjKind {
        return 'Return';
    }

    copy(): Obj {
        if (!this.value) {
            return new ReturnObject({
                type: new VoidType(),
                value: new NilObject(),
            });
        }

        return new ReturnObject({
            type: this.value.type.copy(),
            value: this.value.value.copy(),
        });
    }

    equals(o: Obj): boolean {
        if (!(o instanceof ReturnObject)) return false;

        if (this.value && o.value) {
            return (
                this.value.type.equals(o.value.type) &&
                this.value.value.equals(o.value.value)
            );
        }

        return true;
    }

    toString(): string {
        return `${this.value?.value.toString() ?? ''}`;
    }
}

export class BreakObject implements Obj {
    kind(): ObjKind {
        return 'Break';
    }

    copy(): Obj {
        return new BreakObject();
    }

    equals(o: Obj): boolean {
        return o instanceof BreakObject;
    }

    toString(): string {
        return 'break';
    }
}

export class ContinueObject implements Obj {
    kind(): ObjKind {
        return 'Continue';
    }

    copy(): Obj {
        return new ContinueObject();
    }

    equals(o: Obj): boolean {
        return o instanceof ContinueObject;
    }

    toString(): string {
        return 'continue';
    }
}

export interface Callable {
    call(it: Interpreter, args: Value[]): Value | Error;
}

export class FunctionObject implements Callable, Obj {
    constructor(
        public env: Env<Value>,
        public params: FieldList,
        public body: Block,
        public type: Type,
    ) {}

    call(it: Interpreter, args: Value[]): Value | Error {
        const params = this.params.parseList();

        const funcEnv = new Environment(this.env);

        for (let i = 0; i < params.length; i++) {
            funcEnv.define(params[i].name, args[i]);
        }

        const rt = it.execBlock(this.body.declarations, funcEnv);
        return this.unwrapReturnValue(rt);
    }

    private unwrapReturnValue(value: Value | Error): Value | Error {
        if (isError(value)) return value;

        if (isReturn(value.value)) {
            const rtrnObj = value.value;
            if (rtrnObj.value) {
                return rtrnObj.value;
            }

            return {
                type: new VoidType(),
                value: new NilObject(),
            };
        }

        return value;
    }

    kind(): ObjKind {
        return 'Func';
    }

    copy(): Obj {
        return new FunctionObject(
            this.env,
            this.params.copy() as FieldList,
            this.body.copy() as Block,
            this.type?.copy(),
        );
    }

    equals(o: Obj): boolean {
        if (!isFunc(o)) return false;
        return this.type.equals(o.type);
    }

    toString(): string {
        return `<Func: ${this.type?.toString()}>`;
    }
}

export class ObjectSpec implements Callable, Obj {
    public anonymous: boolean;

    constructor(
        public name: string,
        public spec: ObjType,
    ) {
        this.anonymous = name === '';
    }

    call(it: Interpreter, args: Value[]): Value | Error {
        const objInstance = new ObjectInstance(this, new Map());
        return {
            type: this.spec?.copy(),
            value: objInstance,
        };
    }

    callWithNamedArgs(
        it: Interpreter,
        names: string[],
        values: Obj[],
    ): Value | Error {
        const result = this.specContainsNames(names);
        if (isError(result)) return result;

        return {
            type: this.spec?.copy(),
            value: new ObjectInstance(this, this.specTable(names, values)),
        };
    }

    private specContainsNames(names: string[]): Error | null {
        const specDef = this.spec.fields.parseList();

        for (const name of names) {
            const found = specDef.find((f) => f.name === name);
            if (!found) {
                return new Error(
                    `unknown field ${name} in object: ${this.toString()}`,
                );
            }
        }

        return null;
    }

    private specTable(names: string[], values: Obj[]): Map<string, Obj> {
        const tb: Map<string, Obj> = new Map();

        for (let i = 0; i < names.length; i++) {
            tb.set(names[i], values[i]);
        }

        return tb;
    }

    kind(): ObjKind {
        return 'TypeSpec';
    }

    copy(): Obj {
        return new ObjectSpec(this.name, this.spec.copy() as ObjType);
    }

    equals(o: Obj): boolean {
        if (!(o instanceof ObjectSpec)) return false;

        if (this.anonymous || o.anonymous) return this.spec.equals(o.spec);

        return this.name === o.name && this.spec.equals(o.spec);
    }

    toString(): string {
        return `<TypeSpec: ${this.name}${this.spec.toString()}>`;
    }
}

export class ObjectInstance implements Obj {
    constructor(
        public spec: ObjectSpec,
        public fields: Map<string, Obj>,
    ) {}

    getField(field: string): Obj | null {
        return this.fields.get(field) ?? null;
    }

    getFieldIn(names: string[]): Obj | Error {
        let value: Obj = {} as Obj;
        let currentSpec = this.spec;
        let currentTable = this.fields;

        for (const name of names) {
            const v = currentTable.get(name);
            if (!v) {
                return new Error(
                    `${currentSpec.name} does not have field: ${name}`,
                );
            } else {
                value = v;

                if (v instanceof ObjectInstance) {
                    currentSpec = v.spec;
                    currentTable = v.fields;
                }
            }
        }

        return value;
    }

    setField(name: string, value: Obj) {
        this.fields.set(name, value);
    }

    findAndSet(names: string[], name: string, value: Obj): void | Error {
        let currentSpec = this.spec;
        let currentTable = this.fields;

        for (const nm of names) {
            const v = currentTable.get(nm);
            if (!v) {
                return new Error(
                    `${currentSpec.name} does not have field: ${nm}`,
                );
            } else if (nm !== name) {
                if (v instanceof ObjectInstance) {
                    currentSpec = v.spec;
                    currentTable = v.fields;
                }
            }
        }

        currentTable.set(name, value);
    }

    kind(): ObjKind {
        return 'Object';
    }

    copy(): Obj {
        const fc: Map<string, Obj> = new Map();

        for (const [k, v] of this.fields) {
            fc.set(k, v.copy());
        }

        return new ObjectInstance(this.spec.copy() as ObjectSpec, fc);
    }

    equals(o: Obj): boolean {
        if (!(o instanceof ObjectInstance)) return false;

        if (!this.spec.equals(o.spec)) return false;

        return mapEqual(this.fields, o.fields, (l, r) => l.equals(r));
    }

    showFields(): string {
        return `${[...this.fields.entries()].map(([k, v]) => `${k}: ${v}`)}`;
    }

    private getNameOrSpec(): string {
        return this.spec.name || this.spec.spec.toString();
    }

    toString(): string {
        return `<Object: ${this.getNameOrSpec()} {${this.showFields()}}>`;
    }
}

export class ArrayObject implements Obj {
    constructor(
        public objects: Obj[],
        public type: Type,
    ) {}

    kind(): ObjKind {
        return 'Array';
    }

    copy(): Obj {
        return new ArrayObject(
            arrCopy(this.objects, (o) => o.copy()),
            this.type?.copy(),
        );
    }

    equals(o: Obj): boolean {
        if (!isArray(o)) return false;
        if (this.type.equals(o.type)) return false;
        return arrEqual(this.objects, o.objects, (l, r) => l.equals(r));
    }

    toString(): string {
        return `[${this.objects.map((obj) => obj.toString()).join(', ')}]`;
    }

    static dimensionSize(arr: ArrayObject): number {
        let size = 0;

        for (const object of arr.objects) {
            if (object instanceof ArrayObject) {
                const nestedSize = ArrayObject.dimensionSize(object) + 1;

                if (nestedSize > size) {
                    size = nestedSize;
                }
            }
        }

        return size;
    }

    findIndexAndSetValue(indexes: number[], value: Obj): void | Error {
        if (ArrayObject.dimensionSize(this) < indexes.length - 1) {
            return new Error(`out of bounds`);
        }

        let arrRef = this.objects;
        let result;

        for (let i = 0; i < indexes.length; i++) {
            result = arrRef[indexes[i]];
            if (!result) {
                return new Error(`out of bounds`);
            }

            if (Array.isArray(result)) {
                arrRef = result;
            }

            if (i + 1 == indexes.length) {
                arrRef[indexes[i]] = value;
            }
        }

        return;
    }
}
