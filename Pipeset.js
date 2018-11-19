"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Dataset_1 = require("./Dataset");
class Pipeset extends Dataset_1.DataSet {
    constructor(source, pipes, expressions = []) {
        super(expressions);
        this.source = source;
        this.pipes = pipes;
    }
    query(...expression) {
        return new Pipeset(this.source, this.pipes, [].concat(this.expressions).concat(expression));
    }
    getExpressions() {
        return this.expressions;
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
        return this.source.query.apply(this.source, [].concat(this.expressions).concat(expression)).then((r) => {
            return getResultFromPipesAsPromise(this.pipes, r);
        });
    }
}
exports.Pipeset = Pipeset;
//# sourceMappingURL=Pipeset.js.map