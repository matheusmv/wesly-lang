import { Type } from '../type/index.js';
import { Expression, Kind, Node, Visitor } from './index.js';

export type CastExpression = 'CastExpression';

export class Cast implements Expression {
    constructor(
        public target: Expression,
        public type: Type,
    ) {}

    kind(): Kind {
        return 'CastExpression';
    }

    literal(): string {
        return '';
    }

    copy(): Node {
        return new Cast(this.target.copy(), this.type.copy());
    }

    equals(o: Node): boolean {
        if (!(o instanceof Cast)) return false;

        if (!this.target.equals(o.target)) return false;

        return this.type.equals(o.type);
    }

    toString(): string {
        return `${this.target.toString()}.(${this.type.toString()})`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitCastExpression(this);
    }
}
