import { Value } from '../object/environment.js';
import { Callable, FunctionObject, NilObject } from '../object/index.js';
import { AnyT } from '../type/any.js';
import { VoidType } from '../type/atomic.js';
import { FuncType } from '../type/func.js';
import { Variadic } from '../type/variadic.js';
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
                return new NilObject();
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
