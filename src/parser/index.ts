import * as parser from './parser.js';

type Parser = {
    yy: Record<string, any>;
    parseError: (str: string, hash: any) => void;
    parse: (input: any) => any;
};

type ParserError = Error & {
    hash: {
        text: string;
        token: string;
        line: number;
        loc: {
            first_line: number;
            last_line: number;
            first_column: number;
            last_column: number;
        };
        expected: string[];
        recoverable: boolean;
    };
};

export type { ParserError };

export default parser.parser as Parser;
