%lex
%%

\s+                         /* skip whitespace */

\/\/(.*)                    /* single line comment */
\/\*([^*]|\*+[^*/])*\*+\/   /* multi line comment */

"&="                        return '&='
"|="                        return '|='
"^="                        return '^='
"<<="                       return '<<='
">>="                       return '>>='
"<<"                        return '<<'
">>"                        return '>>'
"+="                        return '+='
"-="                        return '-='
"*="                        return '*='
"/="                        return '/='
"%="                        return '%='
"++"                        return '++'
"--"                        return '--'
"||"                        return '||'
"&&"                        return '&&'
"=="                        return '=='
"!="                        return '!='
"<="                        return '<='
">="                        return '>='
"..."                       return '...'

"+"                         return '+'
"-"                         return '-'
"*"                         return '*'
"/"                         return '/'
"%"                         return '%'

"~"                         return '~'
"&"                         return '&'
"|"                         return '|'
"^"                         return '^'

"?"                         return '?'

"<"                         return '<'
">"                         return '>'
"="                         return '='
"!"                         return '!'

"("                         return '('
"["                         return '['
"{"                         return '{'

")"                         return ')'
"]"                         return ']'
"}"                         return '}'

","                         return ','
"."                         return '.'
";"                         return ';'
":"                         return ':'

"var"                       return 'var'
"const"                     return 'const'
"if"                        return 'if'
"else"                      return 'else'
"func"                      return 'func'
"return"                    return 'return'
"loop"                      return 'loop'
"break"                     return 'break'
"continue"                  return 'continue'
"nil"                       return 'nil'
"true"                      return 'true'
"false"                     return 'false'
"object"                    return 'object'

"int"                       return 'int'
"float"                     return 'float'
"char"                      return 'char'
"string"                    return 'string'
"bool"                      return 'bool'
"void"                      return 'void'

\'([^'\\]|\\.)*\'           return 'CHAR'
\"([^"\\]|\\.)*\"           return 'STRING'
_*[a-zA-Z][_a-zA-Z0-9]*     return 'IDENT'
[0-9]*\.[0-9]+              return 'FLOAT'
'0x'[0-9A-Fa-f]+            return 'HEX'
'0b'[01]+                   return 'BIN'
'0o'[0-7]+                  return 'OCT'
[0-9]+                      return 'INT'

<<EOF>>                     return 'EOF'
.                           return 'INVALID'

/lex

%start Program

%%

Program
    : EOF
        {
            {
                return [];
            }
        }
    | Declarations EOF
        {
            {
                return $1;
            }
        }
    ;

Sep
    : ';'
    ;

TypeDeclaration
    : Identifier
        {
            {
                $$ = $1;
            }
        }
    | AtomicType
        {
            {
                $$ = $1;
            }
        }
    | FunctionType
        {
            {
                $$ = $1;
            }
        }
    | ObjectType
        {
            {
                $$ = $1;
            }
        }
    | ArrayType
        {
            {
                $$ = $1;
            }
        }
    ;

AtomicType
    : 'int'
        {
            {
                $$ = new yy.Types.IntType();
            }
        }
    | 'float'
        {
            {
                $$ = new yy.Types.FloatType();
            }
        }
    | 'char'
        {
            {
                $$ = new yy.Types.CharType();
            }
        }
    | 'string'
        {
            {
                $$ = new yy.Types.StringType();
            }
        }
    | 'bool'
        {
            {
                $$ = new yy.Types.BoolType();
            }
        }
    | 'void'
        {
            {
                $$ = new yy.Types.VoidType();
            }
        }
    ;

FunctionType
    : 'func' '(' FunctionTypeParameterList ')' FunctionReturnType
        {
            {
                $$ = new yy.Types.FuncType($3, $5);
            }
        }
    ;

FunctionTypeParameterList
    : %empty
        {
            {
                $$ = [];
            }
        }
    | TypeDeclaration
        {
            {
                $$ = [$1];
            }
        }
    | FunctionTypeParameterList ',' TypeDeclaration
        {
            {
                $1.push($3);
                $$ = $1;
            }
        }
    ;

