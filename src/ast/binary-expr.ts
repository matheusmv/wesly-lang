import { Token } from '../lexer/token.js';
import { Type } from '../type/index.js';
import { Expression, Kind, Node, Visitor } from './index.js';

export type BinaryExpression = 'BinaryExpression';

export class Binary implements Expression {
    public type: Type | null = null;

    constructor(
        public left: Expression,
        public token: Token,
        public right: Expression,
    ) {}

    kind(): Kind {
        return 'BinaryExpression';
    }

    literal(): string {
        return 'BinaryExpression';
    }

    copy(): Node {
        const c = new Binary(
            this.left.copy(),
            this.token.copy(),
            this.right.copy(),
        );
        c.type = this.type?.copy() ?? null;
        return c;
    }

    equals(o: Node): boolean {
        if (!(o instanceof Binary)) return false;

        if (!this.token.equals(o.token)) return false;

        if (!this.left.equals(o.left)) return false;

        if (!this.right.equals(o.right)) return false;

        if (this.type && o.type) return this.type.equals(o.type);

        return this.type === o.type;
    }

    toString(): string {
        return `${this.left.toString()} ${
            this.token.lexeme
        } ${this.right.toString()}`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitBinaryExpression(this);
    }
}
