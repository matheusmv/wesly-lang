import { Token } from '../lexer/token.js';
import { Type } from '../type/index.js';
import { Expression, Kind, Node, Statement, Visitor } from './index.js';

export type AssignExpression = 'AssignExpression';

export class Assign implements Statement {
    public type: Type | null = null;

    constructor(
        public lhs: Expression,
        public operation: Token,
        public rhs: Expression,
    ) {}

    kind(): Kind {
        return 'AssignExpression';
    }

    literal(): string {
        return '';
    }

    copy(): Node {
        const c = new Assign(
            this.lhs.copy(),
            this.operation.copy(),
            this.rhs.copy(),
        );
        c.type = this.type?.copy() ?? null;
        return c;
    }

    equals(o: Node): boolean {
        if (!(o instanceof Assign)) return false;

        if (this.operation.equals(o.operation)) return false;

        if (!this.lhs.equals(o.lhs)) return false;

        if (!this.rhs.equals(o.rhs)) return false;

        if (this.type && o.type) return this.type.equals(o.type);

        return this.type === o.type;
    }

    toString(): string {
        return `${this.lhs.toString()} ${
            this.operation.lexeme
        } ${this.rhs.toString()}`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitAssignExpression(this);
    }
}
