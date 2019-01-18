"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MemOperation {
}
exports.MemOperation = MemOperation;
/**Distincts */
/**
 * Checks all properties
 */
class FullMatchDistinctOp extends MemOperation {
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
class ReferenceDistinctOp extends MemOperation {
    pipe(array) {
        return Promise.resolve(array.filter((item, index, arr) => {
            return arr.findIndex((a) => a === item) === index;
        }));
    }
}
/**
 * Checks only selected properties
 */
class OneProperyDistinctOp extends MemOperation {
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
Distincs.fullMatch = new FullMatchDistinctOp();
/**
 * Checks  only equality of references
 */
Distincs.referenceMatch = new ReferenceDistinctOp();
/**
 * Checks only selected properties
 */
Distincs.propertyMatch = function (...properties) {
    let props = properties.length === 0 && Array.isArray(properties[0]) ? properties[0] : properties;
    return new OneProperyDistinctOp(props);
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
class NotNullOp extends MemOperation {
    pipe(array) {
        return Promise.resolve(array.filter(x => x != null));
    }
}
function notNull() {
    return new NotNullOp();
}
exports.notNull = notNull;
class MapOp extends MemOperation {
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
    return new MapOp(mapFn);
}
exports.map = map;