FunctionReturnType
    : %empty
        {
            {
                $$ = new yy.Types.VoidType();
            }
        }
    | ':' TypeDeclaration
        {
            {
                $$ = $2;
            }
        }
    ;

ObjectType
    : 'object' '{' '}'
        {
            {
                const fieldList = new yy.AST.FieldList([]);
                $$ = new yy.Types.ObjType(fieldList);
            }
        }
    | 'object' '{' ObjectFieldDeclarationList '}'
        {
            {
                const fieldList = new yy.AST.FieldList($3);
                $$ = new yy.Types.ObjType(fieldList);
            }
        }
    ;

NamedTypeList
    : NamedType
        {
            {
                $$ = [$1];
            }
        }
    | NamedTypeList NamedType
        {
            {
                $1.push($2);
                $$ = $1;
            }
        }
    ;

NamedType
    : IDENT TypeDeclaration
        {
            {
                $$ = new yy.Types.TypeSpec($1, $2);
            }
        }
    | IDENT TypeDeclaration Sep
        {
            {
                $$ = new yy.Types.TypeSpec($1, $2);
            }
        }
    ;

ArrayType
    : ArrayDimensionList ValidArrayType
        {
            {
                let arrayType = new yy.Types.ArrType($2, $1.pop());
                for (let i = $1.length; i > 0; i--) {
                    arrayType = new yy.Types.ArrType(arrayType, $1.pop());
                }
                $$ = arrayType;
            }
        }
    ;

ArrayDimensionList
    : ArrayDimension
        {
            {
                $$ = [$1];
            }
        }
    | ArrayDimensionList ArrayDimension
        {
            {
                $1.push($2);
                $$ = $1;
            }
        }
    ;

ArrayDimension
    : '[' ']'
        {
            {
                $$ = null;
            }
        }
    | '[' INT ']'
        {
            {
                const intToken = new yy.Token($2, 'INT', yyleng, yylineno, yy.lexer.yylloc);
                $$ = new yy.AST.IntegerLiteral(intToken);
            }
        }
    ;

ValidArrayType
    : Identifier
        {
            {
                $$ = $1;
            }
        }
    | AtomicType
        {
            {
                $$ = $1;
            }
        }
    | FunctionType
        {
            {
                $$ = $1;
            }
        }
    | ObjectType
        {
            {
                $$ = $1;
            }
        }
    ;

Declarations
    : Declaration
        {
            {
                $$ = [$1];
            }
        }
    | Declarations Declaration
        {
            {
                $1.push($2);
                $$ = $1;
            }
        }
    ;

Declaration
    : VarDeclaration Sep
        {
            {
                $$ = $1;
            }
        }
    | ConstDeclaration Sep
        {
            {
                $$ = $1;
            }
        }
    | FunctionDeclaration
        {
            {
                $$ = $1;
            }
        }
    | ObjectDeclaration
        {
            {
                $$ = $1;
            }
        }
    | Statement
        {
            {
                $$ = new yy.AST.DeclStmt($1);
            }
        }
    ;

InitDeclaratorList
    : InitDeclarator
        {
            {
                $$ = [$1];
            }
        }
    | InitDeclaratorList ',' InitDeclarator
        {
            {
                $1.push($3);
                $$ = $1;
            }
        }
    ;

InitDeclarator
    : Identifier
        {
            {
                $$ = $1;
            }
        }
    ;

InitTypedDeclaratorList
    : InitTypedDeclarator
        {
            {
                $$ = [$1];
            }
        }
    | InitTypedDeclaratorList ',' InitTypedDeclarator
        {
            {
                $1.push($3);
                $$ = $1;
            }
        }
    ;

InitTypedDeclarator
    : Identifier TypeDeclaration
        {
            {
                $$ = new yy.AST.Field([$1], $2);
            }
        }
    ;

Initializer
    : Expression
        {
            {
                $$ = $1;
            }
        }
    ;

