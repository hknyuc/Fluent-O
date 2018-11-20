import { SelectPropertyFinder } from './visitors/selectPropertyFinder';
import { MemSet } from './MemArrayVisitor';
import { Expand, Property, Find, Order, Top, Skip, Filter } from './Expressions';
import { DataSet, IDataSet } from './Dataset';
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
        if (response == null) return null;
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

/**
 *  Herhangi bir source üzerindeki objenin expend edilen propertsini tek bir source gibi kullanmak için kullanılır.
 */
export class SelectManySet<T> extends DataSet<T>{
    private afterExpressions = [Order, Top, Skip, Filter,Find];
    private usesDoubleSourceExpressions = [Filter];
    constructor(private source: IDataSet<any>, private branchName: string, expressions = []) {
        super(expressions);
    }

    query(...expressions: Array<any>) {
        return new SelectManySet(this.source, this.branchName, this.expressions.concat.apply(this.expressions, expressions));
    }

    /**
     * 
     * @param expressions 
     */
    private escapeAfterExpressions(expressions: Array<any>) {
        return expressions.filter(x => !this.afterExpressions.some(e => x instanceof e));
    }


    /*
    private getAfterExpressions(expressions: Array<any>) {
        return expressions.filter(x => this.afterExpressions.some(e => x instanceof e));
    }
    */

    private getDoubleSourceExpressions(expressions: Array<any>) {
        return expressions.filter(x => this.usesDoubleSourceExpressions.some(a => x instanceof a));
    }


    private getOn(context: BranchContext) {
        return context.source.get(new Expand([{
            property: new Property(context.branchName),
            expressions: this.escapeAfterExpressions(context.expressions).concat(this.getDoubleSourceExpressions(context.expressions))
        }]))
            .then((response) => { // 
                let items = BrachsetUtility.getPropertyAndGuaranteeResultIsArray(context.branchName, response);
                let allExpressions = context.expressions.concat(this.getDoubleSourceExpressions(context.expressions));
                return new MemSet(items, //hepsi alındıktan sonra filter,order,find,gibi diğer işlemler yapılıyor
                    allExpressions).then((r) => {
                        console.log({items,allExpressions,r})
                        return r;
                    });
            });
    }

    get(...expressions: Array<any>) {
        return this.getOn(new BranchContext(this.source, this.branchName, [].concat(this.expressions).concat(expressions)));
    }

    /**
     * Diğer expression da kullanılan propertleri de alarak onlarında yüklenmesini sağlar.
     * @param expressions 
     */

    then(callback, errorCallback?): Promise<any> {
        return this.getOn(new BranchContext(this.source, this.branchName, this.expressions)).then((response) => {
            return callback(response);
        }, (error) => errorCallback || (function (a) { })(error));
    }
}

/**
 * İki kere expression işlemi implement ediliyor. Biri sourceda biri memory de.
 */
export class DirectBranchSet<T> extends DataSet<T>{
    private afterExpressions = [Find];
    constructor(private source: IDataSet<any>, private branchName: string, expressions = []) {
        super(expressions)
    }

    private escapeAfterExpressions(expressions: Array<any>) {
        return expressions.filter(x => !this.afterExpressions.some(e => x instanceof e));
    }

    get(...expressions: Array<any>) {
        let exps = this.escapeAfterExpressions(this.expressions.concat(expressions));
        let expsWithUsedExpressions = exps.concat(BrachsetUtility.getSelectOrExpandByUsedProperies(exps));
        return this.source.get.apply(this.source, new Expand([{
            property: new Property(this.branchName),
            expressions: expsWithUsedExpressions
        }])).then((response) => {
            return new MemSet(BrachsetUtility.getPropertyAndGuaranteeResultIsArray(this.branchName, response), expsWithUsedExpressions).then((response) => {
                return response;
            });
        })
    }
}


/**
 * Herhangi bir source üzerindeki objenin expend edilen propertsini tek bir source gibi kullanmak için kullanılır.
 *
 */
export class Branchset<T> implements IDataSet<T>{
    private strategy:IDataSet<any>;
    constructor(private source:IDataSet<any>,private branchName:string,private expressions:Array<any> = []){
        this.strategy = this.getDataset();
    }

    getDataset(){
        let anyFind = this.source.getExpressions().some(x=> x instanceof Find);
        if(anyFind) return new DirectBranchSet(this.source,this.branchName,this.expressions);
        return new SelectManySet(this.source,this.branchName,this.expressions);
    }

    getExpressions(): any[] {
        return this.expressions;
    }
    get(...expressions: any[]): Promise<any> {
        return this.strategy.get.apply(this.strategy,expressions);
    }
    add(element: T): Promise<any> {
        return this.strategy.add(element);
    }
    delete(element: T): Promise<any> {
        return this.strategy.delete(element);
    }
    update(element: T): Promise<any> {
        return this.strategy.update(element);
    }
    query(...expressions: any[]): IDataSet<T> {
        return new Branchset(this.source,this.branchName,this.expressions.concat(expressions));
    }
    then(callback: any, errorCallback?: any): Promise<any> {
        return this.strategy.then(callback,errorCallback);
    }
    map(mapFn: (element: any) => any): Promise<any> {
        return this.strategy.map(mapFn);
    }
    insertTo(params: object | any[]): Promise<any> {
        return this.strategy.insertTo(params);
    }
}