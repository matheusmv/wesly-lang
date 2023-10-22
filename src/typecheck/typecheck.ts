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
import { Visitor } from '../ast/index.js';
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
import { Env, Value } from '../object/environment.js';
import { Type } from '../type/index.js';
import { isError } from '../util/index.js';

export class TypeCheck implements Visitor<Type | Error> {
    constructor(public env: Env<Value>) {}

    visitContinueStmt(node: ContinueStmt): Type | Error {
        throw new Error('Method not implemented.');
    }

    visitBreakStmt(node: BreakStmt): Type | Error {
        throw new Error('Method not implemented.');
    }

    visitVarDecl(node: VarDecl): Type | Error {
        throw new Error('Method not implemented.');
    }

    visitConstDecl(node: ConstDecl): Type | Error {
        throw new Error('Method not implemented.');
    }

    visitFieldDecl(node: Field): Type | Error {
        throw new Error('Method not implemented.');
    }

    visitFieldListDecl(node: FieldList): Type | Error {
        throw new Error('Method not implemented.');
    }

    visitFuncDecl(node: FuncDecl): Type | Error {
        throw new Error('Method not implemented.');
    }

    visitObjDecl(node: ObjDecl): Type | Error {
        throw new Error('Method not implemented.');
    }

    visitDeclStmt(node: DeclStmt): Type | Error {
        throw new Error('Method not implemented.');
    }

    visitBlockStmt(node: Block): Type | Error {
        throw new Error('Method not implemented.');
    }

    visitReturnStmt(node: ReturnStmt): Type | Error {
        throw new Error('Method not implemented.');
    }

    visitIfStatement(node: IfStmt): Type | Error {
        throw new Error('Method not implemented.');
    }

    visitLoopStatement(node: LoopStmt): Type | Error {
        throw new Error('Method not implemented.');
    }

    visitAssignStatement(node: Assign): Type | Error {
        throw new Error('Method not implemented.');
    }

    visitExpressionStatement(node: ExprStmt): Type | Error {
        throw new Error('Method not implemented.');
    }

    visitConditionalExpression(node: Conditional): Type | Error {
        throw new Error('Method not implemented.');
    }

    visitLogicalExpression(node: Logical): Type | Error {
        throw new Error('Method not implemented.');
    }

    visitBinaryExpression(node: Binary): Type | Error {
        throw new Error('Method not implemented.');
    }

    visitUnaryExpression(node: Unary): Type | Error {
        throw new Error('Method not implemented.');
    }

    visitUpdateExpression(node: Update): Type | Error {
        throw new Error('Method not implemented.');
    }

    visitCastExpression(node: Cast): Type | Error {
        throw new Error('Method not implemented.');
    }

    visitArrayMemberExpression(node: ArrayMember): Type | Error {
        throw new Error('Method not implemented.');
    }

    visitCallExpression(node: Call): Type | Error {
        throw new Error('Method not implemented.');
    }

    visitObjectMemberExpression(node: ObjectMember): Type | Error {
        throw new Error('Method not implemented.');
    }

    visitGroupExpression(node: Group): Type | Error {
        throw new Error('Method not implemented.');
    }

    visitObjectInitExpression(node: ObjectInit): Type | Error {
        throw new Error('Method not implemented.');
    }

    visitObjectInlineInitExpression(node: ObjectInlineInit): Type | Error {
        throw new Error('Method not implemented.');
    }

    visitObjectFieldExpression(node: ObjectField): Type | Error {
        throw new Error('Method not implemented.');
    }

    visitArrayInitExpression(node: ArrayInit): Type | Error {
        throw new Error('Method not implemented.');
    }

    visitFunctionExpression(node: FuncExpr): Type | Error {
        throw new Error('Method not implemented.');
    }

    visitIdentifier(node: Identifier): Type | Error {
        const v = this.env.get(node.token);
        if (isError(v)) return v;
        return v.type;
    }

    visitIntegerLiteral(node: IntegerLiteral): Type | Error {
        return node.type;
    }

    visitFloatLiteral(node: FloatLiteral): Type | Error {
        return node.type;
    }

    visitCharLiteral(node: CharLiteral): Type | Error {
        return node.type;
    }

    visitStringLiteral(node: StringLiteral): Type | Error {
        return node.type;
    }

    visitBooleanLiteral(node: BooleanLiteral): Type | Error {
        return node.type;
    }

    visitNilLiteral(node: NilLiteral): Type | Error {
        return node.type;
    }
}
