import { Token } from '../lexer/token.js';
import {
    BoolType,
    CharType,
    FloatType,
    IntType,
    StringType,
    VoidType,
} from '../type/atomic.js';
import { Type } from '../type/index.js';
import { Expression, Kind, Node, Visitor } from './index.js';

export type LiteralExpression =
    | 'Identifier'
    | 'IntegerLiteral'
    | 'FloatLiteral'
    | 'CharLiteral'
    | 'StringLiteral'
    | 'BooleanLiteral'
    | 'NilLiteral';

export class Identifier implements Expression {
    public type: Type | null = null;
    public name: string;

    constructor(public token: Token) {
        this.name = token.lexeme;
    }

    kind(): Kind {
        return 'Identifier';
    }

    literal(): string {
        return this.token.lexeme;
    }

    copy(): Node {
        const c = new Identifier(this.token);
        c.type = this.type?.copy() ?? null;
        return c;
    }

    equals(o: Node): boolean {
        if (!(o instanceof Identifier)) return false;

        if (this.type && o.type)
            return this.name === o.name && this.type?.equals(o.type);

        return this.name === o.name && this.type == o.type;
    }

    toString(): string {
        return this.token.lexeme;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitIdentifier(this);
    }
}

export class IntegerLiteral implements Expression {
    public type = new IntType();
    public value: number;

    constructor(public token: Token) {
        if (isHexadecimal(token.lexeme)) {
            this.value = parseInt(token.lexeme, 16);
        } else if (isBinary(token.lexeme)) {
            this.value = parseInt(token.lexeme.replace('0b', ''), 2);
        } else if (isOctal(token.lexeme)) {
            this.value = parseInt(token.lexeme.replace('0o', ''), 8);
        } else {
            this.value = Number(token.lexeme);
        }
    }

    kind(): Kind {
        return 'IntegerLiteral';
    }

    copy(): Node {
        return new IntegerLiteral(this.token.copy());
    }

    equals(o: Node): boolean {
        if (!(o instanceof IntegerLiteral)) return false;

        return this.value === o.value;
    }

    literal(): string {
        return this.token.lexeme;
    }

    toString(): string {
        return `${this.value}`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitIntegerLiteral(this);
    }
}

function isHexadecimal(input: string): boolean {
    const hexRegex = /^(0x)[0-9A-Fa-f]+$/;
    return hexRegex.test(input);
}

function isBinary(input: string): boolean {
    const binRegex = /^(0b)[01]+$/;
    return binRegex.test(input);
}

function isOctal(input: string): boolean {
    const binRegex = /^(0o)[0-7]+$/;
    return binRegex.test(input);
}

export class FloatLiteral implements Expression {
    public type = new FloatType();
    public value: number;

    constructor(public token: Token) {
        this.value = Number(token.lexeme);
    }

    kind(): Kind {
        return 'FloatLiteral';
    }

    literal(): string {
        return this.token.lexeme;
    }

    copy(): Node {
        return new FloatLiteral(this.token.copy());
    }

    equals(o: Node): boolean {
        if (!(o instanceof FloatLiteral)) return false;

        return this.value === o.value;
    }

    toString(): string {
        return `${this.value}`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitFloatLiteral(this);
    }
}

export class CharLiteral implements Expression {
    public type = new CharType();
    public value: string;

    constructor(public token: Token) {
        this.value = token.lexeme;
    }

    kind(): Kind {
        return 'CharLiteral';
    }

    literal(): string {
        return this.token.lexeme;
    }

    copy(): Node {
        return new CharLiteral(this.token.copy());
    }

    equals(o: Node): boolean {
        if (!(o instanceof CharLiteral)) return false;

        return this.value === o.value;
    }

    toString(): string {
        return `'${this.value}'`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitCharLiteral(this);
    }
}

export class StringLiteral implements Expression {
    public type = new StringType();
    public value: string;

    constructor(public token: Token) {
        this.value = token.lexeme;
    }

    kind(): Kind {
        return 'StringLiteral';
    }

    literal(): string {
        return this.token.lexeme;
    }

    copy(): Node {
        return new StringLiteral(this.token.copy());
    }

    equals(o: Node): boolean {
        if (!(o instanceof StringLiteral)) return false;

        return this.value === o.value;
    }

    toString(): string {
        return `"${this.token.lexeme}"`;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitStringLiteral(this);
    }
}

export class BooleanLiteral implements Expression {
    public type = new BoolType();
    public value: boolean;

    constructor(public token: Token) {
        this.value = token.lexeme === 'true';
    }

    kind(): Kind {
        return 'BooleanLiteral';
    }

    literal(): string {
        return this.token.lexeme;
    }

    copy(): Node {
        return new BooleanLiteral(this.token.copy());
    }

    equals(o: Node): boolean {
        if (!(o instanceof BooleanLiteral)) return false;

        return this.value === o.value;
    }

    toString(): string {
        return this.token.lexeme;
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitBooleanLiteral(this);
    }
}

export class NilLiteral implements Expression {
    public type = new VoidType();
    constructor(public token?: Token) {}

    kind(): Kind {
        return 'NilLiteral';
    }

    literal(): string {
        return 'nil';
    }

    copy(): Node {
        return new NilLiteral(this.token?.copy());
    }

    equals(o: Node): boolean {
        return o instanceof NilLiteral;
    }

    toString(): string {
        return 'nil';
    }

    accept<R>(v: Visitor<R>): R {
        return v.visitNilLiteral(this);
    }
}
