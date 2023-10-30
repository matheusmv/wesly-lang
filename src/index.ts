import parser, { ParserError } from './parser/index.js';

import { Token } from './lexer/token.js';

import AST, { Node } from './ast/index.js';
import Types from './type/index.js';

import { Environment } from './object/environment.js';
import { Interpreter } from './interpreter/index.js';
import { isError } from './util/index.js';
import {
    EnvProperty,
    copyFunc,
    lenFunc,
    printlnFunc,
} from './interpreter/global.js';

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

var alexCopyWithAnomObj = object {
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

println(numbers[2][2] == 9);
println(numbers[2][2] != 9);
println(numbers[2][2] | 9);
println(numbers[2][2] ^ 9);
println(numbers[2][2] & 9);
println(numbers[2][2] < 9);
println(numbers[2][2] > 9);
println(numbers[2][2] <= 9);
println(numbers[2][2] >= 9);
println(numbers[2][2] << 9);
println(numbers[2][2] >> 9);
println(numbers[2][2] + 9);
println(numbers[2][2] - 9);
println(numbers[2][2] * 9);
println(numbers[2][2] / 9);
println(numbers[2][2] % 9);

println("id: " + alex.id + ", username: " + alex.username);

var
    i int = numbers[2][2],
    j float = 1.1,
    k char = 'a',
    l string = "ok",
    m bool = false,
    n func(int,int):int = func(a, b int) int {
        return a + b;
    };

func fib(num int) int {
    if (num <= 1) {
        return num;
    }

    return fib(num - 1) + fib(num - 2);
}

println(fib(7));

println(alex.username);

var nums = []int{1, 2, 3};
nums[0] = 10;
println(nums);
nums[0] += 1;

func sum(arr []int) int {
    var result = 0;

    loop (var i = 0; i < len(arr); i++) {
        result += arr[i];
    }

    return result;
}

println(sum(nums));
println(len(alex.username));

const PI = 3.14;
println(PI);

const alexCopy = copy(alex);
alexCopy.username = "alexRef";
alexCopy.address.number = 158;
println(alex);
println(alexCopy);

const numsCopy = copy(nums);
numsCopy[0] = 1;
println(numsCopy);
println(nums);

var stringTest = "hello", stringTestCopy = stringTest;
stringTestCopy = "world";
println(stringTest);
println(stringTestCopy);

func setUsername(user User, username string) {
    if (user != nil) {
        user.username = username;
    }
}

func setValue(l, r string) {
    l = r;
}

setUsername(alexCopy, "alex copy");
println(alexCopy);
println(alex);

setValue(stringTest, "only arrays and obj's as ref");
println(stringTest);
`);

function setGlobalEnv(env: Environment, props: EnvProperty[]) {
    for (const { name, value } of props) {
        env.define(name, value);
    }
}

const globalEnv = new Environment();

setGlobalEnv(globalEnv, [printlnFunc(), lenFunc(), copyFunc()]);

const interpreter = new Interpreter(globalEnv);

function run(nodes: Node[], it: Interpreter) {
    for (const node of nodes) {
        const v = node.accept(it);
        if (isError(v)) {
            console.error(v);
            break;
        }
    }
}

run(decls, interpreter);
