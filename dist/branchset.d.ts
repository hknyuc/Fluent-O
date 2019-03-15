import { DataSet, IDataSet } from './dataset';
declare class BranchContext {
    source: IDataSet<any>;
    branchName: string;
    expressions: Array<any>;
    constructor(source: IDataSet<any>, branchName: string, expressions: Array<any>);
}
export interface IBranchStrategy {
    get(context: BranchContext): Promise<any>;
}
/**
 * Bütün işlemleri expand üzerinde yapar.
 */
export declare class DirectStrategy implements IBranchStrategy {
    private afterExpressions;
    private escapeAfterExpressions;
    get(context: BranchContext): any;
}
/**
 * Single Side Collector
 * Toplama işleminden sonra order,top,skip,filter işlemlerini yapar.
 */
declare class SSCollectorStrategy implements IBranchStrategy {
    private getExpandAndSelect;
    get(context: BranchContext): Promise<any>;
}
/**
 * Double side filter collector.
 * Toplama işleminden sonra ve source üzerinde order,top,skip,filter işlemlerini yapar.
 */
declare class DSFCollectorStrategy implements IBranchStrategy {
    private afterExpressions;
    private usesDoubleSourceExpressions;
    /**
     *
     * @param expressions
     */
    private escapeAfterExpressions;
    private getDoubleSourceExpressions;
    get(context: BranchContext): Promise<any>;
}
declare class SmartStrategy implements IBranchStrategy {
    getStrategy(context: BranchContext): DirectStrategy | SSCollectorStrategy;
    get(context: BranchContext): Promise<any>;
}
/**
 * Herhangi bir source üzerindeki objenin expend edilen propertsini tek bir source gibi kullanmak için kullanılır.
 *
 */
export declare class Branchset<T> extends DataSet<T> {
    private source;
    private branchName;
    private strategy;
    /**
     * Double side filter collector.
     * Toplama işleminden sonra ve source üzerinde order,top,skip,filter işlemlerini yapar.
     */
    static DoubleSideCollector: DSFCollectorStrategy;
    /**
     * Single Side Collector
     * Toplama işleminden sonra order,top,skip,filter işlemlerini yapar.
    */
    static SingleSideCollector: SSCollectorStrategy;
    /**
     * Bütün işlemleri expand üzerinde yapar.
     */
    static Direct: DirectStrategy;
    static SmartStrategy: SmartStrategy;
    constructor(source: IDataSet<any>, branchName: string, expressions?: Array<any>, strategy?: IBranchStrategy);
    get(...expressions: any[]): Promise<any>;
    private getOn;
    add(element: T): Promise<any>;
    delete(element: T): Promise<any>;
    update(element: T): Promise<any>;
    query(...expressions: any[]): IDataSet<T>;
}
export {};
