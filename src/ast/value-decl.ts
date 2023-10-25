import { Type } from '../type/index.js';
import { arrCopy, arrEqual } from '../util/index.js';
import { Declaration, Expression, Kind, Node, Visitor } from './index.js';

export type ValueDeclaration = 'VarDeclaration' | 'ConstDeclaration';

export class VarDecl implements Declaration {
    public type: Type | null = null;

    constructor(public decl: ValueSpec[]) {}

    kind(): Kind {
        return 'VarDeclaration';
    }

    literal(): string {
        return '';
    }

    copy(): Node {
        const c = new VarDecl(arrCopy(this.decl, (v) => v.copy()));
        c.type = this.type?.copy() ?? null;
        return c;
    }

    equals(o: Node): boolean {
        if (!(o instanceof VarDecl)) return false;

        if (!arrEqual(this.decl, o.decl, (l, r) => l.equals(r))) return false;

        if (this.type && o.type) return this.type.equals(o.type);

        return this.type === o.type;
    }

    toString(): string {
        return `var ${this.decl.map((d) => d.toString()).join(', ')}`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitVarDecl(this);
    }
}

export class ConstDecl implements Declaration {
    public type: Type | null = null;

    constructor(public decl: ValueSpec[]) {}

    kind(): Kind {
        return 'ConstDeclaration';
    }

    literal(): string {
        return '';
    }

    copy(): Node {
        const c = new ConstDecl(arrCopy(this.decl, (v) => v.copy()));
        c.type = this.type?.copy() ?? null;
        return c;
    }

    equals(o: Node): boolean {
        if (!(o instanceof ConstDecl)) return false;

        if (!arrEqual(this.decl, o.decl, (l, r) => l.equals(r))) return false;

        if (this.type && o.type) return this.type.equals(o.type);

        return this.type === o.type;
    }

    toString(): string {
        return `const ${this.decl.map((d) => d.toString()).join(', ')}`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitConstDecl(this);
    }
}

export class ValueSpec {
    constructor(
        public valueType: 'var' | 'const',
        public name: Expression,
        public value?: Expression,
        public type?: Type,
    ) {}

    private getTypeAsString(): string {
        if (!this.type) return '';

        return ` ${this.type.toString()}`;
    }

    copy(): ValueSpec {
        return new ValueSpec(
            this.valueType,
            this.name.copy(),
            this.value?.copy(),
            this.type?.copy(),
        );
    }

    equals(o: ValueSpec): boolean {
        if (!this.name.equals(o.name)) return false;

        if (this.value && o.value) {
            if (!this.value.equals(o.value)) return false;
        } else {
            // should get zero value on typecheck
            return false;
        }

        if (this.type && o.type) return this.type?.equals(o.type);

        return this.type === this.type;
    }

    toString(): string {
        return `${this.name.toString()}${this.getTypeAsString()} = ${
            this.value?.toString() || 'nil'
        }`;
    }
}
