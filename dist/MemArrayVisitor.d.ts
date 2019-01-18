import { ExpressionVisitor, Select, SelectMany, Order, Property, ModelMethod, Value, Expand, Skip, Find, Count, EqBinary, Operation, RefExpression, Root, Filter, It, GlobalMethod } from "./Expressions";
import { DataSet } from "./Dataset";
export declare class MemArrayVisitor extends ExpressionVisitor {
    private source;
    result: any;
    private rootValue;
    constructor(array: any, root: any);
    private getSource;
    select(select: Select): Promise<any>;
    filter(filter: Filter): Promise<any>;
    _selectManyArray(selectMany: SelectMany, source: Array<any>): never;
    _selectManyObject(selectMany: SelectMany, source: Object): any;
    selectMany(selectMany: SelectMany): Promise<any>;
    skip(skip: Skip): Promise<any>;
    top(top: Value): Promise<any>;
    find(find: Find): Promise<any>;
    createMemVisitor(source: any): MemArrayVisitor;
    count(count: Count): Promise<any>;
    expendProperties(source: any, properties: Array<Property>): Promise<any>;
    order(order: Order): Promise<any>;
    property(property: Property): Promise<any>;
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
    globalMethod(globalMethod: GlobalMethod): Promise<any>;
    modelMethod(modelMethod: ModelMethod): void;
    value(value: Value): any;
    expand(expand: Expand): Promise<any>;
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
