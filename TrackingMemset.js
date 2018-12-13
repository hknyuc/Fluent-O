"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expressions_1 = require("./Expressions");
const Schema_1 = require("./Schema");
const MemArrayVisitor_1 = require("./MemArrayVisitor");
const Operations_1 = require("./Operations");
class TrackingMemset extends MemArrayVisitor_1.MemSet {
    constructor(memset) {
        super(memset["source"], memset.getExpressions());
        this.memset = memset;
        this.trackingId = Symbol(Schema_1.Guid.newString().toString());
        this.source.forEach((item) => {
            this.addTrackingId(item);
        });
    }
    trackObject(index, object) {
        let element = (Array.isArray(this.source) ? this.source : [this.source])[index];
        for (let i in object) {
            let _value;
            Object.defineProperty(object, i, {
                get: function () {
                    return _value;
                },
                set: function (newValue) {
                    _value = newValue;
                    element[i] = newValue;
                }
            });
        }
    }
    then(callback, errorCallback) {
        return this.memset.then.apply(this.memset, arguments);
    }
    addTrackingId(value) {
        if (value != null) {
            let v = Schema_1.Guid.newString();
            Object.defineProperty(value, this.trackingId, {
                get: function () {
                    return v;
                }
            });
        }
    }
    add(value) {
        this.addTrackingId(value);
        return this.memset.add.apply(this.memset, arguments);
    }
    update(value) {
        return this.memset.update.apply(this.memset, arguments);
    }
    delete(value) {
        return this.memset.delete.apply(this.memset, arguments);
    }
    get(...expressions) {
        let anySelect = expressions.find(x => x instanceof Expressions_1.Select);
        let externalExpression = anySelect != null ? [Operations_1.select(this.trackingId)] : [];
        expressions = [].concat(expressions, externalExpression);
        return this.memset.get.apply(this.memset, expressions).then((response) => {
            if (typeof response === "number")
                return response;
            return (Array.isArray(response) ? response : [response]).map(x => {
                let indexOfItem = (Array.isArray(this.source) ? this.source : [this.source]).findIndex(a => a[this.trackingId] === x[this.trackingId]);
                if (indexOfItem < 0)
                    return x;
                this.trackObject(indexOfItem, x);
                return x;
            });
        });
    }
}
exports.TrackingMemset = TrackingMemset;
//# sourceMappingURL=TrackingMemset.js.map