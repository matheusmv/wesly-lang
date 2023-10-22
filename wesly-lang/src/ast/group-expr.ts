import { Type } from '../type/index.js';
import { Expression, Kind, Node, Visitor } from './index.js';

export type GroupExpression = 'GroupExpression';

export class Group implements Expression {
    public type: Type | null = null;

    constructor(public expression: Expression) {}

    kind(): Kind {
        return 'GroupExpression';
    }

    literal(): string {
        return this.expression.toString();
    }

    copy(): Node {
        const c = new Group(this.expression.copy());
        c.type = this.type?.copy() ?? null;
        return c;
    }

    equals(o: Node): boolean {
        if (!(o instanceof Group)) return false;

        if (!this.expression.equals(o.expression)) return false;

        if (this.type && o.type) return this.type.equals(o.type);

        return this.type === o.type;
    }

    toString(): string {
        return `(${this.expression.toString()})`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitGroupExpression(this);
    }
}
