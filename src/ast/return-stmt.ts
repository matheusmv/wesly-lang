import { Type } from '../type/index.js';
import { Expression, Kind, Node, Statement, Visitor } from './index.js';

export type ReturnStatement = 'ReturnStatement';

export class ReturnStmt implements Statement {
    public type: Type | null = null;

    constructor(public result?: Expression) {}

    kind(): Kind {
        return 'ReturnStatement';
    }

    literal(): string {
        return '';
    }

    copy(): Node {
        const c = new ReturnStmt(this.result?.copy());
        c.type = this.type?.copy() ?? null;
        return c;
    }

    equals(o: Node): boolean {
        if (!(o instanceof ReturnStmt)) return false;

        if (this.result && o.result) {
            if (!this.result.equals(o.result)) return false;
        } else {
            if (this.result !== o.result) return false;
        }

        if (this.type && o.type) return this.type.equals(o.type);

        return this.type === o.type;
    }

    toString(): string {
        return `return ${this.result?.toString()};`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitReturnStmt(this);
    }
}
