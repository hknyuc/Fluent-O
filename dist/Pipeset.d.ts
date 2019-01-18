import { DataSet, IDataSet } from './Dataset';
/**
 * Query kısmına extradan lokalde yapılan işlemler eklenebilir. O işlemden sonra diğer işlem memset üzeriden gider.
 */
export declare class Pipeset<T> extends DataSet<T> {
    private source;
    constructor(source: IDataSet<T>, expressions?: Array<any>);
    query(...expression: Array<any>): Pipeset<T>;
    getExpressions(): any[];
    private notPipeQuery;
    private isPipeQuery;
    private splitExpressionsByPipeQuery;
    add(item: any): Promise<any>;
    update(item: any): Promise<any>;
    delete(item: any): Promise<any>;
    private isFunction;
    get(...expression: Array<any>): any;
}
