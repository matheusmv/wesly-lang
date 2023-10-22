import { Type } from '../type/index.js';
import { arrCopy, arrEqual } from '../util/index.js';
import { Declaration, Kind, Node, Visitor } from './index.js';
import { Identifier } from './literal.js';

export type FieldDeclaration = 'FieldDeclaration' | 'FieldListDeclaration';

export class Field implements Declaration {
    constructor(
        public names: Identifier[],
        public type: Type,
    ) {}

    kind(): Kind {
        return 'FieldDeclaration';
    }

    literal(): string {
        return '';
    }

    copy(): Node {
        return new Field(
            arrCopy(this.names, (i) => i.copy() as Identifier),
            this.type.copy(),
        );
    }

    equals(o: Node): boolean {
        if (!(o instanceof Field)) return false;

        if (this.type.equals(o.type)) return false;

        if (!arrEqual(this.names, o.names, (lI, rI) => lI.equals(rI)))
            return false;

        if (this.type && o.type) return this.type.equals(o.type);

        return this.type === o.type;
    }

    parseNames(): { name: string; type: Type }[] {
        const result: { name: string; type: Type }[] = [];

        for (const name of this.names) {
            result.push({ name: name.name, type: this.type });
        }

        return result;
    }

    toString(): string {
        return `${this.names
            .map((nm) => nm.toString())
            .join(', ')} ${this.type.toString()}`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitFieldDecl(this);
    }
}

export class FieldList implements Declaration {
    public type: Type | null = null;

    constructor(public list: Field[]) {}

    kind(): Kind {
        return 'FieldListDeclaration';
    }

    literal(): string {
        return '';
    }

    parseList(): { name: string; type: Type }[] {
        const result: { name: string; type: Type }[] = [];

        for (const field of this.list) {
            result.push(...field.parseNames());
        }

        return result;
    }

    copy(): Node {
        const c = new FieldList(arrCopy(this.list, (f) => f.copy() as Field));
        c.type = this.type?.copy() ?? null;
        return c;
    }

    equals(o: Node): boolean {
        if (this.type && o.type) return this.type.equals(o.type);

        return this.type === o.type;
    }

    toString(): string {
        return `${this.list.map((field) => field.toString()).join(', ')}`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitFieldListDecl(this);
    }
}
