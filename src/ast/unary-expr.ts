import { Token } from '../lexer/token.js';
import { Type } from '../type/index.js';
import { Expression, Kind, Node, Visitor } from './index.js';

export type UnaryExpression = 'UnaryExpression';

export class Unary implements Expression {
    public type: Type | null = null;

    constructor(
        public operator: Token,
        public expression: Expression,
    ) {}

    kind(): Kind {
        return 'UnaryExpression';
    }

    literal(): string {
        return '';
    }

    copy(): Node {
        const c = new Unary(this.operator.copy(), this.expression.copy());
        c.type = this.type?.copy() ?? null;
        return c;
    }

    equals(o: Node): boolean {
        if (!(o instanceof Unary)) return false;

        if (!this.operator.equals(o.operator)) return false;

        if (!this.expression.equals(o.expression)) return false;

        if (this.type && o.type) return this.type.equals(o.type);

        return this.type === o.type;
    }

    toString(): string {
        return `${this.operator.lexeme}${this.expression.toString()}`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitUnaryExpression(this);
    }
}
