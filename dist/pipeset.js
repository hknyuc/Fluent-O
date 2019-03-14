"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const memarrayvisitor_1 = require("./memarrayvisitor");
const dataset_1 = require("./dataset");
const memoperation_1 = require("./memoperation");
/**
 * Query kısmına extradan lokalde yapılan işlemler eklenebilir. O işlemden sonra diğer işlem memset üzeriden gider.
 */
class Pipeset extends dataset_1.DataSet {
    constructor(source, expressions = []) {
        super(expressions);
        this.source = source;
    }
    query(...expression) {
        return new Pipeset(this.source, [].concat(this.expressions).concat(expression));
    }
    getExpressions() {
        return this.expressions.filter(this.notPipeQuery);
    }
    notPipeQuery(item) {
        return !((item instanceof memoperation_1.MemOperation) || typeof item === "function");
    }
    isPipeQuery(item) {
        return ((item instanceof memoperation_1.MemOperation) || typeof item === "function");
    }
    splitExpressionsByPipeQuery(expressions) {
        let indexOfItem = expressions.findIndex(this.isPipeQuery);
        if (indexOfItem < 0)
            return {
                left: expressions,
                pipeQuery: null,
                right: []
            };
        let left = expressions.slice(0, indexOfItem);
        let pipeQuery = expressions[indexOfItem];
        let right = expressions.slice(indexOfItem + 1, expressions.length);
        return {
            left,
            pipeQuery,
            right
        };
    }
    add(item) {
        return this.source.add(item);
    }
    update(item) {
        return this.source.update(item);
    }
    delete(item) {
        return this.source.delete(item);
    }
    isFunction(funcable) {
        return typeof funcable === "function";
    }
    get(...expression) {
        let getResultFromPipesAsPromise = function (pipes, value) {
            let pArray = [].concat(Array.isArray(pipes) ? pipes : [pipes]).filter(fn => typeof fn === "function");
            let valuePromise = (value instanceof Promise) ? value : Promise.resolve(value);
            if (pArray.length === 0)
                return valuePromise;
            return valuePromise.then((v) => {
                let pipefunc = pArray.pop();
                let funcResult = pipefunc(v);
                return getResultFromPipesAsPromise(pArray, funcResult);
            });
        };
        let expressions = this.splitExpressionsByPipeQuery([].concat(this.expressions).concat(expression));
        return this.source.query.apply(this.source, expressions.left).then((r) => {
            if (expressions.pipeQuery == null)
                return r;
            if (expressions.right.length === 0)
                return r;
            let pipeResult = !this.isFunction(expressions.pipeQuery) ?
                expressions.pipeQuery.pipe(r)
                : expressions.pipeQuery(r);
            if (pipeResult instanceof Promise) {
                return pipeResult.then((response) => {
                    return new Pipeset(new memarrayvisitor_1.MemSet(response, expressions.right)).then((response) => {
                        return response;
                    });
                });
            }
            return new Pipeset(new memarrayvisitor_1.MemSet(pipeResult, expressions.right)).then((response) => {
                return response;
            });
        });
    }
}
exports.Pipeset = Pipeset;
