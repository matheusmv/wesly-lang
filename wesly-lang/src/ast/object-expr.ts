import { Type } from '../type/index.js';
import { arrCopy, arrEqual } from '../util/index.js';
import { Expression, Kind, Node, Visitor } from './index.js';
import { Identifier } from './literal.js';

export type ObjectExpression =
    | 'ObjectInitExpression'
    | 'ObjectIlineInitExpression'
    | 'ObjectFieldExpression'
    | 'ObjectMemberExpression';

export class ObjectInit implements Expression {
    public type: Type | null = null;

    constructor(
        public name: Expression,
        public fields: ObjectField[],
    ) {}

    kind(): Kind {
        return 'ObjectInitExpression';
    }

    literal(): string {
        return '';
    }

    copy(): Node {
        const c = new ObjectInit(
            this.name.copy(),
            arrCopy(this.fields, (f) => f.copy() as ObjectField),
        );

        c.type = this.type?.copy() ?? null;

        return c;
    }

    equals(o: Node): boolean {
        if (!(o instanceof ObjectInit)) return false;

        if (!this.name.equals(o.name)) return false;

        if (!arrEqual(this.fields, o.fields, (lF, rF) => lF.equals(rF)))
            return false;

        if (this.type && o.type) return this.type.equals(o.type);

        return this.type === o.type;
    }

    toString(): string {
        return `${this.name.toString()}{ ${this.fields
            .map((field) => field.toString())
            .join(', ')} }`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitObjectInitExpression(this);
    }
}

export class ObjectInlineInit implements Expression {
    constructor(
        public type: Type,
        public fields: ObjectField[],
    ) {}

    kind(): Kind {
        return 'ObjectIlineInitExpression';
    }

    literal(): string {
        return '';
    }

    copy(): Node {
        return new ObjectInlineInit(
            this.type.copy(),
            arrCopy(this.fields, (f) => f.copy() as ObjectField),
        );
    }

    equals(o: Node): boolean {
        if (!(o instanceof ObjectInlineInit)) return false;

        if (!this.type.equals(o.type)) return false;

        return arrEqual(this.fields, o.fields, (lF, rF) => lF.equals(rF));
    }

    toString(): string {
        return `${this.type.toString()}{ ${this.fields
            .map((field) => field.toString())
            .join(', ')} }`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitObjectInlineInitExpression(this);
    }
}

export class ObjectField implements Expression {
    public type: Type | null = null;

    constructor(
        public name: Identifier,
        public value: Expression,
    ) {}

    kind(): Kind {
        return 'ObjectFieldExpression';
    }

    literal(): string {
        return '';
    }

    copy(): Node {
        const c = new ObjectField(
            this.name.copy() as Identifier,
            this.value.copy(),
        );
        c.type = this.type?.copy() ?? null;
        return c;
    }

    equals(o: Node): boolean {
        if (!(o instanceof ObjectField)) return false;

        if (!this.name.equals(o.name)) return false;

        if (!this.value.equals(o.value)) return false;

        if (this.type && o.type) return this.type.equals(o.type);

        return this.type === o.type;
    }

    toString(): string {
        return `${this.name.toString()}: ${this.value.toString()}`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitObjectFieldExpression(this);
    }
}

export class ObjectMember implements Expression {
    public type: Type | null = null;

    constructor(
        public object: Expression,
        public next: ObjectMember,
    ) {}

    kind(): Kind {
        return 'ObjectMemberExpression';
    }

    literal(): string {
        return '';
    }

    copy(): Node {
        const c = new ObjectMember(
            this.object.copy(),
            this.next.copy() as ObjectMember,
        );
        c.type = this.type?.copy() ?? null;
        return c;
    }

    equals(o: Node): boolean {
        if (!(o instanceof ObjectMember)) return false;

        if (!this.object.equals(o.object)) return false;

        if (!this.next.equals(o.next)) return false;

        if (this.type && o.type) return this.type.equals(o.type);

        return this.type === o.type;
    }

    getMembers(): Expression[] {
        let member = this.next;
        const result = [this.object];

        while (member.next !== undefined) {
            result.unshift(member.object);
            member = member.next;
        }

        result.unshift(member);

        return result;
    }

    toString(): string {
        return `${this.getMembers()
            .map((memb) => memb.toString())
            .join('.')}`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitObjectMemberExpression(this);
    }
}