InitializerList
    : Initializer
        {
            {
                $$ = [$1];
            }
        }
    | InitializerList ',' Initializer
        {
            {
                $1.push($3);
            }
        }
    ;

VarDeclaration
    : 'var' InitVarDeclaratorList
        {
            {
                $$ = new yy.AST.VarDecl($2);
            }
        }
    ;

InitVarDeclaratorList
    : VarSpec
        {
            {
                $$ = [$1];
            }
        }
    | InitVarDeclaratorList ',' VarSpec
        {
            {
                $1.push($3);
                $$ = $1;
            }
        }
    ;

VarSpec
    : InitDeclarator VarType VarValue
        {
            {
                $$ = new yy.AST.ValueSpec('var', $1, $3, $2);
            }
        }
    ;

VarType
    : %empty
        {
            {
                $$ = null;
            }
        }
    | TypeDeclaration
        {
            {
                $$ = $1;
            }
        }
    ;

VarValue
    : %empty
        {
            {
                $$ = null;
            }
        }
    | '=' Expression
        {
            {
                $$ = $2;
            }
        }
    ;

ConstDeclaration
    : 'const' InitConstDeclaratorList
        {
            {
                $$ = new yy.AST.ConstDecl($2);
            }
        }
    ;

InitConstDeclaratorList
    : ConstSpec
        {
            {
                $$ = [$1];
            }
        }
    | InitConstDeclaratorList ',' ConstSpec
        {
            {
                $1.push($3);
                $$ = $1;
            }
        }
    ;

ConstSpec
    : InitDeclarator ConstType ConstValue
        {
            {
                $$ = new yy.AST.ValueSpec('const', $1, $3, $2);
            }
        }
    ;

ConstType
    : %empty
        {
            {
                $$ = null;
            }
        }
    | TypeDeclaration
        {
            {
                $$ = $1;
            }
        }
    ;

ConstValue
    : '=' Expression
        {
            {
                $$ = $2;
            }
        }
    ;

FunctionDeclaration
    : 'func' Identifier '(' FunctionParameterDeclarationList ')' FunctionReturn FunctionBody
        {
            {
                $$ = new yy.AST.FuncDecl($2, $4, $6, $7);
            }
        }
    ;

FunctionParameterDeclarationList
    : %empty
        {
            {
                $$ = new yy.AST.FieldList([]);
            }
        }
    | ParamList
        {
            {
                $$ = new yy.AST.FieldList($1);
            }
        }
    | VariadicDeclaration
        {
            {
                $$ = new yy.AST.FieldList([$1]);
            }
        }
    | ParamList ',' VariadicDeclaration
        {
            {
                $1.push($3);
                $$ = new yy.AST.FieldList($1);
            }
        }
    ;

ParamList
    : Param
        {
            {
                $$ = [$1];
            }
        }
    | ParamList ',' Param
        {
            {
                $1.push($3);
                $$ = $1
            }
        }
    ;

Param
    : InitDeclaratorList TypeDeclaration
        {
            {
                $$ = new yy.AST.Field($1, $2);
            }
        }
    ;

VariadicDeclaration
    : Identifier '...' ValidVariadicType
        {
            {
                const type = new yy.Types.Variadic($3);
                $$ = new yy.AST.Field([$1], type);
            }
        }
    ;

ValidVariadicType
    : Identifier
        {
            {
                $$ = $1;
            }
        }
    | AtomicType
        {
            {
                $$ = $1;
            }
        }
    | FunctionType
        {
            {
                $$ = $1;
            }
        }
    | ObjectType
        {
            {
                $$ = $1;
            }
        }
    | ArrayType
        {
            {
                $$ = $1;
            }
        }
    ;

FunctionReturn
    : %empty
        {
            {
                $$ = new yy.Types.VoidType();
            }
        }
    | TypeDeclaration
        {
            {
                $$ = $1;
            }
        }
    ;

FunctionBody
    : BlockStatement
        {
            {
                $$ = $1;
            }
        }
    ;

