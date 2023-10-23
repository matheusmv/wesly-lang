import { ArrayMember, ArrayInit } from '../ast/array-expr.js';
import { Assign } from '../ast/assign-stmt.js';
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
import { Node, Visitor } from '../ast/index.js';
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
import { VarDecl, ConstDecl } from '../ast/value-decl.js';
import { Env, Environment, Value } from '../object/environment.js';
import { Token } from '../lexer/token.js';
import {
    ArrayObject,
    BooleanObject,
    CharObject,
    FloatObject,
    FunctionObject,
    IntObject,
    NilObject,
    ObjectInstance,
    ObjectSpec,
    ReturnObject,
    StringObject,
} from '../object/index.js';
import { BoolType, FloatType, IntType, VoidType } from '../type/atomic.js';
import { FuncType } from '../type/func.js';
import { Type } from '../type/index.js';
import { ObjType } from '../type/object.js';
import {
    arrCopy,
    isError,
    isFloat,
    isFunc,
    isInt,
    isTruthy,
} from '../util/index.js';

export class Interpreter implements Visitor<Value | Error> {
    constructor(private env: Env<Value>) {}

    visitContinueStmt(node: ContinueStmt): Error | Value {
        throw new Error('Method not implemented.');
    }

    visitBreakStmt(node: BreakStmt): Error | Value {
        throw new Error('Method not implemented.');
    }

    visitVarDecl(node: VarDecl): Value | Error {
        const { names, values, type } = node.decl;

        const nms = names.map((expr) => (expr as Identifier).token);
        for (const name of nms) {
            if (this.env.exists(name))
                return new Error(`'${name.lexeme}': already defined`);
        }

        const vls = values.map((expr) => expr.accept(this));
        for (const vl of vls) {
            if (isError(vl)) return vl;
        }

        for (let i = 0; i < nms.length; i++) {
            const nm = nms[i];
            const vl = (vls[i] as Value).value;

            if (this.env.exists(nm)) {
                return new Error(
                    `'${
                        nm.lexeme
                    }': redeclared in this block\n\n\t${node.toString()}`,
                );
            }

            this.env.define(nm.lexeme, {
                type: type?.copy() as Type,
                value: vl.copy(),
            });
        }

        return {
            type: new VoidType(),
            value: new NilObject(),
        };
    }

    visitConstDecl(node: ConstDecl): Value | Error {
        throw new Error('Method not implemented.');
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

        const funcEnv = new Environment(this.env);

        this.env.define(name.name, {
            type: type?.copy() as Type,
            value: new FunctionObject(funcEnv, params, body, type as Type),
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

    execBlock(nodes: Node[], env: Env<Value>) {
        const prev = this.env;

        try {
            this.env = env;

            for (const node of nodes) {
                const vl = node.accept(this);
                if (isError(vl)) {
                    this.env = prev;
                    return vl;
                }
            }
        } finally {
            this.env = prev;
        }
    }

    visitBlockStmt(node: Block): Value | Error {
        const vl = this.execBlock(node.declarations, new Environment(this.env));
        if (isError(vl)) return vl;

        return {
            type: new VoidType(),
            value: new NilObject(),
        };
    }

    visitReturnStmt(node: ReturnStmt): Value | Error {
        if (!node.result) {
            throw new ReturnObject({
                type: new VoidType(),
                value: new NilObject(),
            });
        }

        const expr = node.result.accept(this);
        if (isError(expr)) throw expr;

        throw new ReturnObject({
            type: expr.type,
            value: expr.value,
        });
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

    visitLoopStatement(node: LoopStmt): Value | Error {
        throw new Error('Method not implemented.');
    }

    private execMemberAssign(
        op: Token,
        l: ObjectMember,
        r: Value,
    ): Value | Error {
        switch (op.lexeme) {
            case '=': {
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

            default: {
                return new Error(
                    `invalid operation: ${l.toString()} ${
                        op.lexeme
                    } ${r.value.toString()}`,
                );
            }
        }
    }

    private execAssign(op: Token, l: Value, r: Value): Value | Error {
        switch (op.lexeme) {
            case '=': {
                l.value = r.value;
                return l;
            }

            default: {
                return new Error(
                    `invalid operation: ${l.value.toString()} ${
                        op.lexeme
                    } ${r.value.toString()}`,
                );
            }
        }
    }

    visitAssignStatement(node: Assign): Value | Error {
        const { lhs, operation, rhs } = node;

        const lExprs = lhs.map((expr) => {
            if (expr instanceof ExprStmt) return expr.expr;
            return expr;
        });

        let rVals = rhs.map((expr) => expr.accept(this));
        for (const rVal of rVals) {
            if (isError(rVal)) return rVal;
        }
        rVals = arrCopy(rVals, (vl) => {
            const { type, value } = vl as Value;
            return {
                type: type?.copy(),
                value: value?.copy(),
            };
        });

        for (let i = 0; i < lhs.length; i++) {
            const l = lExprs[0];
            const r = rVals[0] as Value;

            if (l instanceof ObjectMember) {
                const result = this.execMemberAssign(operation, l, r);
                if (isError(result)) {
                    return new Error(
                        `invalid statement: ${node.toString()}, ${
                            result.message
                        }`,
                    );
                }
            } else {
                const lVal = l.accept(this);
                if (isError(lVal)) return lVal;

                const result = this.execAssign(operation, lVal, r);
                if (isError(result)) {
                    return new Error(
                        `invalid statement: ${node.toString()}, at ${
                            result.message
                        }`,
                    );
                }
            }
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
        throw new Error('Method not implemented.');
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
        const [arr, ...dim] = node.getMembers();

        const val = arr.accept(this);
        if (isError(val)) return val;

        const arrObj = val.value as ArrayObject;

        console.log(ArrayObject.dimensionSize(arrObj));

        return {
            type: new VoidType(),
            value: new NilObject(),
        };
    }

    visitCallExpression(node: Call): Value | Error {
        const { callee, args } = node;

        const val = callee.accept(this);
        if (isError(val)) return val;

        const func = val.value;
        if (!isFunc(func))
            return new Error(
                `invalid operation: cannot call non-function: ${callee.toString()}`,
            );

        const funcArgs = args.map((arg) => arg.accept(this));
        for (const arg of funcArgs) {
            if (isError(arg)) return arg;
        }

        const result = func.call(this, funcArgs as Value[]);
        if (isError(result)) return result;

        return {
            type: (func.type as FuncType)?.returnType,
            value: result,
        };
    }

    visitObjectMemberExpression(node: ObjectMember): Value | Error {
        const [obj, ...fields] = node.getMembers();

        const vl = obj.accept(this);
        if (isError(vl)) return vl;

        const objInMemory = vl.value as ObjectInstance;
        const names = fields.map((f) => (f as Identifier).name);
        const filedValue = objInMemory.getFiledIn(names);
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

        if (isError(objValue)) return objValue;

        return {
            type: vl.type?.copy(),
            value: objValue,
        };
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

        if (isError(objValue)) return objValue;

        return {
            type: type.copy(),
            value: objValue,
        };
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

        const funcEnv = new Environment(this.env);

        return {
            type: type?.copy() as Type,
            value: new FunctionObject(funcEnv, params, body, type as Type),
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
