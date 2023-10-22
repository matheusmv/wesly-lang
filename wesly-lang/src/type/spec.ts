import { Identifier } from '../ast/literal.js';
import { Type, TypeKind } from './index.js';

export type TypeSpecification = 'TypeSpecification';

export class TypeSpec implements Type {
    constructor(
        public name: Identifier,
        public type: Type,
    ) {}

    kind(): TypeKind {
        return 'TypeSpecification';
    }

    copy(): Type {
        return new TypeSpec(this.name.copy() as Identifier, this.type.copy());
    }

    equals(o: Type): boolean {
        if (!(o instanceof TypeSpec)) return false;

        return this.name.equals(o.name) && this.type.equals(o.type);
    }

    toString(): string {
        return `${this.name.toString()} ${this.type.toString()}`;
    }
}
