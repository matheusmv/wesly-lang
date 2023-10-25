import { FieldDeclaration, Field, FieldList } from './field-decl.js';

import {
    ValueDeclaration,
    VarDecl,
    ConstDecl,
    ValueSpec,
} from './value-decl.js';

import { FunctionDeclaration, FuncDecl } from './func-decl.js';

import { DeclarationStatement, DeclStmt } from './decl-stmt.js';

import { BlockStatement, Block } from './block-stmt.js';

import { ReturnStatement, ReturnStmt } from './return-stmt.js';

import { BreakStatement, BreakStmt } from './break-stmt.js';

import { ContinueStatement, ContinueStmt } from './continue-stmt.js';

import { IfStatement, IfStmt } from './if-stmt.js';

import { LoopStatement, LoopStmt } from './loop-stmt.js';

import { ExpressionStatement, ExprStmt } from './expr-stmt.js';

import { AssignExpression, Assign } from './assign-expr.js';

import { ConditionalExpression, Conditional } from './conditional-expr.js';

import { LogicalExpression, Logical } from './logical-expr.js';

import { BinaryExpression, Binary } from './binary-expr.js';

import { UnaryExpression, Unary } from './unary-expr.js';

import { CallExpression, Call } from './call-expr.js';

import { CastExpression, Cast } from './cast-expr.js';

import { UpdateExpression, Update } from './update-expr.js';

import { GroupExpression, Group } from './group-expr.js';

import {
    ObjectExpression,
    ObjectInit,
    ObjectInlineInit,
    ObjectField,
    ObjectMember,
} from './object-expr.js';

import { ArrayExpression, ArrayInit, ArrayMember } from './array-expr.js';

import { FunctionExpression, FuncExpr } from './func-expr.js';

import {
    LiteralExpression,
    Identifier,
    IntegerLiteral,
    FloatLiteral,
    CharLiteral,
    StringLiteral,
    BooleanLiteral,
    NilLiteral,
} from './literal.js';
import { Type } from '../type/index.js';
import { ObjDecl, ObjectDeclaration } from './object-decl.js';

export type Kind =
    | ValueDeclaration
    | FieldDeclaration
    | FunctionDeclaration
    | ObjectDeclaration
    | DeclarationStatement
    | BlockStatement
    | ReturnStatement
    | BreakStatement
    | ContinueStatement
    | IfStatement
    | LoopStatement
    | ExpressionStatement
    | AssignExpression
    | ConditionalExpression
    | LogicalExpression
    | BinaryExpression
    | UnaryExpression
    | CallExpression
    | CastExpression
    | UpdateExpression
    | GroupExpression
    | ObjectExpression
    | ArrayExpression
    | FunctionExpression
    | LiteralExpression;

export interface Node {
    type?: Type | null;
    kind(): Kind;
    literal(): string;
    copy(): Node;
    equals(o: Node): boolean;
    toString(): string;
    accept<R>(v: Visitor<R>): R;
}

export interface Declaration extends Node {}
export interface Statement extends Node {}
export interface Expression extends Node {}

export interface Visitor<R> {
    visitVarDecl(node: VarDecl): R;
    visitConstDecl(node: ConstDecl): R;
    visitFieldDecl(node: Field): R;
    visitFieldListDecl(node: FieldList): R;
    visitFuncDecl(node: FuncDecl): R;
    visitObjDecl(node: ObjDecl): R;
    visitDeclStmt(node: DeclStmt): R;
    visitBlockStmt(node: Block): R;
    visitReturnStmt(node: ReturnStmt): R;
    visitContinueStmt(node: ContinueStmt): R;
    visitBreakStmt(node: BreakStmt): R;
    visitIfStatement(node: IfStmt): R;
    visitLoopStatement(node: LoopStmt): R;
    visitAssignExpression(node: Assign): R;
    visitExpressionStatement(node: ExprStmt): R;
    visitConditionalExpression(node: Conditional): R;
    visitLogicalExpression(node: Logical): R;
    visitBinaryExpression(node: Binary): R;
    visitUnaryExpression(node: Unary): R;
    visitUpdateExpression(node: Update): R;
    visitCastExpression(node: Cast): R;
    visitArrayMemberExpression(node: ArrayMember): R;
    visitCallExpression(node: Call): R;
    visitObjectMemberExpression(node: ObjectMember): R;
    visitGroupExpression(node: Group): R;
    visitObjectInitExpression(node: ObjectInit): R;
    visitObjectInlineInitExpression(node: ObjectInlineInit): R;
    visitObjectFieldExpression(node: ObjectField): R;
    visitArrayInitExpression(node: ArrayInit): R;
    visitFunctionExpression(node: FuncExpr): R;
    visitIdentifier(node: Identifier): R;
    visitIntegerLiteral(node: IntegerLiteral): R;
    visitFloatLiteral(node: FloatLiteral): R;
    visitCharLiteral(node: CharLiteral): R;
    visitStringLiteral(node: StringLiteral): R;
    visitBooleanLiteral(node: BooleanLiteral): R;
    visitNilLiteral(node: NilLiteral): R;
}

export default {
    VarDecl,
    ConstDecl,
    ValueSpec,
    FuncDecl,
    ObjDecl,
    Field,
    FieldList,
    DeclStmt,
    Block,
    ReturnStmt,
    BreakStmt,
    ContinueStmt,
    IfStmt,
    LoopStmt,
    Assign,
    ExprStmt,
    Conditional,
    Logical,
    Binary,
    Unary,
    Call,
    ObjectMember,
    Cast,
    Update,
    Group,
    ObjectInit,
    ObjectInlineInit,
    ObjectField,
    ArrayInit,
    ArrayMember,
    FuncExpr,
    Identifier,
    IntegerLiteral,
    FloatLiteral,
    CharLiteral,
    StringLiteral,
    BooleanLiteral,
    NilLiteral,
};
