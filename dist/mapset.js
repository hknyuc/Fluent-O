"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dataset_1 = require("./dataset");
const memarrayvisitor_1 = require("./memarrayvisitor");
const expressions_1 = require("./expressions");
const core_1 = require("./core");
class MapSet extends dataset_1.DataSet {
    constructor(source, mapFn, expressions = [], mapFnEx) {
        super(expressions);
        this.source = source;
        this.mapFn = mapFn;
        this.mapFnEx = mapFnEx;
    }
    createMemset(expressions) {
        if (typeof this.mapFn === "function") {
            let filters = expressions.filter(this.onlySortandElimination);
            return this.source.query.apply(this.source, expressions.filter(this.onlyRange))
                .then((response) => {
                let result = Array.isArray(response) ? response.map(this.mapFn) : this.mapFn(response, -1, null);
                let set = new memarrayvisitor_1.MemSet(result);
                set = set.query.apply(set, expressions.filter(this.onlySelect));
                let memset = filters.length != 0 ? set.query.apply(set, filters) : set;
                return {
                    set: memset
                };
            });
        }
        if (typeof this.mapFn === "string") {
            let filters = expressions.filter(this.onlySortandElimination);
            let exps = expressions.filter(this.onlyRange).concat([new expressions_1.Expand([{
                        property: new expressions_1.Property(this.mapFn),
                        expressions: expressions.filter(this.onlySelect)
                    }])]);
            return this.source.query.apply(this.source, exps).then((response) => {
                let result = Array.isArray(response) ? response.map((x, i, array) => {
                    let result = x[this.mapFn];
                    if (this.mapFnEx == null)
                        return result;
                    return this.mapFnEx(result, x, i, array);
                }) : () => {
                    let result = response[this.mapFn];
                    if (this.mapFnEx != null) {
                        return this.mapFnEx(result, response, -1, null);
                    }
                    return result;
                };
                let set = new memarrayvisitor_1.MemSet(result);
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
        let types = [expressions_1.Select, expressions_1.Expand];
        return types.some(t => core_1.Utility.instanceof(x, t));
    }
    onlyRange(x) {
        let types = [expressions_1.Skip, expressions_1.Top];
        return types.some(t => core_1.Utility.instanceof(x, t));
    }
    onlySortandElimination(x) {
        let types = [expressions_1.Filter, expressions_1.Order];
        return types.some(t => core_1.Utility.instanceof(x, t));
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