ObjectDeclaration
    : 'object' Identifier '{' '}'
        {
            {
                const fieldList = new yy.AST.FieldList([]);
                const objType = new yy.Types.ObjType(fieldList);
                const spec = new yy.Types.TypeSpec($2, objType);
                $$ = new yy.AST.ObjDecl(spec);
            }
        }
    | 'object' Identifier '{' ObjectFieldDeclarationList '}'
        {
            {
                const fieldList = new yy.AST.FieldList($4);
                const objType = new yy.Types.ObjType(fieldList);
                const spec = new yy.Types.TypeSpec($2, objType);
                $$ = new yy.AST.ObjDecl(spec);
            }
        }
    ;

ObjectFieldDeclarationList
    : ObjectField
        {
            {
                $$ = [$1];
            }
        }
    | ObjectFieldDeclarationList ObjectField
        {
            {
                $1.push($2);
                $$ = $1;
            }
        }
    ;

ObjectField
    : InitDeclaratorList TypeDeclaration
        {
            {
                $$ = new yy.AST.Field($1, $2);
            }
        }
    ;

Statement
    : BlockStatement
        {
            {
                $$ = $1;
            }
        }
    | ReturnStatement Sep
        {
            {
                $$ = $1;
            }
        }
    | BreakStatement Sep
        {
            {
                $$ = $1;
            }
        }
    | ContinueStatement Sep
        {
            {
                $$ = $1;
            }
        }
    | IfStatement
        {
            {
                $$ = $1;
            }
        }
    | LoopStatement
        {
            {
                $$ = $1;
            }
        }
    | ExpressionStatement Sep
        {
            {
                $$ = $1;
            }
        }
    ;

BlockStatement
    : '{' '}'
        {
            {
                $$ = new yy.AST.Block([]);
            }
        }
    | '{' Declarations '}'
        {
            {
                $$ = new yy.AST.Block($2);
            }
        }
    ;

ReturnStatement
    : 'return' ReturnAction
        {
            {
                $$ = new yy.AST.ReturnStmt($2);
            }
        }
    ;

ReturnAction
    : %empty
        {
            {
                $$ = null;
            }
        }
    | Expression
        {
            {
                $$ = $1;
            }
        }
    ;

BreakStatement
    : 'break'
        {
            {
                $$ = new yy.AST.BreakStmt();
            }
        }
    ;

ContinueStatement
    : 'continue'
        {
            {
                $$ = new yy.AST.ContinueStmt();
            }
        }
    ;

IfStatement
    : 'if' '(' Expression ')' BlockStatement ElseStatement
        {
            {
                $$ = new yy.AST.IfStmt($3, $5, $6);
            }
        }
    ;

ElseStatement
    : %empty
        {
            {
                $$ = null;
            }
        }
    | 'else' IfStatement
        {
            {
                $$ = $2
            }
        }
    | 'else' BlockStatement
        {
            {
                $$ = $2;
            }
        }
    ;

LoopStatement
    : 'loop' LoopBody
        {
            {
                $$ = new yy.AST.LoopStmt('Undef', null, null, null, $2);
            }
        }
    | 'loop' '(' Expression ')' LoopBody
        {
            {
                $$ = new yy.AST.LoopStmt('While', null, $3, null, $5);
            }
        }
    | 'loop' '(' LoopInit Sep LoopCond Sep LoopPost ')' LoopBody
        {
            {
                $$ = new yy.AST.LoopStmt('For', $3, $5, $7, $9);
            }
        }
    ;

LoopInit
    : %empty
        {
            {
                $$ = null;
            }
        }
    | VarDeclaration
        {
            {
                $$ = $1;
            }
        }
    | ConstDeclaration
        {
            {
                $$ = $1;
            }
        }
    | Expression
        {
            {
                $$ = $1;
            }
        }
    ;

LoopCond
    : %empty
        {
            {
                $$ = null;
            }
        }
    | Expression
        {
            {
                $$ = $1;
            }
        }
    ;

