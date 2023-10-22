import { Type } from '../type/index.js';
import { Kind, Node, Statement, Visitor } from './index.js';

export type ContinueStatement = 'ContinueStatement';

export class ContinueStmt implements Statement {
    public type: Type | null = null;

    kind(): Kind {
        return 'ContinueStatement';
    }

    literal(): string {
        return '';
    }

    copy(): Node {
        const c = new ContinueStmt();
        c.type = this.type?.copy() ?? null;
        return c;
    }

    equals(o: Node): boolean {
        return o instanceof ContinueStmt;
    }

    toString(): string {
        return 'continue';
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitContinueStmt(this);
    }
}
