import { RestClient } from './restclient';
import { DataSet } from './dataset';
import { ExpressionVisitor, Operation, Method, Expand, Value, InlineCount, Order, Skip, ModelMethod, Property, EqBinary, RefExpression, Select, Top, Filter, Count, Find, SelectMany, This, Root, It, Action, Func } from './Expressions';
export declare class ODataVisitor extends ExpressionVisitor {
    private _result;
    readonly visited: boolean;
    readonly result: string;
    private set;
    method(method: Method): void;
    action(action: Action): void;
    func(func: Func): void;
    find(find: Find): void;
    selectMany(selectMany: SelectMany): void;
    count(count: Count): void;
    select(select: Select): void;
    order(order: Order): void;
    top(top: Top): void;
    skip(skip: Skip): void;
    inlineCount(): void;
    filter(filter: Filter): void;
    expand(expand: Expand): void;
    value(value: Value): void;
    modelMethod(value: ModelMethod): void;
    property(property: Property): void;
    eqBinary(eqBinary: EqBinary): void;
    it(it: It): void;
    this($this: This): void;
    root(root: Root): void;
}
/**
 * Combines expression as one
 */
export declare class ODataCombineVisitor extends ExpressionVisitor {
    private expressions;
    readonly result: Array<any>;
    action(action: any): void;
    func(func: any): void;
    private distinct;
    set(key: string, empy: () => any, nonEmpty: (elem: any) => void): void;
    push(value: any): void;
    select(select: Select): void;
    count(count: Count): void;
    top(top: Top): void;
    skip(skip: Skip): void;
    it(it: any): void;
    this($this: This): void;
    root(root: any): void;
    order(order: Order): void;
    inlineCount(inlineCount: InlineCount): void;
    expand(expand: Expand): void;
    filter(filter: Filter): void;
    selectMany(selectMany: SelectMany): void;
    operation(op: Operation): void;
    find(find: Find): void;
    method(method: Method): void;
    value(value: Value): void;
    modelMethod(value: ModelMethod): void;
    property(property: Property): void;
    eqBinary(eqBinary: EqBinary): void;
    refExpression(refExpression: RefExpression): void;
}
export declare function idselector(ids: Array<string>): {
    apply: (value: any) => any;
};
export declare class ODataSet<T> extends DataSet<T> {
    private options;
    constructor(options: {
        url: string;
        http?: RestClient;
        arrayable?: boolean;
        expressions?: Array<any>;
        primary: {
            type: Object;
            name: string;
        };
    });
    query(...expressions: any[]): DataSet<T>;
    toString(): any;
    private appylExpression;
    getBody(expressions: Array<any>): any;
    anyBody(expressions: Array<any>): boolean;
    private getMethod;
    private invokeHttpMethod;
    get(...expressions: any[]): Promise<any>;
    __convertObject(value: any): any;
    __isEmptyObject(obj: any): boolean;
    __convertArray(values: any): any[];
    __convert(values: any): any;
    private static __dateToIsoUTC;
    add(element: T): Promise<any>;
    delete(element: T): Promise<any>;
    update(element: T): Promise<any>;
    private getIdsValue;
    private getPrimaryValue;
    private createHttp;
}
export declare class QuerySet {
    static get(...expressions: any[]): string;
}
export declare var entity: (name: any) => {
    get: (...expressions: any[]) => {
        asQuery: () => any;
    };
};
export declare class ODataConfig {
    static createHttp(): RestClient;
}
