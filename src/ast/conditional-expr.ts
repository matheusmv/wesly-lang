import { Type } from '../type/index.js';
import { Expression, Kind, Node, Visitor } from './index.js';

export type ConditionalExpression = 'ConditionalExpression';

export class Conditional implements Expression {
    public type: Type | null = null;

    constructor(
        public expression: Expression,
        public isTrue: Expression,
        public isFalse: Expression,
    ) {}

    kind(): Kind {
        return 'ConditionalExpression';
    }

    literal(): string {
        return '';
    }

    copy(): Node {
        const c = new Conditional(
            this.expression.copy(),
            this.isTrue.copy(),
            this.isFalse.copy(),
        );
        c.type = this.type?.copy() ?? null;
        return c;
    }

    equals(o: Node): boolean {
        if (!(o instanceof Conditional)) return false;

        if (!this.expression.equals(o.expression)) return false;

        if (!this.isTrue.equals(o.isTrue)) return false;

        if (!this.isFalse.equals(o.isFalse)) return false;

        if (this.type && o.type) return this.type.equals(o.type);

        return this.type === o.type;
    }

    toString(): string {
        return `${this.expression.toString()} ? ${this.isTrue.toString()} : ${this.isFalse.toString()}`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitConditionalExpression(this);
    }
}
