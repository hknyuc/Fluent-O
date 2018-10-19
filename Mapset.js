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
    }
    createMemset(expressions) {
        if (typeof this.mapFn === "function") {
            let filters = expressions.filter(this.onlySortandElimination);
            return this.source.query.apply(this.source, expressions.filter(this.onlyRange))
                .then((response) => {
                let result = Array.isArray(response) ? response.map(this.mapFn) : this.mapFn(response, -1, null);
                let set = new MemArrayVisitor_1.MemSet(result);
                set = set.query.apply(set, expressions.filter(this.onlySelect));
                let memset = filters.length != 0 ? set.query.apply(set, filters) : set;
                return {
                    set: memset
                };
            });
        }
        if (typeof this.mapFn === "string") {
            let filters = expressions.filter(this.onlySortandElimination);
            let exps = expressions.filter(this.onlyRange).concat(new Expressions_1.Expand([{
                    property: new Expressions_1.Property(this.mapFn),
                    expressions: expressions.filter(this.onlySelect)
                }]));
            return this.source.query.apply(this.source, exps).then((response) => {
                let result = Array.isArray(response) ? response.map(x => x[this.mapFn]) : response[this.mapFn];
                let set = new MemArrayVisitor_1.MemSet(result);
                return {
                    set: (filters.length != 0 ? set.query.apply(set, filters) : set)
                };
            });
        }
        throw new Error('Not support');
    }
    query(...expression) {
        return new MapSet(this.source, this.mapFn, [].concat(this.expressions).concat(expression || []));
    }
    onlySelect(x) {
        let types = [Expressions_1.Select, Expressions_1.Expand];
        return types.some(t => x instanceof t);
    }
    onlyRange(x) {
        let types = [Expressions_1.Skip, Expressions_1.Top];
        return types.some(t => x instanceof t);
    }
    onlySortandElimination(x) {
        let types = [Expressions_1.Filter, Expressions_1.Order];
        return types.some(t => x instanceof t);
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