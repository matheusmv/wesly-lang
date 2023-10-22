import { arrCopy, arrEqual } from '../util/index.js';
import { Type, TypeKind } from './index.js';

export type FunctionType = 'FunctionType';

export class FuncType implements Type {
    constructor(
        public params: Type[],
        public returnType: Type,
    ) {}

    kind(): TypeKind {
        return 'FunctionType';
    }

    copy(): Type {
        return new FuncType(
            arrCopy(this.params, (t) => t.copy()),
            this.returnType.copy(),
        );
    }

    equals(o: Type): boolean {
        if (!(o instanceof FuncType)) return false;

        if (!this.returnType.equals(o.returnType)) return false;

        return arrEqual(this.params, o.params, (lT, rT) => lT.equals(rT));
    }

    toString(): string {
        return `func(${this.params.toString()})${this.returnType.toString()}`;
    }
}
