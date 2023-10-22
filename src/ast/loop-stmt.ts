import { Type } from '../type/index.js';
import { arrCopy } from '../util/index.js';
import { Block } from './block-stmt.js';
import {
    Declaration,
    Expression,
    Kind,
    Node,
    Statement,
    Visitor,
} from './index.js';

export type LoopStatement = 'LoopStatement';

export class LoopStmt implements Statement {
    public type: Type | null = null;

    constructor(
        public actLike: 'Undef' | 'While' | 'For',
        public init: Declaration | null,
        public cond: Expression | null,
        public post: Expression[] | null,
        public body: Block,
    ) {}

    kind(): Kind {
        return 'LoopStatement';
    }

    literal(): string {
        return '';
    }

    copy(): Node {
        const c = new LoopStmt(
            this.actLike,
            this.init?.copy() ?? null,
            this.cond?.copy() ?? null,
            this.post === null ? null : arrCopy(this.post, (e) => e.copy()),
            this.body.copy() as Block,
        );

        c.type = this.type?.copy() ?? null;

        return c;
    }

    equals(o: Node): boolean {
        if (!(o instanceof LoopStmt)) return false;

        if (this.actLike !== o.actLike) return false;

        if (!this.body.equals(o.body)) return false;

        if (this.type && o.type) return this.type.equals(o.type);

        return this.type === o.type;
    }

    toString(): string {
        switch (this.actLike) {
            case 'Undef': {
                return `loop ${this.body.toString()}`;
            }

            case 'While': {
                return `loop (${
                    this.cond?.toString() || ''
                }) ${this.body.toString()}`;
            }

            case 'For': {
                return `loop (${this.init?.toString() || ''}; ${
                    this.cond?.toString() || ''
                }; ${this.post
                    ?.map((p) => p.toString())
                    .join(', ')}) ${this.body.toString()}`;
            }
        }
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitLoopStatement(this);
    }
}
