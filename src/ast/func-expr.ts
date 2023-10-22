import { Type } from '../type/index.js';
import { Block } from './block-stmt.js';
import { FieldList } from './field-decl.js';
import { Expression, Kind, Node, Visitor } from './index.js';

export type FunctionExpression = 'FunctionExpression';

export class FuncExpr implements Expression {
    public type: Type | null = null;

    constructor(
        public params: FieldList,
        public returnType: Type,
        public body: Block,
    ) {}

    kind(): Kind {
        return 'FunctionExpression';
    }

    literal(): string {
        return '';
    }

    copy(): Node {
        const c = new FuncExpr(
            this.params.copy() as FieldList,
            this.returnType.copy(),
            this.body.copy() as Block,
        );
        c.type = this.type?.copy() ?? null;
        return c;
    }

    equals(o: Node): boolean {
        if (!(o instanceof FuncExpr)) return false;

        if (!this.params.equals(o.params)) return false;

        if (!this.returnType.equals(o.returnType)) return false;

        if (!this.body.equals(o.body)) return false;

        if (this.type && o.type) return this.type.equals(o.type);

        return this.type === o.type;
    }

    toString(): string {
        return `func(${this.params.toString()}) ${this.returnType.toString()} ${this.body.toString()}`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitFunctionExpression(this);
    }
}
