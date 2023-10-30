import { ArrayMember, ArrayInit } from '../ast/array-expr.js';
import { Assign } from '../ast/assign-expr.js';
import { Binary } from '../ast/binary-expr.js';
import { Block } from '../ast/block-stmt.js';
import { BreakStmt } from '../ast/break-stmt.js';
import { Call } from '../ast/call-expr.js';
import { Cast } from '../ast/cast-expr.js';
import { Conditional } from '../ast/conditional-expr.js';
import { ContinueStmt } from '../ast/continue-stmt.js';
import { DeclStmt } from '../ast/decl-stmt.js';
import { ExprStmt } from '../ast/expr-stmt.js';
import { Field, FieldList } from '../ast/field-decl.js';
import { FuncDecl } from '../ast/func-decl.js';
import { FuncExpr } from '../ast/func-expr.js';
import { Group } from '../ast/group-expr.js';
import { IfStmt } from '../ast/if-stmt.js';
import { Expression, Node, Visitor } from '../ast/index.js';
import {
    Identifier,
    IntegerLiteral,
    FloatLiteral,
    CharLiteral,
    StringLiteral,
    BooleanLiteral,
    NilLiteral,
} from '../ast/literal.js';
import { Logical } from '../ast/logical-expr.js';
import { LoopStmt } from '../ast/loop-stmt.js';
import { ObjDecl } from '../ast/object-decl.js';
import {
    ObjectMember,
    ObjectInit,
    ObjectInlineInit,
    ObjectField,
} from '../ast/object-expr.js';
import { ReturnStmt } from '../ast/return-stmt.js';
import { Unary } from '../ast/unary-expr.js';
import { Update } from '../ast/update-expr.js';
import { VarDecl, ConstDecl, ValueSpec } from '../ast/value-decl.js';
import { Env, Environment, Value } from '../object/environment.js';
import { Token } from '../lexer/token.js';
import {
    ArrayObject,
    BooleanObject,
    BreakObject,
    CharObject,
    ContinueObject,
    FloatObject,
    FunctionObject,
    IntObject,
    NilObject,
    Obj,
    ObjectInstance,
    ObjectSpec,
    ReturnObject,
    StringObject,
} from '../object/index.js';
import {
    BoolType,
    FloatType,
    IntType,
    StringType,
    VoidType,
} from '../type/atomic.js';
import { FuncType } from '../type/func.js';
import { Type } from '../type/index.js';
import { ObjType } from '../type/object.js';
import {
    isBreak,
    isCallable,
    isChar,
    isContinue,
    isError,
    isFloat,
    isInt,
    isReturn,
    isString,
    isTruthy,
} from '../util/index.js';
import { ArrType } from '../type/array.js';

export class Interpreter implements Visitor<Value | Error> {
    constructor(public env: Env<Value>) {}

    private execDecl(
        decl: ValueSpec[],
        action: (
            token: Token,
            value: { type?: Type; value?: Expression },
        ) => void | Error,
    ): Value | Error {
        const names = decl.map((expr) => (expr.name as Identifier).token);
        for (const name of names) {
            if (this.env.exists(name)) {
                return new Error(`'${name.lexeme}': already defined`);
            }
        }

        const specTypeExprList = decl.map((spec) => ({
            type: spec.type,
            value: spec.value,
        }));

        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            const value = specTypeExprList[i];

            const result = action(name, value);
            if (isError(result)) return result;
        }

