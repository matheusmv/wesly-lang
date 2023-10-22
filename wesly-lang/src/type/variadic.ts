import { Type, TypeKind } from './index.js';

export type VariadicType = 'VariadicType';

export class Variadic implements Type {
    constructor(public type: Type) {}

    kind(): TypeKind {
        return 'VariadicType';
    }

    copy(): Type {
        return new Variadic(this.type.copy());
    }

    equals(o: Type): boolean {
        if (!(o instanceof Variadic)) return false;

        return this.type.equals(o.type);
    }

    toString(): string {
        return `...${this.type.toString()}`;
    }
}