LoopPost
    : %empty
        {
            {
                $$ = null;
            }
        }
    | Expression
        {
            {
                $$ = [$1];
            }
        }
    | LoopPost ',' Expression
        {
            {
                $1.push($3);
                $$ = $1;
            }
        }
    ;

LoopBody
    : BlockStatement
        {
            {
                $$ = $1;
            }
        }
    ;

ExpressionStatement
    : Expression
        {
            {
                $$ = new yy.AST.ExprStmt($1);
            }
        }
    ;

Expression
    : AssignmentExpression
        {
            {
                $$ = $1;
            }
        }
    ;

AssignmentExpression
    : ConditionalExpression
        {
            {
                $$ = $1;
            }
        }
    | PostfixExpression AssigmentOperator ConditionalExpression
        {
            {
                $$ = new yy.AST.Assign($1, $2, $3);
            }
        }
    ;

AssigmentOperator
    : '='
        {
            {
                $$ = new yy.Token($1, '=', yyleng, yylineno, yy.lexer.yylloc);
            }
        }
    | '+='
        {
            {
                $$ = new yy.Token($1, '+=', yyleng, yylineno, yy.lexer.yylloc);
            }
        }
    | '-='
        {
            {
                $$ = new yy.Token($1, '-=', yyleng, yylineno, yy.lexer.yylloc);
            }
        }
    | '*='
        {
            {
                $$ = new yy.Token($1, '*=', yyleng, yylineno, yy.lexer.yylloc);
            }
        }
    | '/='
        {
            {
                $$ = new yy.Token($1, '/=', yyleng, yylineno, yy.lexer.yylloc);
            }
        }
    | '%='
        {
            {
                $$ = new yy.Token($1, '%=', yyleng, yylineno, yy.lexer.yylloc);
            }
        }
    | '&='
        {
            {
                $$ = new yy.Token($1, '&=', yyleng, yylineno, yy.lexer.yylloc);
            }
        }
    | '|='
        {
            {
                $$ = new yy.Token($1, '|=', yyleng, yylineno, yy.lexer.yylloc);
            }
        }
    | '^='
        {
            {
                $$ = new yy.Token($1, '^=', yyleng, yylineno, yy.lexer.yylloc);
            }
        }
    | '<<='
        {
            {
                $$ = new yy.Token($1, '<<=', yyleng, yylineno, yy.lexer.yylloc);
            }
        }
    | '>>='
        {
            {
                $$ = new yy.Token($1, '>>=', yyleng, yylineno, yy.lexer.yylloc);
            }
        }
    ;

ConditionalExpression
    : LogicalOrExpression
        {
            {
                $$ = $1;
            }
        }
    | LogicalOrExpression '?' Expression ':' Expression
        {
            {
                $$ = new yy.AST.Conditional($1, $3, $5);
            }
        }
    ;

LogicalOrExpression
    : LogicalAndExpression
        {
            {
                $$ = $1;
            }
        }
    | LogicalOrExpression '||' LogicalAndExpression
        {
            {
                const lorToken = new yy.Token('||', '||', yyleng, yylineno, yy.lexer.yylloc);
                $$ = new yy.AST.Logical($1, lorToken, $3);
            }
        }
    ;

LogicalAndExpression
    : OrExpression
        {
            {
                $$ = $1;
            }
        }
    | LogicalAndExpression '&&' OrExpression
        {
            {
                const landToken = new yy.Token('&&', '&&', yyleng, yylineno, yy.lexer.yylloc);
                $$ = new yy.AST.Logical($1, landToken, $3);
            }
        }
    ;

OrExpression
    : XorExpression
        {
            {
                $$ = $1;
            }
        }
    | OrExpression '|' XorExpression
        {
            {
                const binOrToken = new yy.Token('|', '|', yyleng, yylineno, yy.lexer.yylloc);
                $$ = new yy.AST.Binary($1, binOrToken, $3);
            }
        }
    ;

XorExpression
    : AndExpression
        {
            {
                $$ = $1;
            }
        }
    | XorExpression '^' AndExpression
        {
            {
                const binXorToken = new yy.Token('^', '^', yyleng, yylineno, yy.lexer.yylloc);
                $$ = new yy.AST.Binary($1, binXorToken, $3);
            }
        }
    ;

