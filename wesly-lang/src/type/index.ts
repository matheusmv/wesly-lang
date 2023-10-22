import { TypeSpecification, TypeSpec } from './spec.js';

import { VariadicType, Variadic } from './variadic.js';

import { FunctionType, FuncType } from './func.js';

import { ObjectType, ObjType } from './object.js';

import { ArrayType, ArrType } from './array.js';

import {
    AtomicType,
    IntType,
    FloatType,
    CharType,
    StringType,
    BoolType,
    VoidType,
} from './atomic.js';

import { AnyType, AnyT } from './any.js';

export type TypeKind =
    | TypeSpecification
    | VariadicType
    | FunctionType
    | ObjectType
    | ArrayType
    | AtomicType
    | AnyType;

export interface Type {
    kind(): TypeKind;
    copy(): Type;
    equals(o: Type): boolean;
    toString(): string;
}

export default {
    TypeSpec,
    Variadic,
    FuncType,
    ObjType,
    ArrType,
    IntType,
    FloatType,
    CharType,
    StringType,
    BoolType,
    VoidType,
    AnyT,
};
