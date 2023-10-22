import { Type } from '../type/index.js';
import { Expression, Kind, Node, Statement, Visitor } from './index.js';

export type IfStatement = 'IfStatement';

export class IfStmt implements Statement {
    public type: Type | null = null;

    constructor(
        public condition: Expression,
        public thenBranch: Statement,
        public elseBranch?: Statement,
    ) {}

    kind(): Kind {
        return 'IfStatement';
    }

    literal(): string {
        return '';
    }

    copy(): Node {
        const c = new IfStmt(
            this.condition.copy(),
            this.thenBranch.copy(),
            this.elseBranch?.copy(),
        );

        c.type = this.type?.copy() ?? null;

        return c;
    }

    equals(o: Node): boolean {
        if (!(o instanceof IfStmt)) return false;

        if (!this.condition.equals(o.condition)) return false;

        if (!this.thenBranch.equals(o.thenBranch)) return false;

        if (this.elseBranch && o.elseBranch) {
            if (!this.elseBranch.equals(o.elseBranch)) return false;
        } else {
            if (this.elseBranch !== o.elseBranch) return false;
        }

        if (this.type && o.type) return this.type.equals(o.type);

        return this.type === o.type;
    }

    private getElseBranchAsString(): string {
        if (!this.elseBranch) return '';

        return ` else ${this.elseBranch.toString()}`;
    }

    toString(): string {
        return `if (${this.condition.toString()}) ${this.thenBranch.toString()}${this.getElseBranchAsString()}`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitIfStatement(this);
    }
}