AndExpression
    : EqualityExpression
        {
            {
                $$ = $1;
            }
        }
    | AndExpression '&' EqualityExpression
        {
            {
                const binAndToken = new yy.Token('&', '&', yyleng, yylineno, yy.lexer.yylloc);
                $$ = new yy.AST.Binary($1, binAndToken, $3);
            }
        }
    ;

EqualityExpression
    : RelationalExpression
        {
            {
                $$ = $1;
            }
        }
    | EqualityExpression EqualityOperator RelationalExpression
        {
            {
                $$ = new yy.AST.Binary($1, $2, $3);
            }
        }
    ;

EqualityOperator
    : '=='
        {
            {
                $$ = new yy.Token('==', '==', yyleng, yylineno, yy.lexer.yylloc);
            }
        }
    | '!='
        {
            {
                $$ = new yy.Token('!=', '!=', yyleng, yylineno, yy.lexer.yylloc);
            }
        }
    ;

RelationalExpression
    : ShiftExpression
        {
            {
                $$ = $1;
            }
        }
    | RelationalExpression RelationalOperator ShiftExpression
        {
            {
                $$ = new yy.AST.Binary($1, $2, $3);
            }
        }
    ;

RelationalOperator
    : '<'
        {
            {
                $$ = new yy.Token('<', '<', yyleng, yylineno, yy.lexer.yylloc);
            }
        }
    | '>'
        {
            {
                $$ = new yy.Token('>', '>', yyleng, yylineno, yy.lexer.yylloc);
            }
        }
    | '<='
        {
            {
                $$ = new yy.Token('<=', '<=', yyleng, yylineno, yy.lexer.yylloc);
            }
        }
    | '>='
        {
            {
                $$ = new yy.Token('>=', '>=', yyleng, yylineno, yy.lexer.yylloc);
            }
        }
    ;

ShiftExpression
    : AdditiveExpression
        {
            {
                $$ = $1;
            }
        }
    | ShiftExpression ShiftOperator AdditiveExpression
        {
            {
                $$ = new yy.AST.Binary($1, $2, $3);
            }
        }
    ;

ShiftOperator
    : '<<'
        {
            {
                $$ = new yy.Token('<<', '<<', yyleng, yylineno, yy.lexer.yylloc);
            }
        }
    | '>>'
        {
            {
                $$ = new yy.Token('>>', '>>', yyleng, yylineno, yy.lexer.yylloc);
            }
        }
    ;

AdditiveExpression
    : MultiplicativeExpression
        {
            {
                $$ = $1;
            }
        }
    | AdditiveExpression AdditiveOperator MultiplicativeExpression
        {
            {
                $$ = new yy.AST.Binary($1, $2, $3);
            }
        }
    ;

AdditiveOperator
    : '+'
        {
            {
                $$ = new yy.Token('+', '+', yyleng, yylineno, yy.lexer.yylloc);
            }
        }
    | '-'
        {
            {
                $$ = new yy.Token('-', '-', yyleng, yylineno, yy.lexer.yylloc);
            }
        }
    ;

MultiplicativeExpression
    : UnaryExpression
        {
            {
                $$ = $1;
            }
        }
    | MultiplicativeExpression MultiplicativeOperator UnaryExpression
        {
            {
                $$ = new yy.AST.Binary($1, $2, $3);
            }
        }
    ;

MultiplicativeOperator
    : '*'
        {
            {
                $$ = new yy.Token('*', '*', yyleng, yylineno, yy.lexer.yylloc);
            }
        }
    | '/'
        {
            {
                $$ = new yy.Token('/', '/', yyleng, yylineno, yy.lexer.yylloc);
            }
        }
    | '%'
        {
            {
                $$ = new yy.Token('%', '%', yyleng, yylineno, yy.lexer.yylloc);
            }
        }
    ;

