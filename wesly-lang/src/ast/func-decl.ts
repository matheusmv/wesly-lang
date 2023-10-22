import { Type } from '../type/index.js';
import { Block } from './block-stmt.js';
import { FieldList } from './field-decl.js';
import { Declaration, Kind, Node, Visitor } from './index.js';
import { Identifier } from './literal.js';

export type FunctionDeclaration = 'FunctionDeclaration';

export class FuncDecl implements Declaration {
    public type: Type | null = null;

    constructor(
        public name: Identifier,
        public params: FieldList,
        public returnType: Type,
        public body: Block,
    ) {}

    kind(): Kind {
        return 'FunctionDeclaration';
    }

    literal(): string {
        return '';
    }

    copy(): Node {
        const c = new FuncDecl(
            this.name.copy() as Identifier,
            this.params.copy() as FieldList,
            this.returnType.copy(),
            this.body.copy() as Block,
        );
        c.type = this.type?.copy() ?? null;
        return c;
    }

    equals(o: Node): boolean {
        if (!(o instanceof FuncDecl)) return false;

        if (!this.name.equals(o.name)) return false;

        if (!this.params.equals(o.params)) return false;

        if (!this.returnType.equals(o.returnType)) return false;

        if (!this.body.equals(this.body)) return false;

        if (this.type && o.type) return this.type.equals(o.type);

        return this.type === o.type;
    }

    toString(): string {
        return `func ${this.name.toString()}(${this.params.toString()}) ${this.returnType.toString()} ${this.body.toString()}`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitFuncDecl(this);
    }
}
