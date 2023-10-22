import { Type } from '../type/index.js';
import { Kind, Node, Statement, Visitor } from './index.js';

export type BreakStatement = 'BreakStatement';

export class BreakStmt implements Statement {
    public type: Type | null = null;

    kind(): Kind {
        return 'BreakStatement';
    }

    literal(): string {
        return '';
    }

    copy(): Node {
        const c = new BreakStmt();
        c.type = this.type?.copy() ?? null;
        return c;
    }

    equals(o: Node): boolean {
        return o instanceof BreakStmt;
    }

    toString(): string {
        return `break`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitBreakStmt(this);
    }
}
