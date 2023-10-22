import { Expression } from '../ast/index.js';
import {
    BooleanLiteral,
    CharLiteral,
    FloatLiteral,
    IntegerLiteral,
    NilLiteral,
    StringLiteral,
} from '../ast/literal.js';
import { Token } from '../lexer/token.js';
import { Type } from '../type/index.js';

export type TokenInfo = {
    length: number;
    line: number;
    loc: {
        first_line: number;
        last_line: number;
        first_column: number;
        last_column: number;
    };
};

export function getZeroValue(type: Type, tokInf: TokenInfo): Expression {
    switch (type.kind()) {
        case 'IntegerType':
            return new IntegerLiteral(
                new Token('0', 'INT', tokInf.length, tokInf.line, tokInf.loc),
            );
        case 'FloatType':
            return new FloatLiteral(
                new Token(
                    '0.0',
                    'FLOAT',
                    tokInf.length,
                    tokInf.line,
                    tokInf.loc,
                ),
            );
        case 'CharType':
            return new CharLiteral(
                new Token('', 'CHAR', tokInf.length, tokInf.line, tokInf.loc),
            );
        case 'StringType':
            return new StringLiteral(
                new Token('', 'STRING', tokInf.length, tokInf.line, tokInf.loc),
            );
        case 'BoolType':
            return new BooleanLiteral(
                new Token(
                    'false',
                    'BOOL',
                    tokInf.length,
                    tokInf.line,
                    tokInf.loc,
                ),
            );
        default:
            return new NilLiteral(
                new Token('nil', 'NIL', tokInf.length, tokInf.line, tokInf.loc),
            );
    }
}
