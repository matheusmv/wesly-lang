import { Type, TypeKind } from './index.js';

export type ArrayType = 'ArrayType';

export class ArrType implements Type {
    constructor(
        public type: Type,
        public length?: number,
    ) {}

    kind(): TypeKind {
        return 'ArrayType';
    }

    copy(): Type {
        return new ArrType(this.type.copy(), this.length);
    }

    equals(o: Type): boolean {
        if (!(o instanceof ArrType)) return false;

        return this.type.equals(o.type) && this.length == o.length;
    }

    toString(): string {
        return `[${this.length || ''}]${this.type.toString()}`;
    }
}
