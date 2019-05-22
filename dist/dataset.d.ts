/**
 * Base data source for applying operations
 */
export declare class DataSet<T> implements IDataSet<T> {
    protected expressions: Array<any>;
    constructor(expressions: Array<any>);
    getExpressions(): any[];
    /**
     * fetches data as array from source.
     * @param expressions specifies events that will operate on the resource.
     */
    get(...expressions: Array<any>): Promise<any>;
    /**
     * adds element to source
     * @param element
     */
    add(element: T): Promise<any>;
    /**
     * deletes element from source
     * @param element
     */
    delete(element: T): Promise<any>;
    /**
     * updates element
     * @param element
     */
    update(element: T): Promise<any>;
    /**
     * creates a new dataset after it applied expression on it
     * @param expressions specifies events that will operate on the resource.
     */
    query(...expressions: Array<any>): IDataSet<T>;
    /**
     * fetches data as array from source.
     * @returns Promise
     */
    then(callback: any, errorCallback?: any): Promise<any>;
    map(mapFn: (element: any) => any): Promise<any>;
    insertTo(params: Array<any> | object): Promise<any>;
    static is(dataSetable: any): boolean;
}
export declare class DecorateSet<T> extends DataSet<T> {
    dataSet: DataSet<T>;
    observer: {
        get?: Function;
        add?: Function;
        delete?: Function;
        update?: Function;
        addUpdate?: Function;
    };
    constructor(dataSet: DataSet<T>, observer: {
        get?: Function;
        add?: Function;
        delete?: Function;
        update?: Function;
        addUpdate?: Function;
    });
    get(...expressions: Array<any>): any;
    map(mapFn: any): Promise<any>;
    insertTo(params: any): Promise<any>;
    add(element: T): Promise<any>;
    delete(element: T): any;
    update(element: T): any;
    query(...expressions: Array<any>): any;
}
export interface IDataSet<T> {
    getExpressions(): Array<any>;
    /**
    * fetches data as array from source.
    * @param expressions specifies events that will operate on the resource.
    */
    get(...expressions: Array<any>): Promise<any>;
    /**
     * adds element to source
     * @param element
     */
    add(element: T): Promise<any>;
    /**
     * deletes element from source
     * @param element
     */
    delete(element: T): Promise<any>;
    /**
     * updates element
     * @param element
     */
    update(element: T): Promise<any>;
    /**
     * creates a new dataset after it applied expression on it
     * @param expressions specifies events that will operate on the resource.
     */
    query(...expressions: Array<any>): IDataSet<T>;
    /**
     * fetches data as array from source.
     * @returns Promise
     */
    then(callback: any, errorCallback?: any): Promise<any>;
    map(mapFn: (element: any) => any): Promise<any>;
    insertTo(params: Array<any> | object): Promise<any>;
}
