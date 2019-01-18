"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Core_1 = require("./Core");
const Expressions_1 = require("./Expressions");
const MemArrayVisitor_1 = require("./MemArrayVisitor");
class TrackingMemset extends MemArrayVisitor_1.MemSet {
    constructor(memset) {
        super(memset["source"], memset.getExpressions());
        this.memset = memset;
        this.trackingId = memset.trackingId;
    }
    trackObject(index, object) {
        let element = (Array.isArray(this.source) ? this.source : [this.source])[index];
        let newResult = {
            test: 'timeout'
        };
        for (let i in object) {
            let _value = object[i];
            Core_1.Utility.ObjectDefineProperty(newResult, i, {
                get: function () {
                    return _value;
                },
                set: function (newValue) {
                    _value = newValue;
                    element[i] = newValue;
                },
                configurable: true,
                enumerable: true
            });
        }
        Object.getOwnPropertySymbols(object).forEach((prop) => {
            newResult[prop] = object[prop];
        });
        return newResult;
    }
    query(...expressions) {
        return new TrackingMemset(this.memset.query.apply(this.memset, expressions));
    }
    then(callback, errorCallback) {
        return this.memset.then.apply(this.memset, arguments);
    }
    add(value) {
        return this.memset.add.apply(this.memset, arguments);
    }
    update(value) {
        return this.memset.update.apply(this.memset, arguments);
    }
    delete(value) {
        return this.memset.delete.apply(this.memset, arguments);
    }
    selectTrackId(expressionsArr) {
        let expressions = [].concat(expressionsArr);
        let indexOfLast = expressions.lastIndexOf(x => x instanceof Expressions_1.Select);
        if (indexOfLast < 0) {
            return expressions; // gets all
        }
        expressions[indexOfLast] = new Expressions_1.Select([].concat(expressions[indexOfLast].args, {
            property: new Expressions_1.Property(this.trackingId)
        }));
        return expressions;
    }
    get(...expressions) {
        expressions = this.selectTrackId(expressions);
        return this.memset.get.apply(this.memset, expressions).then((response) => {
            if (typeof response === "number")
                return response;
            return (Array.isArray(response) ? response : [response]).map(x => {
                let indexOfItem = (Array.isArray(this.source) ? this.source : [this.source]).findIndex(a => a[this.trackingId] === x[this.trackingId]);
                if (indexOfItem < 0)
                    return x;
                let result = this.trackObject(indexOfItem, x);
                return result;
            });
        });
    }
}
exports.TrackingMemset = TrackingMemset;
