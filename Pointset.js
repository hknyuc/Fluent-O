"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MemArrayVisitor_1 = require("./MemArrayVisitor");
const Dataset_1 = require("./Dataset");
const MemOperation_1 = require("./MemOperation");
class Pointset extends Dataset_1.DataSet {
    constructor(datasource, expressions = [], memOperations = []) {
        super(expressions);
        this.datasource = datasource;
        this.memOperations = memOperations;
    }
    getExpressions() {
        return this.expressions.map(x => x);
    }
    static insureAsPromise(value) {
        return value instanceof Promise ? value : Promise.resolve(value);
    }
    /**
     * Hafıza alındığında yapılacak işlemler.
     * @param expressions MemOperation ya da expressions
     */
    whenMemorized(...expressions) {
        this.memOperations = this.memOperations.concat(expressions);
        return this;
    }
    applyMemOps(ops, response) {
        if (!Array.isArray(response) || ops.length === 0)
            return Pointset.insureAsPromise(response);
        let operations = [].concat(ops);
        let pipe = operations.pop();
        if (typeof pipe === "function") {
            return Pointset.insureAsPromise(pipe(response)).then((response) => {
                return this.applyMemOps(operations, response);
            });
        }
        if (pipe instanceof MemOperation_1.MemOperation)
            return Pointset.insureAsPromise(pipe.pipe(response)).then((response) => {
                return this.applyMemOps(operations, response);
            });
        //expressionda olabilir.
        return new MemArrayVisitor_1.MemSet(response, [pipe]).then((resp) => {
            return resp;
        });
    }
    get(...expressions) {
        return this.datasource.get.apply(this.datasource, arguments).then((response) => {
            return this.applyMemOps(this.memOperations, response);
        });
    }
    add(element) {
        return this.datasource.add(element);
    }
    delete(element) {
        return this.datasource.delete(element);
    }
    update(element) {
        return this.datasource.update(element);
    }
    query(...expressions) {
        return new Pointset(this.datasource, this.expressions.concat(expressions), this.memOperations.map(x => x));
    }
}
exports.Pointset = Pointset;
//# sourceMappingURL=Pointset.js.map