UnaryExpression
    : UpdateExpression
        {
            {
                $$ = $1;
            }
        }
    | UnaryOperator UnaryExpression
        {
            {
                $$ = new yy.AST.Unary($1, $2);
            }
        }
    ;

UnaryOperator
    : '+'
        {
            {
                $$ = new yy.Token('+', '+', yyleng, yylineno, yy.lexer.yylloc);
            }
        }
    | '-'
        {
            {
                $$ = new yy.Token('-', '-', yyleng, yylineno, yy.lexer.yylloc);
            }
        }
    | '~'
        {
            {
                $$ = new yy.Token('~', '~', yyleng, yylineno, yy.lexer.yylloc);
            }
        }
    | '!'
        {
            {
                $$ = new yy.Token('!', '!', yyleng, yylineno, yy.lexer.yylloc);
            }
        }
    ;

UpdateExpression
    : PostfixExpression
        {
            {
                $$ = $1;
            }
        }
    | UpdateExpression PostfixOperator
        {
            {
                $$ = new yy.AST.Update($1, $2);
            }
        }
    ;

PostfixOperator
    : '++'
        {
            {
                $$ = new yy.Token('++', '++', yyleng, yylineno, yy.lexer.yylloc);
            }
        }
    | '--'
        {
            {
                $$ = new yy.Token('--', '--', yyleng, yylineno, yy.lexer.yylloc);
            }
        }
    ;

PostfixExpression
    : PrimaryExpression
        {
            {
                $$ = $1;
            }
        }
    | PostfixExpression '.' '(' TypeDeclaration ')'
        {
            {
                $$ = new yy.AST.Cast($1, $4);
            }
        }
    | PostfixExpression '[' Expression ']'
        {
            {
                $$ = new yy.AST.ArrayMember($3, $1);
            }
        }
    | PostfixExpression '(' CallExpressionArguments ')'
        {
            {
                $$ = new yy.AST.Call($1, $3);
            }
        }
    | PostfixExpression '.' Identifier
        {
            {
                $$ = new yy.AST.ObjectMember($3, $1);
            }
        }
    ;

CallExpressionArguments
    : %empty
        {
            {
                $$ = [];
            }
        }
    | ArgumentList
        {
            {
                $$ = $1;
            }
        }
    ;

ArgumentList
    : Expression
        {
            {
                $$ = [$1];
            }
        }
    | ArgumentList ',' Expression
        {
            {
                $1.push($3);
                $$ = $1;
            }
        }
    ;

PrimaryExpression
    : GroupExpression
        {
            {
                $$ = $1;
            }
        }
    | Identifier
        {
            {
                $$ = $1;
            }
        }
    | Literal
        {
            {
                $$ = $1;
            }
        }
    | FunctionExpression
        {
            {
                $$ = $1;
            }
        }
    | ObjectInitializationExpression
        {
            {
                $$ = $1;
            }
        }
    | ArrayInitializationExpression
        {
            {
                $$ = $1;
            }
        }
    ;

GroupExpression
    : '(' Expression ')'
        {
            {
                const groupExpr = new yy.AST.Group($2);
                $$ = groupExpr;
            }
        }
    ;

Identifier
    : IDENT
        {
            {
                const identToken = new yy.Token($1, 'IDENT', yyleng, yylineno, yy.lexer.yylloc);
                const identLiteral = new yy.AST.Identifier(identToken);
                $$ = identLiteral;
            }
        }
    ;

