import { Type } from '../type/index.js';
import { arrCopy, arrEqual } from '../util/index.js';
import { Declaration, Kind, Node, Statement, Visitor } from './index.js';

export type BlockStatement = 'BlockStatement';

export class Block implements Statement {
    public type: Type | null = null;

    constructor(public declarations: Declaration[]) {}

    kind(): Kind {
        return 'BlockStatement';
    }

    literal(): string {
        return '';
    }

    copy(): Node {
        const c = new Block(arrCopy(this.declarations, (d) => d.copy()));
        c.type = this.type?.copy() ?? null;
        return c;
    }

    equals(o: Node): boolean {
        if (!(o instanceof Block)) return false;

        if (
            !arrEqual(this.declarations, o.declarations, (lD, rD) =>
                lD.equals(rD),
            )
        )
            return false;

        if (this.type && o.type) return this.type.equals(o.type);

        return this.type === o.type;
    }

    toString(): string {
        return `{\n${this.declarations
            .map((decl) => decl.toString())
            .join('\n')}\n}`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitBlockStmt(this);
    }
}
