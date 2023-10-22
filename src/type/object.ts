import { FieldList } from '../ast/field-decl.js';
import { Type, TypeKind } from './index.js';

export type ObjectType = 'ObjectType';

export class ObjType implements Type {
    constructor(public fields: FieldList) {}

    kind(): TypeKind {
        return 'ObjectType';
    }

    copy(): Type {
        return new ObjType(this.fields.copy() as FieldList);
    }

    equals(o: Type): boolean {
        if (!(o instanceof ObjType)) return false;

        return this.fields.equals(o.fields);
    }

    toString(): string {
        return `{\n${this.fields.list.map((f) => f.toString()).join('\n')}\n}`;
    }
}