        return {
            type: new VoidType(),
            value: new NilObject(),
        };
    }

    visitVarDecl(node: VarDecl): Value | Error {
        const { decl } = node;

        return this.execDecl(decl, (name, value) => {
            if (this.env.exists(name)) {
                return new Error(
                    `'${
                        name.lexeme
                    }': redeclared in this block\n\n\t${node.toString()}`,
                );
            }

            if (!value.value) {
                this.env.define(name.lexeme, {
                    type: value.type?.copy() as Type,
                    value: new NilObject(),
                });
            } else {
                const exprVal = value.value.accept(this);
                if (isError(exprVal)) return exprVal;

                this.env.define(name.lexeme, {
                    type: exprVal.type?.copy(),
                    value: exprVal.value.copy(),
                });
            }
        });
    }

    visitConstDecl(node: ConstDecl): Value | Error {
        const { decl } = node;

        return this.execDecl(decl, (name, value) => {
            if (this.env.exists(name)) {
                return new Error(
                    `'${
                        name.lexeme
                    }': redeclared in this block\n\n\t${node.toString()}`,
                );
            }

            if (!value.value) {
                this.env.define(name.lexeme, {
                    type: value.type?.copy() as Type,
                    value: new NilObject(),
                    const: true,
                });
            } else {
                const exprVal = value.value.accept(this);
                if (isError(exprVal)) return exprVal;

                this.env.define(name.lexeme, {
                    type: exprVal.type?.copy(),
                    value: exprVal.value?.copy(),
                    const: true,
                });
            }
        });
    }

    visitFieldDecl(node: Field): Value | Error {
        throw new Error('Method not implemented.');
    }

    visitFieldListDecl(node: FieldList): Value | Error {
        throw new Error('Method not implemented.');
    }

    visitFuncDecl(node: FuncDecl): Value | Error {
        const { name, params, body, type } = node;

        if (this.env.exists(name.token))
            return new Error(`'${name.name}': already defined`);

        this.env.define(name.name, {
            type: type?.copy() as Type,
            value: new FunctionObject(params, body, type as Type),
        });

        return {
            type: new VoidType(),
            value: new NilObject(),
        };
    }

    visitObjDecl(node: ObjDecl): Value | Error {
        const { spec, type } = node;

        if (this.env.exists(spec.name.token)) {
            return new Error(`'${spec.name.toString()}': already defined`);
        }

        this.env.define(spec.name.name, {
            type: type?.copy() as Type,
            value: new ObjectSpec(spec.name.name, spec.type as ObjType),
        });

        return {
            type: new VoidType(),
            value: new NilObject(),
        };
    }

    visitDeclStmt(node: DeclStmt): Value | Error {
        return node.stmt.accept(this);
    }

    execBlock(nodes: Node[], env: Env<Value>): Value | Error {
        const prev = this.env;

        let vl = {} as Value | Error;
        let skip = false;

        try {
            this.env = env;

            for (const node of nodes) {
                if (!skip) {
                    vl = node.accept(this);
                } else {
                    skip = false;
                }

                if (isError(vl)) {
                    this.env = prev;
                    return vl;
                }

                if (isReturn(vl.value) || isBreak(vl.value)) {
                    this.env = prev;
                    return vl;
                }

                skip = isContinue(vl.value);
            }
        } finally {
            this.env = prev;
        }

        return vl;
    }

    visitBlockStmt(node: Block): Value | Error {
        return this.execBlock(node.declarations, new Environment(this.env));
    }

    visitContinueStmt(node: ContinueStmt): Error | Value {
        return {
            type: {} as Type,
            value: new ContinueObject(),
        };
    }

    visitBreakStmt(node: BreakStmt): Error | Value {
        return {
            type: {} as Type,
            value: new BreakObject(),
        };
    }

    visitReturnStmt(node: ReturnStmt): Value | Error {
        const { result } = node;

        if (!result) {
            return {
                type: new VoidType(),
                value: new ReturnObject({
                    type: new VoidType(),
                    value: new NilObject(),
                }),
            };
        }

        const rtrnValue = result.accept(this);
        if (isError(rtrnValue)) return rtrnValue;

        return {
            type: rtrnValue.type?.copy(),
            value: new ReturnObject({
                type: rtrnValue.type,
                value: rtrnValue.value,
            }),
        };
    }

    visitIfStatement(node: IfStmt): Value | Error {
        const cond = node.condition.accept(this);
        if (isError(cond)) return cond;

        if (isTruthy(cond.value)) {
            return node.thenBranch.accept(this);
        } else if (node.elseBranch) {
            return node.elseBranch?.accept(this);
        }

        return {
            type: new VoidType(),
            value: new NilObject(),
        };
    }

    private runAsUndef(body: Block) {
        for (;;) {
            const vl = body.accept(this);
            if (isError(vl)) return vl;
            if (isReturn(vl.value)) return vl;
            if (isBreak(vl.value)) {
                return {
                    type: new VoidType(),
                    value: new NilObject(),
                };
            }
        }
    }

    private execLoop(cond: Expression, body: Block, post?: () => void) {
        let result: Value | Error = {
            type: new VoidType(),
            value: new NilObject(),
        };

        for (;;) {
            result = cond.accept(this);
            if (isError(result)) return result;

            if (!isTruthy(result.value)) {
                break;
            }

            result = body.accept(this);

            if (isError(result)) return result;
            if (isReturn(result.value)) return result;
            if (isBreak(result.value)) {
                return {
                    type: new VoidType(),
                    value: new NilObject(),
                };
            }

            if (post) post();
        }

        return {
            type: new VoidType(),
            value: new NilObject(),
        };
    }

    visitLoopStatement(node: LoopStmt): Value | Error {
        const { actLike, init, cond, post, body } = node;

        switch (actLike) {
            case 'Undef': {
                return this.runAsUndef(body);
            }

            case 'While': {
                if (cond) {
                    return this.execLoop(cond, body);
                }

                break;
            }

            case 'For': {
                if (!init && !cond && !post) {
                    return this.runAsUndef(body);
                }

                const prev = this.env;
                this.env = new Environment(prev);

                try {
                    if (init) {
                        const vl = init.accept(this);
                        if (isError(vl)) return vl;
                    }

                    if (cond) {
                        return this.execLoop(cond, body, () => {
                            if (post) {
                                const vls = post.map((expr) =>
                                    expr.accept(this),
                                );
                                for (const vl of vls) {
                                    if (isError(vl)) return vl;
                                }
                            }
                        });
                    }
                } finally {
                    this.env = prev;
                }

                break;
            }

            default:
                return new Error(`invalid statement: ${node.toString()}`);
        }

        return {
            type: new VoidType(),
            value: new NilObject(),
        };
    }

    private execMemberAssign(l: ObjectMember, r: Value): Value | Error {
        const [obj, ...fields] = l.getMembers();

        const vl = obj.accept(this);
        if (isError(vl)) return vl;

        const objInMemory = vl.value as ObjectInstance;
        const names = fields.map((f) => (f as Identifier).name);
        const filedValue = objInMemory.findAndSet(
            names,
            names[names.length - 1],
            r.value,
        );
        if (isError(filedValue)) return filedValue;

        return r;
    }

    private execArrayAssign(l: ArrayMember, r: Value): Value | Error {
        const [arr, ...indxs] = l.getMembers();

        const vl = arr.accept(this);
        if (isError(vl)) return vl;

        const arrInMemory = vl.value as ArrayObject;
        const indxsVls = indxs.map((expr) => expr.accept(this));
        for (const idx of indxsVls) {
            if (isError(idx)) return idx;
        }

        const indexes = (indxsVls as Value[]).map(
            (vl) => (vl.value as IntObject).value,
        );

        const result = arrInMemory.findIndexAndSetValue(indexes, r.value);
        if (isError(result)) return result;

        return r;
    }

    private execAssign(l: Value, r: Value): Value | Error {
        if (l.const) {
            return new Error(`assignment to constant variable`);
        }

        l.value = r.value;
        return l;
    }

    private readonly opTable = new Map<string, string>([
        ['+=', '+'],
        ['-=', '-'],
        ['*=', '*'],
        ['/=', '/'],
        ['%=', '%'],
        ['&=', '&'],
        ['|=', '|'],
        ['^=', '^'],
        ['<<=', '<<'],
        ['>>=', '>>'],
    ]);

    private parseRhsOperation(
        lhs: Expression,
        operation: Token,
        rhs: Expression,
    ): Binary | Expression {
        if (operation.lexeme === '=') {
            return rhs;
        }

        const newOp = operation.copy();
        newOp.lexeme = this.opTable.get(newOp.lexeme) as string;
        return new Binary(lhs, newOp, rhs);
    }

    visitAssignExpression(node: Assign): Value | Error {
        const { lhs, operation, rhs } = node;

        const lExpr = lhs instanceof ExprStmt ? lhs.expr : lhs;

        let rVal = this.parseRhsOperation(lhs, operation, rhs).accept(this);
        if (isError(rVal)) return rVal;

        // TODO: define values and references
        rVal = { type: rVal.type?.copy(), value: rVal.value?.copy() };

        let result: Value | Error;

        if (lExpr instanceof ObjectMember) {
            result = this.execMemberAssign(lExpr, rVal);
        } else if (lExpr instanceof ArrayMember) {
            result = this.execArrayAssign(lExpr, rVal);
        } else {
            const lVal = lExpr.accept(this);
            if (isError(lVal)) return lVal;

            result = this.execAssign(lVal, rVal);
        }

        if (isError(result)) {
            return new Error(
                `invalid expression: ${node.toString()}, ${result.message}`,
            );
        }

        return {
            type: new VoidType(),
            value: new NilObject(),
        };
    }

    visitExpressionStatement(node: ExprStmt): Value | Error {
        return node.expr.accept(this);
    }

    visitConditionalExpression(node: Conditional): Value | Error {
        const cond = node.expression.accept(this);
        if (isError(cond)) return cond;

        if (isTruthy(cond.value)) {
            return node.isTrue.accept(this);
        } else {
            return node.isFalse.accept(this);
        }
    }

    visitLogicalExpression(node: Logical): Value | Error {
        const lExpr = node.left.accept(this);
        if (isError(lExpr)) return lExpr;

        const rExpr = node.right.accept(this);
        if (isError(rExpr)) return rExpr;

        switch (node.operator.lexeme) {
            case '&&':
                return {
                    type: new BoolType(),
                    value: new BooleanObject(
                        isTruthy(lExpr.value) && isTruthy(rExpr.value),
                    ),
                };
            case '||':
                return {
                    type: new BoolType(),
                    value: new BooleanObject(
                        isTruthy(lExpr.value) || isTruthy(rExpr.value),
                    ),
                };
            default:
                return new Error(`invalid expression: ${node.toString()}`);
        }
    }

    visitBinaryExpression(node: Binary): Value | Error {
        const { token, left, right } = node;

        const lVal = left.accept(this);
        if (isError(lVal)) return lVal;

        const rVal = right.accept(this);
        if (isError(rVal)) return rVal;

        switch (token.lexeme) {
            case '==': {
                return {
                    type: new BoolType(),
                    value: new BooleanObject(lVal.value.equals(rVal.value)),
                };
            }

            case '!=': {
                return {
                    type: new BoolType(),
                    value: new BooleanObject(!lVal.value.equals(rVal.value)),
                };
            }

            case '|': {
                const isErr = this.checkBinaryOp(token, lVal.value, rVal.value);
                if (isErr) return isErr;

                const result =
                    (lVal.value as IntObject).value |
                    (rVal.value as IntObject).value;

                return {
                    type: new IntType(),
                    value: new IntObject(result),
                };
            }

            case '^': {
                const isErr = this.checkBinaryOp(token, lVal.value, rVal.value);
                if (isErr) return isErr;

                const result =
                    (lVal.value as IntObject).value ^
                    (rVal.value as IntObject).value;

                return {
                    type: new IntType(),
                    value: new IntObject(result),
                };
            }

            case '&': {
                const isErr = this.checkBinaryOp(token, lVal.value, rVal.value);
                if (isErr) return isErr;

                const result =
                    (lVal.value as IntObject).value &
                    (rVal.value as IntObject).value;

                return {
                    type: new IntType(),
                    value: new IntObject(result),
                };
            }

            case '<': {
                const isErr = this.checkBinaryOp(token, lVal.value, rVal.value);
                if (isErr) return isErr;

                const result =
                    this.getValueOfNumber(lVal.value) <
                    this.getValueOfNumber(rVal.value);

                return {
                    type: new BoolType(),
                    value: new BooleanObject(result),
                };
            }

            case '>': {
                const isErr = this.checkBinaryOp(token, lVal.value, rVal.value);
                if (isErr) return isErr;

                const result =
                    this.getValueOfNumber(lVal.value) >
                    this.getValueOfNumber(rVal.value);

                return {
                    type: new BoolType(),
                    value: new BooleanObject(result),
                };
            }

            case '<=': {
                const isErr = this.checkBinaryOp(token, lVal.value, rVal.value);
                if (isErr) return isErr;

                const result =
                    this.getValueOfNumber(lVal.value) <=
                    this.getValueOfNumber(rVal.value);

                return {
                    type: new BoolType(),
                    value: new BooleanObject(result),
                };
            }

            case '>=': {
                const isErr = this.checkBinaryOp(token, lVal.value, rVal.value);
                if (isErr) return isErr;

                const result =
                    this.getValueOfNumber(lVal.value) >=
                    this.getValueOfNumber(rVal.value);

                return {
                    type: new BoolType(),
                    value: new BooleanObject(result),
                };
            }

            case '<<': {
                const isErr = this.checkBinaryOp(token, lVal.value, rVal.value);
                if (isErr) return isErr;

                const result =
                    this.getValueOfNumber(lVal.value) <<
                    this.getValueOfNumber(rVal.value);

                return {
                    type: new IntType(),
                    value: new IntObject(result),
                };
            }

            case '>>': {
                const isErr = this.checkBinaryOp(token, lVal.value, rVal.value);
                if (isErr) return isErr;

                const result =
                    this.getValueOfNumber(lVal.value) >>
                    this.getValueOfNumber(rVal.value);

                return {
                    type: new IntType(),
                    value: new IntObject(result),
                };
            }

            case '+': {
                const isErr = this.checkBinaryOp(token, lVal.value, rVal.value);
                if (isErr) return isErr;

                const lStrOrChr = isString(lVal.value) || isChar(lVal.value);
                const rStrOrChr = isString(rVal.value) || isChar(rVal.value);
                if (lStrOrChr && rStrOrChr) {
                    const result =
                        this.getValurOfStr(lVal.value) +
                        this.getValurOfStr(rVal.value);

                    return {
                        type: new StringType(),
                        value: new StringObject(result),
                    };
                }

                if (lStrOrChr && !rStrOrChr) {
                    const result =
                        this.getValurOfStr(lVal.value) +
                        this.getValueOfNumber(rVal.value);

                    return {
                        type: new StringType(),
                        value: new StringObject(result),
                    };
                }

                if (!lStrOrChr && rStrOrChr) {
                    const result =
                        this.getValueOfNumber(lVal.value) +
                        this.getValurOfStr(rVal.value);

                    return {
                        type: new StringType(),
                        value: new StringObject(result),
                    };
                }

                const result =
                    this.getValueOfNumber(lVal.value) +
                    this.getValueOfNumber(rVal.value);

                if (isFloat(lVal.value) || isFloat(rVal.value)) {
                    return {
                        type: new FloatType(),
                        value: new FloatObject(result),
                    };
                }

                return {
                    type: new IntType(),
                    value: new IntObject(result),
                };
            }

            case '-': {
                const isErr = this.checkBinaryOp(token, lVal.value, rVal.value);
                if (isErr) return isErr;

                const result =
                    this.getValueOfNumber(lVal.value) -
                    this.getValueOfNumber(rVal.value);

                if (isFloat(lVal.value) || isFloat(rVal.value)) {
                    return {
                        type: new FloatType(),
                        value: new FloatObject(result),
                    };
                }

                return {
                    type: new IntType(),
                    value: new IntObject(result),
                };
            }

            case '*': {
                const isErr = this.checkBinaryOp(token, lVal.value, rVal.value);
                if (isErr) return isErr;

                const result =
                    this.getValueOfNumber(lVal.value) *
                    this.getValueOfNumber(rVal.value);

                if (isFloat(lVal.value) || isFloat(rVal.value)) {
                    return {
                        type: new FloatType(),
                        value: new FloatObject(result),
                    };
                }

                return {
                    type: new IntType(),
                    value: new IntObject(result),
                };
            }

            case '/': {
                const isErr = this.checkBinaryOp(token, lVal.value, rVal.value);
                if (isErr) return isErr;

                if (this.getValueOfNumber(rVal.value) === 0) {
                    return new Error(
                        `${lVal.value.toString()} ${
                            token.lexeme
                        } ${rVal.value.toString()}: division by zero`,
                    );
                }

                const result =
                    this.getValueOfNumber(lVal.value) /
                    this.getValueOfNumber(rVal.value);

                if (isFloat(lVal.value) || isFloat(rVal.value)) {
                    return {
                        type: new FloatType(),
                        value: new FloatObject(result),
                    };
                }

                return {
                    type: new IntType(),
                    value: new IntObject(result),
                };
            }

            case '%': {
                const isErr = this.checkBinaryOp(token, lVal.value, rVal.value);
                if (isErr) return isErr;

                const result =
                    this.getValueOfNumber(lVal.value) %
                    this.getValueOfNumber(rVal.value);

                if (isFloat(lVal.value) || isFloat(rVal.value)) {
                    return {
                        type: new FloatType(),
                        value: new FloatObject(result),
                    };
                }

                return {
                    type: new IntType(),
                    value: new IntObject(result),
                };
            }

            default: {
                return new Error(`invalid expression: ${node.toString()}`);
            }
        }
    }

    private getValueOfNumber(o: Obj): number {
        if (isInt(o)) return o.value;

        return (o as FloatObject).value;
    }

    private getValurOfStr(o: Obj): string {
        if (isString(o)) return o.value;

        return (o as CharObject).value;
    }

    private checkBinaryOp(
        operator: Token,
        left: Obj,
        right: Obj,
    ): undefined | Error {
        switch (operator.lexeme) {
            case '|': {
                if (!isInt(left) || !isInt(right))
                    return new Error(
                        `bad operand types for binary operator '${
                            operator.lexeme
                        }'
                            ${left.toString()} ${
                                operator.lexeme
                            } ${right.toString()}`,
                    );
                return;
            }

            case '^': {
                if (!isInt(left) || !isInt(right))
                    return new Error(
                        `bad operand types for binary operator '${
                            operator.lexeme
                        }'
                            ${left.toString()} ${
                                operator.lexeme
                            } ${right.toString()}`,
                    );
                return;
            }

            case '&': {
                if (!isInt(left) || !isInt(right))
                    return new Error(
                        `bad operand types for binary operator '${
                            operator.lexeme
                        }'
                            ${left.toString()} ${
                                operator.lexeme
                            } ${right.toString()}`,
                    );
                return;
            }

            case '<': {
                return this.checkNumberOperands(operator, left, right);
            }

            case '>': {
                return this.checkNumberOperands(operator, left, right);
            }

            case '<=': {
                return this.checkNumberOperands(operator, left, right);
            }

            case '>=': {
                return this.checkNumberOperands(operator, left, right);
            }

            case '<<': {
                if (!isInt(left) || !isInt(right))
                    return new Error(
                        `bad operand types for binary operator '${
                            operator.lexeme
                        }'
                            ${left.toString()} ${
                                operator.lexeme
                            } ${right.toString()}`,
                    );
                return;
            }

            case '>>': {
                if (!isInt(left) || !isInt(right))
                    return new Error(
                        `bad operand types for binary operator '${
                            operator.lexeme
                        }'
                            ${left.toString()} ${
                                operator.lexeme
                            } ${right.toString()}`,
                    );
                return;
            }

            case '+': {
                const lStrOrChr = isString(left) || isChar(left);
                const rStrOrChr = isString(right) || isChar(right);
                if (lStrOrChr || rStrOrChr) return;

                return this.checkNumberOperands(operator, left, right);
            }

            case '-': {
                return this.checkNumberOperands(operator, left, right);
            }

            case '*': {
                return this.checkNumberOperands(operator, left, right);
            }

            case '/': {
                return this.checkNumberOperands(operator, left, right);
            }

            case '%': {
                return this.checkNumberOperands(operator, left, right);
            }

            default: {
                return new Error(
                    `invalid expression: ${left.toString()} ${
                        operator.lexeme
                    } ${right.toString()}`,
                );
            }
        }
    }

    private checkNumberOperands(
        operator: Token,
        l: Obj,
        r: Obj,
    ): undefined | Error {
        const lIsNumber = l instanceof IntObject || l instanceof FloatObject;
        const rIsNumber = r instanceof IntObject || r instanceof FloatObject;
        if (lIsNumber && rIsNumber) return;
        return new Error(
            `${operator.lexeme}: operands must be numbers
                ${l.toString()} ${operator.lexeme} ${r.toString()}`,
        );
    }

    visitUnaryExpression(node: Unary): Value | Error {
        const { operator, expression } = node;

        const val = expression.accept(this);
        if (isError(val)) return val;

        if (operator.lexeme === '+') {
            if (isInt(val.value)) {
                return {
                    type: new IntType(),
                    value: new IntObject(val.value.value),
                };
            }
            if (isFloat(val.value)) {
                return {
                    type: new FloatType(),
                    value: new FloatObject(val.value.value),
                };
            }
        }

        if (operator.lexeme === '-') {
            if (isInt(val.value)) {
                return {
                    type: new IntType(),
                    value: new IntObject(-val.value.value),
                };
            }
            if (isFloat(val.value)) {
                return {
                    type: new FloatType(),
                    value: new FloatObject(-val.value.value),
                };
            }
        }

        if (operator.lexeme === '~') {
            if (isInt(val.value)) {
                return {
                    type: new IntType(),
                    value: new IntObject(~val.value.value),
                };
            }
        }

        if (operator.lexeme === '!') {
            return {
                type: new BoolType(),
                value: new BooleanObject(!isTruthy(val.value)),
            };
        }

        return new Error(`invalid expression: ${node.toString()}`);
    }

    visitUpdateExpression(node: Update): Value | Error {
        const { expression, operator } = node;

        const val = expression.accept(this);
        if (isError(val)) return val;

        if (operator.lexeme === '++') {
            if (isInt(val.value)) {
                return {
                    type: new IntType(),
                    value: new IntObject(val.value.value++),
                };
            }

            if (isFloat(val.value)) {
                return {
                    type: new FloatType(),
                    value: new FloatObject(val.value.value++),
                };
            }
        }

        if (operator.lexeme === '--') {
            if (isInt(val.value)) {
                return {
                    type: new IntType(),
                    value: new IntObject(val.value.value--),
                };
            }

            if (isFloat(val.value)) {
                return {
                    type: new FloatType(),
                    value: new FloatObject(val.value.value--),
                };
            }
        }

        return new Error(`invalid expression: ${node.toString()}`);
    }

    visitCastExpression(node: Cast): Value | Error {
        throw new Error('Method not implemented.');
    }

    visitArrayMemberExpression(node: ArrayMember): Value | Error {
        const [arr, ...indexExprs] = node.getMembers();

        let arrObj = this.getArrayObject(arr);
        if (isError(arrObj)) return arrObj;

        if (this.isArrayDimensionTooSmall(arrObj, indexExprs.length - 1)) {
            return new Error(
                `out of bounds ${node.toString()} : ${arrObj.toString()}`,
            );
        }

        let result: Obj | undefined;
        for (const indexExpr of indexExprs) {
            const index = this.getIntegerValueFromIndexExpression(indexExpr);
            if (isError(index)) return index;

            if (0 > index || index > arrObj.objects.length - 1) {
                return new Error(
                    `out of bounds ${index} : ${arrObj.toString()}`,
                );
            }

            result = arrObj.objects[index];
            if (result instanceof ArrayObject) {
                arrObj = result;
            }
        }

        if (!result) {
            return new Error(`invalid expression: ${node.toString()}`);
        }

        return {
            type: (arrObj.type as ArrType)?.type.copy(),
            value: result,
        };
    }

    private getArrayObject(array: Expression): ArrayObject | Error {
        const arrayVal = array.accept(this);
        if (isError(arrayVal)) return arrayVal;

        if (!(arrayVal.value instanceof ArrayObject)) {
            return new Error(
                `invalid expression: ${arrayVal.value.toString()} is not indexable`,
            );
        }

        return arrayVal.value;
    }

    private isArrayDimensionTooSmall(
        array: ArrayObject,
        level: number,
    ): boolean {
        return ArrayObject.dimensionSize(array) < level;
    }

    private getIntegerValueFromIndexExpression(
        index: Expression,
    ): number | Error {
        const indexVal = index.accept(this);
        if (isError(indexVal)) return indexVal;

        if (!(indexVal.value instanceof IntObject)) {
            return new Error(
                `array index access must be an integer, got: ${indexVal.type?.toString()}`,
            );
        }

        return (indexVal.value as IntObject).value;
    }

    visitCallExpression(node: Call): Value | Error {
        const { callee, args } = node;

        const val = callee.accept(this);
        if (isError(val)) return val;

        const func = val.value;
        if (!isCallable(func))
            return new Error(
                `invalid operation: cannot call non-function: ${callee.toString()}`,
            );

        const funcArgs = args.map((arg) => arg.accept(this));
        for (const arg of funcArgs) {
            if (isError(arg)) return arg;
        }

        const result = func.call(this, funcArgs as Value[]);
        if (isError(result)) return result;

        return result;
    }

    visitObjectMemberExpression(node: ObjectMember): Value | Error {
        const [obj, ...fields] = node.getMembers();

        const vl = obj.accept(this);
        if (isError(vl)) return vl;

        const objInMemory = vl.value as ObjectInstance;
        const names = fields.map((f) => (f as Identifier).name);
        const filedValue = objInMemory.getFieldIn(names);
        if (isError(filedValue)) return filedValue;

        return {
            type: {} as Type,
            value: filedValue,
        };
    }

    visitGroupExpression(node: Group): Value | Error {
        const expr = node.expression.accept(this);
        if (isError(expr)) return expr;
        return expr;
    }

    visitObjectInitExpression(node: ObjectInit): Value | Error {
        const { name, fields } = node;

        const vl = name.accept(this);
        if (isError(vl)) return vl;

        if (!(vl.value instanceof ObjectSpec))
            return new Error(`not a TypeSpec: ${name.toString()}`);

        const vls = fields.map((of) => of.value.accept(this));
        for (const vl of vls) {
            if (isError(vl)) return vl;
        }

        const objConstructor = vl.value;
        const specFields = fields.map((of) => of.name.name);
        const specValues = vls.map((vl) => (vl as Value).value);
        const objValue = objConstructor.callWithNamedArgs(
            this,
            specFields,
            specValues,
        );

        return objValue;
    }

    visitObjectInlineInitExpression(node: ObjectInlineInit): Value | Error {
        const { type, fields } = node;

        const vls = fields.map((of) => of.value.accept(this));
        for (const vl of vls) {
            if (isError(vl)) return vl;
        }

        const specFields = fields.map((of) => of.name.name);
        const specValues = vls.map((vl) => (vl as Value).value);
        const objValue = new ObjectSpec(
            '',
            type.copy() as ObjType,
        ).callWithNamedArgs(this, specFields, specValues);

        return objValue;
    }

    visitObjectFieldExpression(node: ObjectField): Value | Error {
        throw new Error('Method not implemented.');
    }

    visitArrayInitExpression(node: ArrayInit): Value | Error {
        const { elements, type } = node;

        const vls = elements.map((expr) => expr.accept(this));
        for (const vl of vls) {
            if (isError(vl)) return vl;
        }
        const objs = vls.map((vl) => (vl as Value).value);

        return {
            type: type as Type,
            value: new ArrayObject(objs, type as Type),
        };
    }

    visitFunctionExpression(node: FuncExpr): Value | Error {
        const { params, body, type } = node;

        return {
            type: type?.copy() as Type,
            value: new FunctionObject(params, body, type as Type),
        };
    }

    visitIdentifier(node: Identifier): Value | Error {
        const v = this.env.get(node.token);
        if (isError(v)) return v;
        return v;
    }

    visitIntegerLiteral(node: IntegerLiteral): Value {
        return {
            type: node.type,
            value: new IntObject(node.value),
        };
    }

    visitFloatLiteral(node: FloatLiteral): Value {
        return {
            type: node.type,
            value: new FloatObject(node.value),
        };
    }

    visitCharLiteral(node: CharLiteral): Value {
        return {
            type: node.type,
            value: new CharObject(node.value),
        };
    }

    visitStringLiteral(node: StringLiteral): Value {
        return {
            type: node.type,
            value: new StringObject(node.value),
        };
    }

    visitBooleanLiteral(node: BooleanLiteral): Value {
        return {
            type: node.type,
            value: new BooleanObject(node.value),
        };
    }

    visitNilLiteral(node: NilLiteral): Value {
        return {
            type: node.type,
            value: new NilObject(),
        };
    }
}
