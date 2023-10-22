import { Type } from '../type/index.js';
import { arrCopy, arrEqual } from '../util/index.js';
import { Expression, Kind, Node, Visitor } from './index.js';

export type ArrayExpression = 'ArrayInitExpression' | 'ArrayMemberExpression';

export class ArrayInit implements Expression {
    constructor(
        public type: Type | null,
        public elements: Expression[],
    ) {}

    kind(): Kind {
        return 'ArrayInitExpression';
    }

    literal(): string {
        return '';
    }

    copy(): Node {
        return new ArrayInit(
            this.type?.copy() ?? null,
            arrCopy(this.elements, (e) => e.copy()),
        );
    }

    equals(o: Node): boolean {
        if (!(o instanceof ArrayInit)) return false;

        if (!arrEqual(this.elements, o.elements, (lE, rE) => lE.equals(rE)))
            return false;

        if (this.type && o.type) return this.type.equals(o.type);

        return this.type === o.type;
    }

    private getTypeAsString(): string {
        if (!this.type) return '';

        return this.type.toString();
    }

    toString(): string {
        return `${this.getTypeAsString()}{ ${this.elements
            .map((elem) => elem.toString())
            .join(', ')} }`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitArrayInitExpression(this);
    }
}

export class ArrayMember implements Expression {
    public type: Type | null = null;

    constructor(
        public object: Expression,
        public next: ArrayMember,
    ) {}

    kind(): Kind {
        return 'ArrayMemberExpression';
    }

    literal(): string {
        return '';
    }

    copy(): Node {
        const c = new ArrayMember(
            this.object.copy(),
            this.next.copy() as ArrayMember,
        );
        c.type = this.type?.copy() ?? null;
        return c;
    }

    equals(o: Node): boolean {
        if (!(o instanceof ArrayMember)) return false;

        if (!this.object.equals(o.object)) return false;

        if (!this.next.equals(o.next)) return false;

        if (this.type && o.type) return this.type.equals(o.type);

        return this.type === o.type;
    }

    getMembers(): Expression[] {
        let member = this.next;
        const result = [this.object];

        while (member.next !== undefined) {
            result.unshift(member.object);
            member = member.next;
        }

        result.unshift(member);

        return result;
    }

    toString(): string {
        return `${this.getMembers()
            .map((memb, index) => {
                if (index === 0) return memb.toString();
                return `[${memb.toString()}]`;
            })
            .join('')}`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitArrayMemberExpression(this);
    }
}
