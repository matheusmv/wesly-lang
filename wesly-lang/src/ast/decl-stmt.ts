import { Type } from '../type/index.js';
import { Declaration, Kind, Node, Statement, Visitor } from './index.js';

export type DeclarationStatement = 'DeclarationStatement';

export class DeclStmt implements Declaration {
    public type: Type | null = null;

    constructor(public stmt: Statement) {}

    kind(): Kind {
        return 'DeclarationStatement';
    }

    literal(): string {
        return '';
    }

    copy(): Node {
        const c = new DeclStmt(this.stmt.copy());
        c.type = this.type?.copy() ?? null;
        return c;
    }

    equals(o: Node): boolean {
        if (!(o instanceof DeclStmt)) return false;

        if (!this.stmt.equals(o.stmt)) return false;

        if (this.type && o.type) return this.type.equals(o.type);

        return this.type === o.type;
    }

    toString(): string {
        return `${this.stmt.toString()}`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitDeclStmt(this);
    }
}
