import { Type } from '../type/index.js';
import { TypeSpec } from '../type/spec.js';
import { Declaration, Kind, Node, Visitor } from './index.js';

export type ObjectDeclaration = 'ObjectDeclaration';

export class ObjDecl implements Declaration {
    public type: Type | null = null;

    constructor(public spec: TypeSpec) {}

    kind(): Kind {
        return 'ObjectDeclaration';
    }

    literal(): string {
        return '';
    }

    copy(): Node {
        const c = new ObjDecl(this.spec.copy() as TypeSpec);
        c.type = this.type?.copy() ?? null;
        return c;
    }

    equals(o: Node): boolean {
        if (!(o instanceof ObjDecl)) return false;

        if (!this.spec.equals(o.spec)) return false;

        if (this.type && o.type) return this.type.equals(o.type);

        return this.type === o.type;
    }

    toString(): string {
        return `object ${this.spec.toString()}`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitObjDecl(this);
    }
}
