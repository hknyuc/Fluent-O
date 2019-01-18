import { MemSet } from './MemArrayVisitor';
export declare class TrackingMemset extends MemSet {
    private memset;
    constructor(memset: MemSet);
    private trackObject;
    query(...expressions: any[]): TrackingMemset;
    then(callback: any, errorCallback?: any): Promise<any>;
    add(value: any): Promise<any>;
    update(value: any): Promise<any>;
    delete(value: any): Promise<any>;
    private selectTrackId;
    get(...expressions: any[]): any;
}
