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
            return [];
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
 * Bütün işlemleri expand üzerinde yapar.
 */
class DirectStrategy {
    constructor() {
        this.afterExpressions = [Expressions_1.Find];
    }
    escapeAfterExpressions(expressions) {
        return expressions.filter(x => !this.afterExpressions.some(e => x instanceof e));
    }
    get(context) {
        let exps = this.escapeAfterExpressions(context.expressions);
        let expsWithUsedExpressions = exps.concat(BrachsetUtility.getSelectOrExpandByUsedProperies(exps));
        return context.source.get.apply(context.source, [new Expressions_1.Expand([{
                    property: new Expressions_1.Property(context.branchName),
                    expressions: expsWithUsedExpressions
                }])]).then((response) => {
            return new MemArrayVisitor_1.MemSet(BrachsetUtility.getPropertyAndGuaranteeResultIsArray(context.branchName, response), expsWithUsedExpressions).get();
        });
    }
}
exports.DirectStrategy = DirectStrategy;
/**
 * Single Side Collector
 * Toplama işleminden sonra order,top,skip,filter işlemlerini yapar.
 */
class SSCollectorStrategy {
    getExpandAndSelect(expressions) {
        let items = [Expressions_1.Select, Expressions_1.Expand];
        return expressions.filter(a => items.some(i => a instanceof i));
    }
    get(context) {
        // let exps =  this.escapeAfterExpressions(context.expressions).concat(this.getDoubleSourceExpressions(context.expressions));
        return context.source.get(new Expressions_1.Expand([{
                property: new Expressions_1.Property(context.branchName),
                expressions: this.getExpandAndSelect(context.expressions)
            }]))
            .then((response) => {
            let items = BrachsetUtility.getPropertyAndGuaranteeResultIsArray(context.branchName, response);
            // let allExpressions = context.expressions.concat(this.getDoubleSourceExpressions(context.expressions));
            return new MemArrayVisitor_1.MemSet(items || [], //hepsi alındıktan sonra filter,order,find,gibi diğer işlemler yapılıyor
            context.expressions).then((r) => {
                return r;
            });
        });
    }
}
/**
 * Double side filter collector.
 * Toplama işleminden sonra ve source üzerinde order,top,skip,filter işlemlerini yapar.
 */
class DSFCollectorStrategy {
    constructor() {
        this.afterExpressions = [Expressions_1.Order, Expressions_1.Top, Expressions_1.Skip, Expressions_1.Filter, Expressions_1.Find];
        this.usesDoubleSourceExpressions = [Expressions_1.Filter];
    }
    /**
     *
     * @param expressions
     */
    escapeAfterExpressions(expressions) {
        return expressions.filter(x => !this.afterExpressions.some(e => x instanceof e));
    }
    getDoubleSourceExpressions(expressions) {
        return expressions.filter(x => this.usesDoubleSourceExpressions.some(a => x instanceof a));
    }
    get(context) {
        let exps = this.escapeAfterExpressions(context.expressions).concat(this.getDoubleSourceExpressions(context.expressions));
        return context.source.get(new Expressions_1.Expand([{
                property: new Expressions_1.Property(context.branchName),
                expressions: exps
            }]))
            .then((response) => {
            let items = BrachsetUtility.getPropertyAndGuaranteeResultIsArray(context.branchName, response);
            // let allExpressions = context.expressions.concat(this.getDoubleSourceExpressions(context.expressions));
            return new MemArrayVisitor_1.MemSet(items, //hepsi alındıktan sonra filter,order,find,gibi diğer işlemler yapılıyor
            context.expressions).then((r) => {
                return r;
            });
        });
    }
}
class SmartStrategy {
    getStrategy(context) {
        if (context.source.getExpressions().some(x => x instanceof Expressions_1.Find))
            return new DirectStrategy();
        return new SSCollectorStrategy();
    }
    get(context) {
        return this.getStrategy(context).get(context);
    }
}
/**
 * Herhangi bir source üzerindeki objenin expend edilen propertsini tek bir source gibi kullanmak için kullanılır.
 *
 */
class Branchset extends Dataset_1.DataSet {
    constructor(source, branchName, expressions = [], strategy = new SmartStrategy()) {
        super(expressions);
        this.source = source;
        this.branchName = branchName;
        this.strategy = strategy;
    }
    get(...expressions) {
        return this.getOn(expressions);
    }
    getOn(expressions) {
        let items = this.expressions.concat.apply(this.expressions, expressions);
        return this.strategy.get(new BranchContext(this.source, this.branchName, items));
    }
    add(element) {
        return this.source.add(element);
    }
    delete(element) {
        return this.source.delete(element);
    }
    update(element) {
        return this.source.update(element);
    }
    query(...expressions) {
        return new Branchset(this.source, this.branchName, this.expressions.concat.apply(this.expressions, expressions), this.strategy);
    }
}
/**
 * Double side filter collector.
 * Toplama işleminden sonra ve source üzerinde order,top,skip,filter işlemlerini yapar.
 */
Branchset.DoubleSideCollector = new DSFCollectorStrategy();
/**
 * Single Side Collector
 * Toplama işleminden sonra order,top,skip,filter işlemlerini yapar.
*/
Branchset.SingleSideCollector = new SSCollectorStrategy();
/**
 * Bütün işlemleri expand üzerinde yapar.
 */
Branchset.Direct = new DirectStrategy();
Branchset.SmartStrategy = new SmartStrategy();
exports.Branchset = Branchset;
