"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const memarrayvisitor_1 = require("./memarrayvisitor");
const dataset_1 = require("./dataset");
const memoperation_1 = require("./memoperation");
const core_1 = require("./core");
/**
 * Ne kadar Expression eklenirse eklenirsin WhenMemorized kısmı sonra çalışır.  Pipesetde ise MemOperationdan sonra işlemler memory üzerinden gerçekleşir.
 */
class Pointset extends dataset_1.DataSet {
    constructor(datasource, expressions = [], memOperations = []) {
        super(expressions);
        this.datasource = datasource;
        this.memOperations = memOperations;
    }
    getExpressions() {
        return this.expressions.map(x => x);
    }
    static insureAsPromise(value) {
        return core_1.Utility.instanceof(value, Promise) ? value : Promise.resolve(value);
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
                return this.applyMemOps(operations, response).then((resp) => {
                    return resp;
                });
            });
        }
        if (core_1.Utility.instanceof(pipe, memoperation_1.MemOperation))
            return Pointset.insureAsPromise(pipe.pipe(response)).then((response) => {
                return this.applyMemOps(operations, response).then((resp) => {
                    return resp;
                });
            });
        //expression da olabilir.
        return new memarrayvisitor_1.MemSet(response, [pipe]).then((resp) => {
            return resp;
        });
    }
    withOwnExpressions(expressions) {
        let exps = expressions || [];
        if (this.expressions == null)
            return exps.concat();
        if (!Array.isArray(this.expressions)) {
            throw new Error('expressions are not support');
        }
        return this.expressions.concat.apply(this.expressions, exps);
    }
    get(...expressions) {
        let exps = this.withOwnExpressions(expressions);
        return this.datasource.get.apply(this.datasource, exps)
            .then((response) => {
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
        return new Pointset(this.datasource, this.withOwnExpressions(expressions), this.memOperations.map(x => x));
    }
}
exports.Pointset = Pointset;
