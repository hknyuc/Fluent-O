import { SelectPropertyFinder } from './visitors/selectPropertyFinder';
import { MemSet } from './memarrayvisitor';
import { Expand, Property, Find, Order, Top, Skip, Filter, Select } from './expressions';
import { DataSet, IDataSet } from './dataset';
class BranchContext {
    source: IDataSet<any>;
    branchName: string;
    expressions: Array<any>;
    constructor(source: IDataSet<any>, branchName: string, expressions: Array<any>) {
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
    static getPropertyAndGuaranteeResultIsArray(propName: string, response: any) {
        if (response == null) return [];
        let results = [];
        if (Array.isArray(response)) {
            response.forEach((item) => {
                let propValue = item[propName];
                if (propValue == null) return true;
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
        if (Array.isArray(propValue)) return propValue;
        return [propValue];
    }

    static getSelectOrExpandByUsedProperies(expressions: Array<any>) {
        let results = [];
        expressions.forEach((exp) => {
            let visitor = new SelectPropertyFinder();
            visitor.visit(exp);
            results.push.apply(results, visitor.getAsExpressions());
        });
        return results;
    }

    static isWillObject(expressions: Array<any>) {
        if (expressions == null) return false;
        return expressions.some(a => a instanceof Find);
    }
}


export interface IBranchStrategy {
    get(context: BranchContext): Promise<any>;
}

/**
 * Bütün işlemleri expand üzerinde yapar.
 */
export class DirectStrategy implements IBranchStrategy {

    private afterExpressions = [Find];

    private escapeAfterExpressions(expressions: Array<any>) {
        return expressions.filter(x => !this.afterExpressions.some(e => x instanceof e));
    }

    get(context: BranchContext) {
        let exps = this.escapeAfterExpressions(context.expressions);
        let expsWithUsedExpressions = exps.concat(BrachsetUtility.getSelectOrExpandByUsedProperies(exps));
        return context.source.get.apply(context.source, [new Expand([{
            property: new Property(context.branchName),
            expressions: expsWithUsedExpressions
        }])]).then((response) => {
            return new MemSet(BrachsetUtility.getPropertyAndGuaranteeResultIsArray(context.branchName, response), expsWithUsedExpressions).get();
        })
    }
}

/**
 * Single Side Collector    
 * Toplama işleminden sonra order,top,skip,filter işlemlerini yapar.
 */
class SSCollectorStrategy implements IBranchStrategy {

    private getExpandAndSelect(expressions: Array<any>) {
        let items = [Select, Expand];
        return expressions.filter(a => items.some(i => a instanceof i));
    }
    get(context: BranchContext): Promise<any> {
        // let exps =  this.escapeAfterExpressions(context.expressions).concat(this.getDoubleSourceExpressions(context.expressions));
        return context.source.get(new Expand([{
            property: new Property(context.branchName),
            expressions: this.getExpandAndSelect(context.expressions)
        }]))
            .then((response) => { // 
                let items = BrachsetUtility.getPropertyAndGuaranteeResultIsArray(context.branchName, response);
                // let allExpressions = context.expressions.concat(this.getDoubleSourceExpressions(context.expressions));
                return new MemSet(items || [], //hepsi alındıktan sonra filter,order,find,gibi diğer işlemler yapılıyor
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
class DSFCollectorStrategy implements IBranchStrategy {
    private afterExpressions = [Order, Top, Skip, Filter, Find];
    private usesDoubleSourceExpressions = [Filter];

    /**
     * 
     * @param expressions 
     */
    private escapeAfterExpressions(expressions: Array<any>) {
        return expressions.filter(x => !this.afterExpressions.some(e => x instanceof e));
    }

    private getDoubleSourceExpressions(expressions: Array<any>) {
        return expressions.filter(x => this.usesDoubleSourceExpressions.some(a => x instanceof a));
    }

    get(context: BranchContext): Promise<any> {
        let exps = this.escapeAfterExpressions(context.expressions).concat(this.getDoubleSourceExpressions(context.expressions));
        return context.source.get(new Expand([{
            property: new Property(context.branchName),
            expressions: exps
        }]))
            .then((response) => { // 
                let items = BrachsetUtility.getPropertyAndGuaranteeResultIsArray(context.branchName, response);
                // let allExpressions = context.expressions.concat(this.getDoubleSourceExpressions(context.expressions));
                return new MemSet(items, //hepsi alındıktan sonra filter,order,find,gibi diğer işlemler yapılıyor
                    context.expressions).then((r) => {
                        return r;
                    });
            });
    }
}
class SmartStrategy implements IBranchStrategy {
    getStrategy(context: BranchContext) {
        if (context.source.getExpressions().some(x => x instanceof Find)) return new DirectStrategy();
        return new SSCollectorStrategy();
    }
    get(context: BranchContext): Promise<any> {
        return this.getStrategy(context).get(context);
    }

}



/**
 * Herhangi bir source üzerindeki objenin expend edilen propertsini tek bir source gibi kullanmak için kullanılır.
 *
 */
export class Branchset<T> extends DataSet<T>{
    /**
     * Double side filter collector.
     * Toplama işleminden sonra ve source üzerinde order,top,skip,filter işlemlerini yapar.
     */
    static DoubleSideCollector: DSFCollectorStrategy = new DSFCollectorStrategy();
    /**
     * Single Side Collector
     * Toplama işleminden sonra order,top,skip,filter işlemlerini yapar.
    */
    static SingleSideCollector: SSCollectorStrategy = new SSCollectorStrategy();
    /**
     * Bütün işlemleri expand üzerinde yapar.
     */
    static Direct: DirectStrategy = new DirectStrategy();
    static SmartStrategy: SmartStrategy = new SmartStrategy();
    constructor(private source: IDataSet<any>, private branchName: string, expressions: Array<any> = [], private strategy: IBranchStrategy = new SmartStrategy()) {
        super(expressions)
    }


    get(...expressions: any[]): Promise<any> {
        return this.getOn(expressions);
    }

    private getOn(expressions: any[]){
        let items =  this.expressions.concat.apply(this.expressions, expressions);
        return this.strategy.get(new BranchContext(this.source, this.branchName,items));
    }
    add(element: T): Promise<any> {
        return this.source.add(element);
    }
    delete(element: T): Promise<any> {
        return this.source.delete(element);
    }
    update(element: T): Promise<any> {
        return this.source.update(element);
    }
    query(...expressions: any[]): IDataSet<T> {
        return new Branchset(this.source, this.branchName, this.expressions.concat.apply(this.expressions,expressions),this.strategy);
    }
}