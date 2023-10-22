import { Type } from '../type/index.js';
import { Expression, Kind, Node, Statement, Visitor } from './index.js';

export type ExpressionStatement = 'ExpressionStatement';

export class ExprStmt implements Statement {
    public type: Type | null = null;

    constructor(public expr: Expression) {}

    kind(): Kind {
        return 'ExpressionStatement';
    }

    literal(): string {
        return '';
    }

    copy(): Node {
        const c = new ExprStmt(this.expr.copy());
        c.type = this.type?.copy() ?? null;
        return c;
    }

    equals(o: Node): boolean {
        if (!(o instanceof ExprStmt)) return false;

        if (!this.expr.equals(o.expr)) return false;

        if (this.type && o.type) return this.type.equals(o.type);

        return this.type === o.type;
    }

    toString(): string {
        return `${this.expr.toString()}`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitExpressionStatement(this);
    }
}
