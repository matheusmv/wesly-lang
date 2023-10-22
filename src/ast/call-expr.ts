import { Type } from '../type/index.js';
import { arrCopy, arrEqual } from '../util/index.js';
import { Expression, Kind, Node, Visitor } from './index.js';

export type CallExpression = 'CallExpression';

export class Call implements Expression {
    public type: Type | null = null;

    constructor(
        public callee: Expression,
        public args: Expression[],
    ) {}

    kind(): Kind {
        return 'CallExpression';
    }

    literal(): string {
        return '';
    }

    copy(): Node {
        const c = new Call(
            this.callee.copy(),
            arrCopy(this.args, (e) => e.copy()),
        );
        c.type = this.type?.copy() ?? null;
        return c;
    }

    equals(o: Node): boolean {
        if (!(o instanceof Call)) return false;

        if (this.callee.equals(o.callee)) return false;

        if (!arrEqual(this.args, o.args, (lE, rR) => lE.equals(rR)))
            return false;

        if (this.type && o.type) return this.type.equals(o.type);

        return this.type === o.type;
    }

    toString(): string {
        return `${this.callee.toString()}(${this.args
            .map((expr) => expr.toString())
            .join(', ')})`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitCallExpression(this);
    }
}
