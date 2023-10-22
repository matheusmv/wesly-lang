import { readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";

const parserDir = './parser.js';
const __dirname = dirname(parserDir);
const filePath = resolve(__dirname, "src", "parser", parserDir);

let parserDirContent = readFileSync(filePath, "utf-8");

parserDirContent =
  "// @ts-nocheck\n" + parserDirContent + "\n export default parser";

parserDirContent = parserDirContent.replace(
  /if \(typeof require(.|\n)*export default parser/,
  "export default parser;\n"
);

writeFileSync(filePath, parserDirContent);
