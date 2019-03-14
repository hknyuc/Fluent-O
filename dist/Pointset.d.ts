import { IDataSet, DataSet } from './dataset';
import { MemOperation } from './memoperation';
/**
 * Ne kadar Expression eklenirse eklenirsin WhenMemorized kısmı sonra çalışır.  Pipesetde ise MemOperationdan sonra işlemler memory üzerinden gerçekleşir.
 */
export declare class Pointset<T> extends DataSet<T> {
    private datasource;
    private memOperations;
    constructor(datasource: IDataSet<T>, expressions?: Array<any>, memOperations?: Array<any>);
    getExpressions(): any[];
    private static insureAsPromise;
    /**
     * Hafıza alındığında yapılacak işlemler.
     * @param expressions MemOperation ya da expressions
     */
    whenMemorized(...expressions: Array<MemOperation | any>): Pointset<T>;
    private applyMemOps;
    private withOwnExpressions;
    get(...expressions: any[]): Promise<any>;
    add(element: T): Promise<any>;
    delete(element: T): Promise<any>;
    update(element: T): Promise<any>;
    query(...expressions: any[]): Pointset<T>;
}
