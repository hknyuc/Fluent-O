import { ExpressionVisitor, Select, SelectMany, Order, Property, ModelMethod, Value, Expand, Skip, Find, Count, EqBinary, Operation, RefExpression, Root, Filter, It, GlobalMethod } from "./expressions";
import { DataSet } from "./dataset";
export declare class MemArrayVisitor extends ExpressionVisitor {
    private source;
    result: any;
    private rootValue;
    constructor(array: any, root: any);
    private getSource;
    select(select: Select): any;
    filter(filter: Filter): any;
    _selectManyArray(selectMany: SelectMany, source: Array<any>): never;
    _selectManyObject(selectMany: SelectMany, source: Object): any;
    selectMany(selectMany: SelectMany): any;
    skip(skip: Skip): any;
    top(top: Value): any;
    find(find: Find): any;
    createMemVisitor(source: any): MemArrayVisitor;
    count(count: Count): any;
    expendProperties(source: any, properties: Array<Property>): Promise<any>;
    order(order: Order): any;
    property(property: Property): any;
    __createNestedProperty(source: any, property: Property): {
        /**
         * sets value to created property
         */
        set: (value: any) => void;
    };
    __getNestedProperty(source: any, property: Property): any;
    it(it: It): void;
    getModelMethod(): {
        string: {
            contains: (value: any) => boolean;
            endswith: (value: string) => any;
            indexof: (value: string) => any;
            length: () => any;
            startswith: (value: string) => any;
            substring: (start: any, end?: any) => any;
            tolower: () => any;
            toupper: () => any;
            trim: () => any;
        };
        date: {
            date: () => any;
            day: () => any;
            fractionalseconds: () => any;
            hour: () => any;
            minute: () => any;
            month: () => any;
            second: () => any;
            time: () => any;
            year: () => any;
        };
    };
    globalMethod(globalMethod: GlobalMethod): any;
    modelMethod(modelMethod: ModelMethod): void;
    value(value: Value): any;
    expand(expand: Expand): any;
    operation(operation: Operation): void;
    eqBinary(eqBinary: EqBinary): void;
    root(root: Root): void;
    refExpression(refExpression: RefExpression): void;
}
export declare class MemSet extends DataSet<any> {
    protected source: Array<any>;
    private _trackingId;
    trackingId: Symbol;
    constructor(source: Array<any>, expressions?: Array<any>);
    private addTrackingId;
    query(...expressions: any[]): MemSet;
    get(...expressions: any[]): Promise<any>;
    add(element: any): Promise<any>;
    private __getValueOf;
    __is(base: any, element: any): boolean;
    delete(element: any): Promise<any>;
    update(element: any): Promise<any>;
}
