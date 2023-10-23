import parser, { ParserError } from './parser/index.js';

import { Token } from './lexer/token.js';

import AST, { Node } from './ast/index.js';
import Types from './type/index.js';

import { Environment } from './object/environment.js';
import { Interpreter } from './interpreter/index.js';
import { isError } from './util/index.js';

parser.yy = {
    Token,
    AST,
    Types,
};

function runParser(expr: string) {
    try {
        return parser.parse(expr) as Node[];
    } catch (err) {
        const parserError = err as ParserError;

        console.error(parserError.message);
        console.error(parserError.hash);

        return [];
    }
}

const decls = runParser(`
object Address {
    number int
    zip string
}

object User {
    id int
    username, password string
    address Address
}

func NewUser(id int, username, password string, address Address) User {
    return User{
        id: id,
        username: username,
        password: password,
        address: address,
    };
}

func NewAddress(number int, zip string) Address {
    return Address{
        number: number,
        zip: zip,
    };
}

var alex = NewUser(1, "alex", "12345", NewAddress(145, "12444-777"));

var alexCopyWithAnomObj = object{
    id int
    username, password string
    address Address
}{
    id: alex.id,
    username: alex.username,
    password: alex.password,
    address: object {
        number int
        zip string
    }{
        number: alex.address.number,
        zip: alex.address.zip,
    },
};

alexCopyWithAnomObj.username = "alex-copy";

var numbers = [][]int{
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9},
};

numbers[2][2];
`);

const globalEnv = new Environment();
const interpreter = new Interpreter(globalEnv);

function run(nodes: Node[], it: Interpreter) {
    for (const node of nodes) {
        const v = node.accept(it);
        if (isError(v)) {
            console.error(v);
            break;
        } else {
            console.log(v.value.toString());
        }
    }
}

run(decls, interpreter);
