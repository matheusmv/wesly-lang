import { Token } from '../lexer/token.js';
import { Obj } from './index.js';
import { Type } from '../type/index.js';

export type Value = {
    type: Type;
    value: Obj;
};

export interface Env<T> {
    define(name: string, value: T): void;
    get(name: Token): T | Error;
    assign(name: Token, value: T): T | Error;
    exists(name: Token): boolean;
}

export class Environment implements Env<Value> {
    private readonly values = new Map<string, Value>();

    constructor(private enclosing?: Env<Value>) {}

    define(name: string, value: Value): void {
        this.values.set(name, value);
    }

    get(name: Token): Value | Error {
        const v = this.values.get(name.lexeme);
        if (v) return v;

        if (this.enclosing) {
            return this.enclosing.get(name);
        }

        return new Error(`${name.lexeme} is not defined`);
    }

    assign(name: Token, value: Value): Value | Error {
        const v = this.values.get(name.lexeme);
        if (v) {
            v.value = value.value;
            return v;
        }

        if (this.enclosing) {
            return this.enclosing.assign(name, value);
        }

        return new Error(`${name.lexeme} is not defined`);
    }

    exists(name: Token): boolean {
        return this.values.has(name.lexeme);
    }
}
