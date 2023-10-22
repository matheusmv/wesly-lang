export class Token {
    constructor(
        public lexeme: string,
        public token: string,
        public length: number,
        public line: number,
        public loc: {
            first_line: number;
            last_line: number;
            first_column: number;
            last_column: number;
        },
    ) {}

    copy(): Token {
        return new Token(this.lexeme, this.token, this.length, this.line, {
            first_line: this.loc.first_line,
            last_line: this.loc.last_line,
            first_column: this.loc.first_column,
            last_column: this.loc.last_column,
        });
    }

    equals(o: Token): boolean {
        return (
            this.lexeme === o.lexeme &&
            this.token === o.token &&
            this.length === o.line &&
            this.loc.first_line === o.loc.first_line &&
            this.loc.last_line === o.loc.last_line &&
            this.loc.first_column === o.loc.first_column &&
            this.loc.last_column === o.loc.last_column
        );
    }

    toString(): string {
        return `Token{ lexeme: ${this.lexeme}, token: ${this.token} }`;
    }
}
