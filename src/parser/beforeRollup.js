import { readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';

const parserDir = './parser.js';
const __dirname = dirname(parserDir);
const filePath = resolve(__dirname, 'src', 'parser', parserDir);

let parserDirContent = readFileSync(filePath, 'utf-8');

// parserDirContent = '// @ts-nocheck\n' + parserDirContent;

const es6ExportMod = `\
export const lexer = parser.lexer;
export { parser };
`;

parserDirContent = parserDirContent.replace(
    /_token_stack:/,
    '',
);

parserDirContent = parserDirContent.replace(
    /if \(typeof require(.|\n)*/,
    es6ExportMod,
);

writeFileSync(filePath, parserDirContent);
