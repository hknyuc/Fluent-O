import { DataSet } from './Dataset';
export declare class MapSet<T> extends DataSet<T> {
    private source;
    private mapFn;
    private mapFnEx?;
    constructor(source: DataSet<T>, mapFn: ((element: T, index: number, items: T[]) => any) | string, expressions?: Array<any>, mapFnEx?: ((element: T, beforeElement: any, index: Number, items: T[]) => any));
    private createMemset;
    query(...expression: Array<any>): MapSet<T>;
    private onlySelect;
    private onlyRange;
    private onlySortandElimination;
    add(item: any): Promise<never>;
    update(item: any): Promise<never>;
    delete(item: any): Promise<never>;
    get(...expression: Array<any>): any;
}
