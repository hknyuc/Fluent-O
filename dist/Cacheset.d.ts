import { DataSet } from "./dataset";
export declare class CacheSet<T> extends DataSet<T> {
    private static caches;
    private dataset;
    constructor(dataset: DataSet<T>);
    update(value: any): Promise<any>;
    add(value: any): Promise<any>;
    delete(value: any): Promise<any>;
    get(expressions: any): any;
    query(): CacheSet<{}>;
}
