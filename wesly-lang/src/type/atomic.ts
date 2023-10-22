import { Type } from './index.js';

export type AtomicType =
    | 'IntegerType'
    | 'FloatType'
    | 'CharType'
    | 'StringType'
    | 'BoolType'
    | 'VoidType';

export class IntType implements Type {
    kind(): AtomicType {
        return 'IntegerType';
    }

    copy(): Type {
        return new IntType();
    }

    equals(o: Type): boolean {
        return o instanceof IntType;
    }

    toString(): string {
        return 'int';
    }
}

export class FloatType implements Type {
    kind(): AtomicType {
        return 'FloatType';
    }

    copy(): Type {
        return new FloatType();
    }

    equals(o: Type): boolean {
        return o instanceof FloatType;
    }

    toString(): string {
        return 'float';
    }
}

export class CharType implements Type {
    kind(): AtomicType {
        return 'CharType';
    }

    copy(): Type {
        return new CharType();
    }

    equals(o: Type): boolean {
        return o instanceof CharType;
    }

    toString(): string {
        return 'char';
    }
}

export class StringType implements Type {
    kind(): AtomicType {
        return 'StringType';
    }

    copy(): Type {
        return new StringType();
    }

    equals(o: Type): boolean {
        return o instanceof StringType;
    }

    toString(): string {
        return 'string';
    }
}

export class BoolType implements Type {
    kind(): AtomicType {
        return 'BoolType';
    }

    copy(): Type {
        return new BoolType();
    }

    equals(o: Type): boolean {
        return o instanceof BoolType;
    }

    toString(): string {
        return 'bool';
    }
}

export class VoidType implements Type {
    kind(): AtomicType {
        return 'VoidType';
    }

    copy(): Type {
        return new VoidType();
    }

    equals(o: Type): boolean {
        return o instanceof VoidType;
    }

    toString(): string {
        return 'void';
    }
}
