import { Token } from '../lexer/token.js';
import { BoolType } from '../type/atomic.js';
import { Type } from '../type/index.js';
import { Expression, Kind, Node, Visitor } from './index.js';

export type LogicalExpression = 'LogicalExpression';

export class Logical implements Expression {
    public type: Type | null = new BoolType();

    constructor(
        public left: Expression,
        public operator: Token,
        public right: Expression,
    ) {}

    kind(): Kind {
        return 'LogicalExpression';
    }

    literal(): string {
        return '';
    }

    copy(): Node {
        const c = new Logical(
            this.left.copy(),
            this.operator.copy(),
            this.right.copy(),
        );
        c.type = this.type?.copy() ?? null;
        return c;
    }

    equals(o: Node): boolean {
        if (!(o instanceof Logical)) return false;

        if (!this.operator.equals(o.operator)) return false;

        if (!this.left.equals(o.left)) return false;

        if (!this.right.equals(o.right)) return false;

        if (this.type && o.type) return this.type.equals(o.type);

        return this.type === o.type;
    }

    toString(): string {
        return `${this.left.toString()} ${
            this.operator.lexeme
        } ${this.right.toString()}`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitLogicalExpression(this);
    }
}
