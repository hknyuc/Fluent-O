import { DataSet, IDataSet } from './Dataset';
export declare class ChangeSet<T> extends DataSet<T> {
    private source;
    private onAdding;
    private onAdded;
    private onDeleting;
    private onDeleted;
    private onUpdating;
    private onUpdated;
    constructor(source: IDataSet<any>);
    onAdd(callback: (value: any) => boolean): ChangeSet<T>;
    whenAdded(callback: (value: any) => any): ChangeSet<T>;
    whenDeleted(callback: (value: any) => any): ChangeSet<T>;
    whenUpdated(callback: (value: any) => any): ChangeSet<T>;
    onDelete(callback: (value: any) => boolean): ChangeSet<T>;
    onUpdate(callback: (value: any) => boolean): ChangeSet<T>;
    getEmitValue(obj: any): any;
    getInterrupted(message: any): ChangeSetinterruptedArgs;
    query(...expressions: Array<any>): ChangeSet<T>;
    add(value: any): Promise<T>;
    update(value: any): Promise<T>;
    delete(value: any): Promise<T>;
    get(): any;
}
export declare class ChangeSetinterruptedArgs {
    changeset: any;
    message: any;
    constructor(changeset: any, message: any);
}
