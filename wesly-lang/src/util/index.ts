import {
    ArrayObject,
    BooleanObject,
    BreakObject,
    CharObject,
    ContinueObject,
    FloatObject,
    FunctionObject,
    IntObject,
    NilObject,
    Obj,
    ReturnObject,
    StringObject,
} from '../object/index.js';

export function isError(o: unknown): o is Error {
    return o instanceof Error;
}

export function isTruthy(o: Obj): boolean {
    if (o === null) return false;

    switch (o.kind()) {
        case 'Nil':
            return false;
        case 'Bool':
            return (o as BooleanObject).value;
        case 'Int':
            return (o as IntObject).value ? true : false;
        case 'Float':
            return (o as FloatObject).value ? true : false;
        default:
            return true;
    }
}

export function isInt(o: unknown): o is IntObject {
    return o instanceof IntObject;
}

export function isFloat(o: unknown): o is FloatObject {
    return o instanceof FloatObject;
}

export function isChar(o: unknown): o is CharObject {
    return o instanceof CharObject;
}

export function isString(o: unknown): o is StringObject {
    return o instanceof StringObject;
}

export function isBool(o: unknown): o is BooleanObject {
    return o instanceof BooleanObject;
}

export function isNil(o: unknown): o is NilObject {
    return o instanceof NilObject;
}

export function isReturn(o: unknown): o is ReturnObject {
    return o instanceof ReturnObject;
}

export function isBreak(o: unknown): o is BreakObject {
    return o instanceof BreakObject;
}

export function isContinue(o: unknown): o is ContinueObject {
    return o instanceof ContinueObject;
}

export function isFunc(o: unknown): o is FunctionObject {
    return o instanceof FunctionObject;
}

export function isArray(o: unknown): o is ArrayObject {
    return o instanceof ArrayObject;
}

export function arrEqual<T>(
    l: T[],
    r: T[],
    cmp: (l: T, r: T) => boolean,
): boolean {
    if (!Array.isArray(l) || !Array.isArray(r)) return false;

    if (l.length !== r.length) return false;

    for (let i = 0; i < l.length; i++) {
        const lVal = l[i];
        const rVal = r[i];

        if (Array.isArray(lVal) && Array.isArray(rVal)) {
            if (!arrEqual(lVal, rVal, cmp)) {
                return false;
            }
        } else {
            if (!cmp(lVal, rVal)) {
                return false;
            }
        }
    }

    return true;
}

export function arrCopy<T>(arr: T[], copy: (v: T) => T): T[] {
    const result: T[] = [];

    for (const v of arr) {
        result.push(copy(v));
    }

    return result;
}
