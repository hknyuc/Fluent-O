"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("./core");
const expressions_1 = require("./expressions");
const memarrayvisitor_1 = require("./memarrayvisitor");
class TrackingMemset extends memarrayvisitor_1.MemSet {
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
            core_1.Utility.ObjectDefineProperty(newResult, i, {
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
        let indexOfLast = expressions.lastIndexOf(x => core_1.Utility.instanceof(x, expressions_1.Select));
        if (indexOfLast < 0) {
            return expressions; // gets all
        }
        expressions[indexOfLast] = new expressions_1.Select([].concat(expressions[indexOfLast].args, {
            property: new expressions_1.Property(this.trackingId)
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
