import { Value } from '../object/environment.js';
import {
    Callable,
    FunctionObject,
    IntObject,
    NilObject,
} from '../object/index.js';
import { AnyT } from '../type/any.js';
import { IntType, VoidType } from '../type/atomic.js';
import { FuncType } from '../type/func.js';
import { Variadic } from '../type/variadic.js';
import { isArray, isString } from '../util/index.js';
import { Interpreter } from './index.js';

export type EnvProperty = {
    name: string;
    value: Value;
};

export function printlnFunc(): EnvProperty {
    const getCallable = (): Callable => {
        return {
            call(it: Interpreter, args: Value[]) {
                const objs = args.map((vl) => vl.value.toString()).join('');
                console.log(objs);
                return {
                    type: new VoidType(),
                    value: new NilObject(),
                };
            },
        };
    };

    return {
        name: 'println',
        value: {
            type: new FuncType([new Variadic(new AnyT())], new VoidType()),
            value: getCallable() as FunctionObject,
        },
    };
}

export function lenFunc(): EnvProperty {
    const getCallable = (): Callable => {
        return {
            call(it: Interpreter, args: Value[]) {
                if (1 < args.length) {
                    return new Error(`len() should receive only one argument`);
                }

                const obj = args[0].value;

                if (isString(obj)) {
                    return {
                        type: new IntType(),
                        value: new IntObject(obj.value.length),
                    };
                }

                if (isArray(obj)) {
                    return {
                        type: new IntType(),
                        value: new IntObject(obj.objects.length),
                    };
                }

                return new Error(`len(): invalid argument (${obj.toString()})`);
            },
        };
    };

    return {
        name: 'len',
        value: {
            type: new FuncType([new AnyT()], new VoidType()),
            value: getCallable() as FunctionObject,
        },
    };
}

export function copyFunc(): EnvProperty {
    const getCallable = (): Callable => {
        return {
            call(it: Interpreter, args: Value[]) {
                if (1 < args.length) {
                    return new Error(`copy() should receive only one argument`);
                }

                const value = args[0];

                return {
                    type: value.type?.copy(),
                    value: value.value?.copy(),
                };
            },
        };
    };

    return {
        name: 'copy',
        value: {
            type: new FuncType([new AnyT()], new AnyT()),
            value: getCallable() as FunctionObject,
        },
    };
}