Literal
    : INT
        {
            {
                const intToken = new yy.Token($1, 'INT', yyleng, yylineno, yy.lexer.yylloc);
                $$ = new yy.AST.IntegerLiteral(intToken);
            }
        }
    | HEX
        {
            {
                const hexToken = new yy.Token($1, 'HEX', yyleng, yylineno, yy.lexer.yylloc);
                $$ = new yy.AST.IntegerLiteral(hexToken);
            }
        }
    | BIN
        {
            {
                const binToken = new yy.Token($1, 'BIN', yyleng, yylineno, yy.lexer.yylloc);
                $$ = new yy.AST.IntegerLiteral(binToken);
            }
        }
    | OCT
        {
            {
                const octToken = new yy.Token($1, 'OCT', yyleng, yylineno, yy.lexer.yylloc);
                $$ = new yy.AST.IntegerLiteral(octToken);
            }
        }
    | FLOAT
        {
            {
                const floatToken = new yy.Token($1, 'FLOAT', yyleng, yylineno, yy.lexer.yylloc);
                $$ = new yy.AST.FloatLiteral(floatToken);
            }
        }
    | CHAR
        {
            {
                const charToken = new yy.Token($1.replaceAll("'", ''), 'CHAR', yyleng, yylineno, yy.lexer.yylloc);
                $$ = new yy.AST.CharLiteral(charToken);
            }
        }
    | STRING
        {
            {
                const strToken = new yy.Token($1.replaceAll('"', ''), 'STRING', yyleng, yylineno, yy.lexer.yylloc);
                $$ = new yy.AST.StringLiteral(strToken);
            }
        }
    | 'true'
        {
            {
                const trueToken = new yy.Token($1, 'true', yyleng, yylineno, yy.lexer.yylloc);
                $$ = new yy.AST.BooleanLiteral(trueToken);
            }
        }
    | 'false'
        {
            {
                const falseToken = new yy.Token($1, 'false', yyleng, yylineno, yy.lexer.yylloc);
                $$ = new yy.AST.BooleanLiteral(falseToken);
            }
        }
    | 'nil'
        {
            {
                const nilToken = new yy.Token($1, 'nil', yyleng, yylineno, yy.lexer.yylloc);
                $$ = new yy.AST.NilLiteral(nilToken);
            }
        }
    ;

FunctionExpression
    : 'func' '(' FunctionParameterDeclarationList ')' FunctionReturn FunctionBody
        {
            {
                $$ = new yy.AST.FuncExpr($3, $5, $6);
            }
        }
    ;

ObjectInitializationExpression
    : Identifier ObjectInitializationListExpression
        {
            {
                $$ = new yy.AST.ObjectInit($1, $2);
            }
        }
    | ObjectType ObjectInitializationListExpression
        {
            {
                $$ = new yy.AST.ObjectInlineInit($1, $2);
            }
        }
    ;

ObjectInitializationListExpression
    : '{' ObjectArguments '}'
        {
            {
                $$ = $2;
            }
        }
    | '{' ObjectArguments ',' '}'
        {
            {
                $$ = $2;
            }
        }
    ;

ObjectArguments
    : %empty
        {
            {
                $$ = [];
            }
        }
    | ObjectArgumentsExpression
        {
            {
                $$ = [$1];
            }
        }
    | ObjectArguments ',' ObjectArgumentsExpression
        {
            {
                $1.push($3);
                $$ = $1;
            }
        }
    ;

ObjectArgumentsExpression
    : Identifier ':' Expression
        {
            {
                $$ = new yy.AST.ObjectField($1, $3);
            }
        }
    ;

ArrayInitializationExpression
    : ArrayType '{' '}'
        {
            {
                $$ = new yy.AST.ArrayInit($1, []);
            }
        }
    | ArrayType '{' ArrayArguments '}'
        {
            {
                $$ = new yy.AST.ArrayInit($1, $3);
            }
        }
    | ArrayType '{' ArrayArguments ',' '}'
        {
            {
                $$ = new yy.AST.ArrayInit($1, $3);
            }
        }
    ;

ArrayArguments
    : ArrayArgumentInitializer
        {
            {
                $$ = [$1];
            }
        }
    | ArrayArguments ',' ArrayArgumentInitializer
        {
            {
                $1.push($3);
                $$ = $1;
            }
        }
    ;

ArrayArgumentInitializer
    : Expression
        {
            {
                $$ = $1;
            }
        }
    | '{' ArrayArguments '}'
        {
            {
                $$ = new yy.AST.ArrayInit(null, $2);
            }
        }
    | '{' ArrayArguments ',' '}'
        {
            {
                $$ = new yy.AST.ArrayInit(null, $2);
            }
        }
    ;
