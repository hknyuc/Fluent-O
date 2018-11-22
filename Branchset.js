"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const selectPropertyFinder_1 = require("./visitors/selectPropertyFinder");
const MemArrayVisitor_1 = require("./MemArrayVisitor");
const Expressions_1 = require("./Expressions");
const Dataset_1 = require("./Dataset");
class BranchContext {
    constructor(source, branchName, expressions) {
        this.source = source;
        this.branchName = branchName;
        this.expressions = expressions;
    }
}
class BrachsetUtility {
    /**
     * Eğer alınan sonuç array ise tek bir array olarak birleştirilir. Eğer object ise array olarak toplanıp dönülür.
     * @param context
     * @param response
     */
    static getPropertyAndGuaranteeResultIsArray(propName, response) {
        if (response == null)
            return null;
        let results = [];
        if (Array.isArray(response)) {
            response.forEach((item) => {
                let propValue = item[propName];
                if (propValue == null)
                    return true;
                if (Array.isArray(propValue)) {
                    results.push.apply(results, propValue);
                    return true;
                }
                results.push(propValue);
                return true;
            });
            return results;
        }
        let propValue = response[propName];
        if (Array.isArray(propValue))
            return propValue;
        return [propValue];
    }
    static getSelectOrExpandByUsedProperies(expressions) {
        let results = [];
        expressions.forEach((exp) => {
            let visitor = new selectPropertyFinder_1.SelectPropertyFinder();
            visitor.visit(exp);
            results.push.apply(results, visitor.getAsExpressions());
        });
        return results;
    }
    static isWillObject(expressions) {
        if (expressions == null)
            return false;
        return expressions.some(a => a instanceof Expressions_1.Find);
    }
}
/**
 *  Herhangi bir source üzerindeki objenin expend edilen propertsini tek bir source gibi kullanmak için kullanılır.
 */
class SelectManySet extends Dataset_1.DataSet {
    constructor(source, branchName, expressions = []) {
        super(expressions);
        this.source = source;
        this.branchName = branchName;
        this.afterExpressions = [Expressions_1.Order, Expressions_1.Top, Expressions_1.Skip, Expressions_1.Filter, Expressions_1.Find];
        this.usesDoubleSourceExpressions = [Expressions_1.Filter];
    }
    query(...expressions) {
        return new SelectManySet(this.source, this.branchName, this.withOwnExpressions(expressions));
    }
    /**
     *
     * @param expressions
     */
    escapeAfterExpressions(expressions) {
        return expressions.filter(x => !this.afterExpressions.some(e => x instanceof e));
    }
    /*
    private getAfterExpressions(expressions: Array<any>) {
        return expressions.filter(x => this.afterExpressions.some(e => x instanceof e));
    }
    */
    getDoubleSourceExpressions(expressions) {
        return expressions.filter(x => this.usesDoubleSourceExpressions.some(a => x instanceof a));
    }
    getOn(context) {
        let exps = this.escapeAfterExpressions(context.expressions).concat(this.getDoubleSourceExpressions(context.expressions));
        return context.source.get(new Expressions_1.Expand([{
                property: new Expressions_1.Property(context.branchName),
                expressions: exps
            }]))
            .then((response) => {
            let items = BrachsetUtility.getPropertyAndGuaranteeResultIsArray(context.branchName, response);
            let allExpressions = context.expressions.concat(this.getDoubleSourceExpressions(context.expressions));
            return new MemArrayVisitor_1.MemSet(items, //hepsi alındıktan sonra filter,order,find,gibi diğer işlemler yapılıyor
            allExpressions).then((r) => {
                return r;
            });
        });
    }
    withOwnExpressions(expressions) {
        return this.expressions.concat.apply(this.expressions, expressions);
    }
    get(...expressions) {
        return this.getOn(new BranchContext(this.source, this.branchName, this.withOwnExpressions(expressions)));
    }
    /**
     * Diğer expression da kullanılan propertleri de alarak onlarında yüklenmesini sağlar.
     * @param expressions
     */
    then(callback, errorCallback) {
        return this.getOn(new BranchContext(this.source, this.branchName, [])).then((response) => {
            return callback(response);
        }, (error) => errorCallback || (function (a) { })(error));
    }
}
exports.SelectManySet = SelectManySet;
/**
 * İki kere expression işlemi implement ediliyor. Biri sourceda biri memory de.
 */
class DirectBranchSet extends Dataset_1.DataSet {
    constructor(source, branchName, expressions = []) {
        super(expressions);
        this.source = source;
        this.branchName = branchName;
        this.afterExpressions = [Expressions_1.Find];
    }
    escapeAfterExpressions(expressions) {
        return expressions.filter(x => !this.afterExpressions.some(e => x instanceof e));
    }
    get(...expressions) {
        let exps = this.escapeAfterExpressions(this.expressions.concat(expressions));
        let expsWithUsedExpressions = exps.concat(BrachsetUtility.getSelectOrExpandByUsedProperies(exps));
        console.log({ exps, expsWithUsedExpressions });
        return this.source.get.apply(this.source, new Expressions_1.Expand([{
                property: new Expressions_1.Property(this.branchName),
                expressions: expsWithUsedExpressions
            }])).then((response) => {
            return new MemArrayVisitor_1.MemSet(BrachsetUtility.getPropertyAndGuaranteeResultIsArray(this.branchName, response), expsWithUsedExpressions).then((response) => {
                console.log({ response });
                return response;
            });
        });
    }
}
exports.DirectBranchSet = DirectBranchSet;
/**
 * Herhangi bir source üzerindeki objenin expend edilen propertsini tek bir source gibi kullanmak için kullanılır.
 *
 */
class Branchset {
    constructor(source, branchName, expressions = []) {
        this.source = source;
        this.branchName = branchName;
        this.expressions = expressions;
        this.strategy = this.getDataset();
    }
    getDataset() {
        let anyFind = this.source.getExpressions().some(x => x instanceof Expressions_1.Find);
        if (anyFind)
            return new DirectBranchSet(this.source, this.branchName, this.expressions);
        return new SelectManySet(this.source, this.branchName, this.expressions);
    }
    getExpressions() {
        return this.expressions;
    }
    get(...expressions) {
        return this.strategy.get.apply(this.strategy, expressions);
    }
    add(element) {
        return this.strategy.add(element);
    }
    delete(element) {
        return this.strategy.delete(element);
    }
    update(element) {
        return this.strategy.update(element);
    }
    query(...expressions) {
        return new Branchset(this.source, this.branchName, this.expressions.concat(expressions));
    }
    then(callback, errorCallback) {
        return this.strategy.then(callback, errorCallback);
    }
    map(mapFn) {
        return this.strategy.map(mapFn);
    }
    insertTo(params) {
        return this.strategy.insertTo(params);
    }
}
exports.Branchset = Branchset;
//# sourceMappingURL=Branchset.js.map