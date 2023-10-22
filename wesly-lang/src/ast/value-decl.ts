import { Type } from '../type/index.js';
import { arrCopy, arrEqual } from '../util/index.js';
import { Declaration, Expression, Kind, Node, Visitor } from './index.js';

export type ValueDeclaration = 'VarDeclaration' | 'ConstDeclaration';

export class VarDecl implements Declaration {
    public type: Type | null = null;

    constructor(public decl: ValueSpec) {}

    kind(): Kind {
        return 'VarDeclaration';
    }

    literal(): string {
        return '';
    }

    copy(): Node {
        const c = new VarDecl(this.decl.copy());
        c.type = this.type?.copy() ?? null;
        return c;
    }

    equals(o: Node): boolean {
        if (!(o instanceof VarDecl)) return false;

        if (!this.decl.equals(o.decl)) return false;

        if (this.type && o.type) return this.type.equals(o.type);

        return this.type === o.type;
    }

    toString(): string {
        return `var ${this.decl.toString()}`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitVarDecl(this);
    }
}

export class ConstDecl implements Declaration {
    public type: Type | null = null;

    constructor(public decl: ValueSpec) {}

    kind(): Kind {
        return 'ConstDeclaration';
    }

    literal(): string {
        return '';
    }

    copy(): Node {
        const c = new ConstDecl(this.decl.copy());
        c.type = this.type?.copy() ?? null;
        return c;
    }

    equals(o: Node): boolean {
        if (!(o instanceof ConstDecl)) return false;

        if (!this.decl.equals(o.decl)) return false;

        if (this.type && o.type) return this.type.equals(o.type);

        return this.type === o.type;
    }

    toString(): string {
        return `const ${this.decl.toString()}`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitConstDecl(this);
    }
}

export class ValueSpec {
    constructor(
        public valueType: 'var' | 'const',
        public names: Expression[],
        public values: Expression[],
        public type?: Type,
    ) {}

    private getTypeAsString(): string {
        if (!this.type) return '';

        return ` ${this.type.toString()}`;
    }

    copy(): ValueSpec {
        return new ValueSpec(
            this.valueType,
            arrCopy(this.names, (e) => e.copy()),
            arrCopy(this.values, (e) => e.copy()),
            this.type?.copy(),
        );
    }

    equals(o: ValueSpec): boolean {
        if (!arrEqual(this.names, o.names, (lE, rE) => lE.equals(rE)))
            return false;

        if (!arrEqual(this.values, o.values, (lE, rE) => lE.equals(rE)))
            return false;

        if (this.type && o.type) return this.type?.equals(o.type);

        return this.type === this.type;
    }

    toString(): string {
        return `${this.names
            .map((nm) => nm.toString())
            .join(', ')}${this.getTypeAsString()} = ${this.values
            .map((vl) => vl.toString())
            .join(', ')}`;
    }
}
