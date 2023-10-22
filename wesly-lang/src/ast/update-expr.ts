import { Token } from '../lexer/token.js';
import { Type } from '../type/index.js';
import { Expression, Kind, Node, Visitor } from './index.js';

export type UpdateExpression = 'UpdateExpression';

export class Update implements Expression {
    public type: Type | null = null;

    constructor(
        public expression: Expression,
        public operator: Token,
    ) {}

    kind(): Kind {
        return 'UpdateExpression';
    }

    literal(): string {
        return '';
    }

    copy(): Node {
        return new Update(this.expression.copy(), this.operator.copy());
    }

    equals(o: Node): boolean {
        if (!(o instanceof Update)) return false;

        return (
            this.expression.equals(o.expression) &&
            this.operator.equals(o.operator)
        );
    }

    toString(): string {
        return `${this.expression.toString()}${this.operator.lexeme}`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitUpdateExpression(this);
    }
}
