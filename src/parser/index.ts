import p from './parser.js';

export type Parser = {
    yy: Record<string, any>;
    parseError: (str: string, hash: any) => void;
    parse: (input: any) => any;
};

export type ParserError = Error & {
    hash: {
        text: string;
        token: string;
        line: number;
        loc: {
            first_line: number;
            last_line: number;
            first_column: 0;
            last_column: number;
        };
        expected: string[];
        recoverable: boolean;
    };
};

const parser = p as Parser;

export default parser;
