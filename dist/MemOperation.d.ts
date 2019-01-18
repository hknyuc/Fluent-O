export declare abstract class MemOperation {
    abstract pipe(array: Array<any>): Promise<Array<any>>;
}
/**Distincts */
/**
 * Checks all properties
 */
declare class FullMatchDistinctOp extends MemOperation {
    pipe(array: any[]): Promise<any[]>;
}
/**
 * Checks  only equality of references
 */
declare class ReferenceDistinctOp extends MemOperation {
    pipe(array: any[]): Promise<any[]>;
}
/**
 * Checks only selected properties
 */
declare class OneProperyDistinctOp extends MemOperation {
    private properties;
    constructor(properties: Array<any>);
    pipe(array: any[]): Promise<any[]>;
}
export declare class Distincs {
    /**
    * Checks all properties
    */
    static fullMatch: FullMatchDistinctOp;
    /**
     * Checks  only equality of references
     */
    static referenceMatch: ReferenceDistinctOp;
    /**
     * Checks only selected properties
     */
    static propertyMatch: (...properties: any[]) => OneProperyDistinctOp;
}
/**
 * Distinct model
 * @param algorithm
 */
export declare function distinct(algorithm?: MemOperation | Array<any> | string): any;
/**
 * Checks all properties
 */
export declare function fullDistinct(): FullMatchDistinctOp;
declare class NotNullOp extends MemOperation {
    pipe(array: any[]): Promise<any[]>;
}
export declare function notNull(): NotNullOp;
declare class MapOp extends MemOperation {
    private mapFn;
    constructor(mapFn: (item: any, index: any, array: any) => any);
    pipe(array: any[]): Promise<any[]>;
}
/**
    * Returns the elements of an array that meet the condition specified in a callback function.
 * @param mapFn
 */
export declare function map(mapFn: (item: any, index: any, array: any) => any): MapOp;
export {};
