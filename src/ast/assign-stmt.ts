import { Token } from '../lexer/token.js';
import { Type } from '../type/index.js';
import { arrCopy, arrEqual } from '../util/index.js';
import { Expression, Kind, Node, Statement, Visitor } from './index.js';

export type AssignStatement = 'AssignStatement';

export class Assign implements Statement {
    public type: Type | null = null;

    constructor(
        public lhs: Expression[],
        public operation: Token,
        public rhs: Expression[],
    ) {}

    kind(): Kind {
        return 'AssignStatement';
    }

    literal(): string {
        return '';
    }

    copy(): Node {
        const c = new Assign(
            arrCopy(this.lhs, (e) => e.copy()),
            this.operation.copy(),
            arrCopy(this.rhs, (e) => e.copy()),
        );
        c.type = this.type?.copy() ?? null;
        return c;
    }

    equals(o: Node): boolean {
        if (!(o instanceof Assign)) return false;

        if (this.operation.equals(o.operation)) return false;

        if (!arrEqual(this.lhs, o.lhs, (lE, rE) => lE.equals(rE))) return false;

        if (!arrEqual(this.rhs, o.rhs, (lE, rE) => lE.equals(rE))) return false;

        if (this.type && o.type) return this.type.equals(o.type);

        return this.type === o.type;
    }

    toString(): string {
        return `${this.lhs.map((e) => e.toString()).join(', ')} ${
            this.operation.lexeme
        } ${this.rhs.map((r) => r.toString()).join(', ')}`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitAssignStatement(this);
    }
}
