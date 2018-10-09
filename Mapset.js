"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Dataset_1 = require("./Dataset");
const MemArrayVisitor_1 = require("./MemArrayVisitor");
const Expressions_1 = require("./Expressions");
class MapSet extends Dataset_1.DataSet {
    constructor(source, mapFn, expressions = []) {
        super();
        this.source = source;
        this.mapFn = mapFn;
        this.expressions = expressions;
        this.memset = null;
    }
    get isMemorized() {
        return this.memset != null;
    }
    debug(x) {
        return x;
    }
    createMemset(expressions) {
        return this.source.query.apply(this.source, expressions.filter(this.noneSelect)).then((response) => {
            let set = new MemArrayVisitor_1.MemSet(this.mapFn(response) || []);
            set = set.query.apply(set, expressions.filter(this.onlySelect));
            this.memset = set;
            return {
                set: set
            };
        });
    }
    query(...expression) {
        let exp = expression || [];
        let expressions = [].concat(this.expressions).concat(exp);
        return new MapSet(this.source, this.mapFn, expressions);
    }
    onlySelect(x) {
        let types = [Expressions_1.Select, Expressions_1.Expand];
        return types.some(t => x instanceof t);
    }
    noneSelect(x) {
        let types = [Expressions_1.Select, Expressions_1.Expand];
        return !types.some(t => x instanceof t);
    }
    add(item) {
        return Promise.reject('Mapset: not support add');
    }
    update(item) {
        return Promise.reject('Mapset: not support update');
    }
    delete(item) {
        return Promise.reject('Mapset: not support delete');
    }
    get(...expression) {
        let allExpressions = [].concat(this.expressions || []).concat(expression || []);
        return this.createMemset(allExpressions).then((e) => {
            return e.set.then((response) => {
                return response;
            });
        });
    }
}
exports.MapSet = MapSet;
//# sourceMappingURL=Mapset.js.map