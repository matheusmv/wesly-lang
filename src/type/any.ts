import { Type, TypeKind } from './index.js';

export type AnyType = 'AnyType';

export class AnyT implements Type {
    kind(): TypeKind {
        return 'AnyType';
    }

    copy(): Type {
        return new AnyT();
    }

    equals(o: Type): boolean {
        return o instanceof AnyT;
    }

    toString(): string {
        return `any`;
    }
}
