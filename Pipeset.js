"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MemArrayVisitor_1 = require("./MemArrayVisitor");
const Dataset_1 = require("./Dataset");
class Pipeset extends Dataset_1.DataSet {
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
        return !((item instanceof PipeQuery) || typeof item === "function");
    }
    isPipeQuery(item) {
        return ((item instanceof PipeQuery) || typeof item === "function");
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
            console.log({ expressions });
            let pipeResult = !this.isFunction(expressions.pipeQuery) ?
                expressions.pipeQuery.pipe(r)
                : expressions.pipeQuery(r);
            if (expressions.right.length === 0)
                return r;
            return new Pipeset(new MemArrayVisitor_1.MemSet(pipeResult, expressions.right)).then((response) => {
                return response;
            });
        });
    }
}
exports.Pipeset = Pipeset;
class PipeQuery {
}
exports.PipeQuery = PipeQuery;
/**Distincts */
/**
 * Checks all properties
 */
class FullMatchDistinctQuery extends PipeQuery {
    pipe(array) {
        return Promise.resolve(array.filter((item, index, arr) => {
            return arr.findIndex((a) => {
                if (a == null)
                    return false;
                for (let i in a) {
                    if (item[i] !== a[i])
                        return false;
                }
                return true;
            }) === index;
        }));
    }
}
/**
 * Checks  only equality of references
 */
class ReferenceDistinctQuery extends PipeQuery {
    pipe(array) {
        return Promise.resolve(array.filter((item, index, arr) => {
            return arr.findIndex((a) => a === item) === index;
        }));
    }
}
/**
 * Checks only selected properties
 */
class OneProperyDistinctQuery extends PipeQuery {
    constructor(properties) {
        super();
        this.properties = properties;
    }
    pipe(array) {
        return Promise.resolve(array.filter((item, index, arr) => {
            return arr.findIndex((a) => {
                if (a == null)
                    return false;
                return this.properties.every((prop) => {
                    return item[prop] === a[prop];
                });
            }) === index;
        }));
    }
}
class Distincs {
}
/**
* Checks all properties
*/
Distincs.fullMatch = new FullMatchDistinctQuery();
/**
 * Checks  only equality of references
 */
Distincs.referenceMatch = new ReferenceDistinctQuery();
/**
 * Checks only selected properties
 */
Distincs.propertyMatch = function (...properties) {
    let props = properties.length === 0 && Array.isArray(properties[0]) ? properties[0] : properties;
    return new OneProperyDistinctQuery(props);
};
exports.Distincs = Distincs;
/**
 * Distinct model
 * @param algorithm
 */
function distinct(algorithm = Distincs.referenceMatch) {
    if (typeof algorithm === "string")
        return Distincs.propertyMatch(algorithm);
    if (Array.isArray(algorithm))
        return Distincs.propertyMatch.apply(null, algorithm);
    return algorithm;
}
exports.distinct = distinct;
/**
 * Checks all properties
 */
function fullDistinct() {
    return Distincs.fullMatch;
}
exports.fullDistinct = fullDistinct;
class NotNullQuery extends PipeQuery {
    pipe(array) {
        return Promise.resolve(array.filter(x => x != null));
    }
}
function notNull() {
    return new NotNullQuery();
}
exports.notNull = notNull;
class MapQuery extends PipeQuery {
    constructor(mapFn) {
        super();
        this.mapFn = mapFn;
    }
    pipe(array) {
        return Promise.resolve(array.map(this.mapFn));
    }
}
/**
    * Returns the elements of an array that meet the condition specified in a callback function.
 * @param mapFn
 */
function map(mapFn) {
    return new MapQuery(mapFn);
}
exports.map = map;
//# sourceMappingURL=Pipeset.js.map