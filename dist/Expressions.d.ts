import { DataSet } from './Dataset';
export declare class Operation {
    type: string;
    constructor(type: string);
}
export declare class Method {
}
export declare class Select extends Method {
    args: Array<{
        property: Property;
        expression?: any;
    }>;
    constructor(args?: Array<{
        property: Property;
        expression?: any;
    }>);
    reduce(...params: Array<Select>): Select;
}
export declare class Filter extends Method {
    expression: any;
    constructor(expression: any);
}
export declare class InlineCount extends Method {
    constructor();
}
export declare class Order extends Method {
    property: Property;
    type?: 'desc' | 'asc';
    constructor(property: Property, type?: 'desc' | 'asc');
}
export declare class Top extends Method {
    value: number;
    constructor(value: number);
}
export declare class Skip extends Method {
    value: number;
    constructor(value: number);
}
export declare class Action {
    name: String;
    parameters: Array<any>;
    constructor(name: String, parameters: Array<any>);
}
export declare class Func {
    name: String;
    parameters: Array<any>;
    constructor(name: String, parameters: Array<any>);
}
export declare class Find {
    value: any;
    expression?: any;
    constructor(value: any, expression?: any);
}
export declare class This {
}
export declare class Root {
    constructor();
}
export declare class DataSource {
    name: string;
    expression: any;
    constructor(name: string, expression: any);
}
export declare class SelectMany {
    name: string;
    parent?: any;
    constructor(name: string, parent?: any);
}
export declare class Count extends Method {
    expression: any;
    constructor(expression: any);
}
export declare class Expand extends Method {
    args: Array<{
        property: Property;
        expressions: Array<any>;
    }>;
    constructor(args: Array<{
        property: Property;
        expressions: Array<any>;
    }>);
}
export declare class SourceGet {
    expressions: Array<any>;
    constructor(expressions: Array<any>);
}
export declare class SourceAdd {
    constructor();
}
export declare class Value {
    value: any;
    constructor(value: any);
    static isValid(value: any): boolean;
}
export declare class ModelMethod {
    name: string;
    property: Property;
    args: Array<any>;
    constructor(name: string, property: Property, args: Array<any>);
}
export declare class GlobalMethod {
    name: string;
    args: Array<any>;
    constructor(name: string, ...args: Array<any>);
}
export declare class Property {
    name: string;
    parent?: Property;
    constructor(name: string, parent?: Property);
}
export declare class It {
    name: 'it';
}
export declare class EqBinary {
    left: any;
    op: Operation;
    right: any;
    constructor(left: any, op: Operation, right: any);
}
export declare class RefExpression {
    expression: any;
    next: RefExpression;
    constructor(expression: any, next: RefExpression);
}
export declare class ExpressionVisitor {
    visit(host: any): any;
    operation(op: Operation): void;
    find(find: Find): void;
    action(action: Action): void;
    func(func: Func): void;
    count(count: Count): void;
    it(it: It): void;
    select(select: Select): void;
    selectMany(selectMany: SelectMany): void;
    filter(filter: Filter): void;
    order(order: Order): void;
    expand(expand: Expand): void;
    top(top: Top): void;
    skip(skip: Skip): void;
    inlineCount(inlineCount: InlineCount): void;
    method(method: Method): void;
    value(value: Value): void;
    modelMethod(value: ModelMethod): void;
    property(property: Property): void;
    eqBinary(eqBinary: EqBinary): void;
    refExpression(refExpression: RefExpression): void;
    root(root: Root): void;
    this($this: This): void;
    globalMethod(globalMethod: GlobalMethod): void;
}
export declare abstract class Memorize {
    abstract apply(odataset: DataSet<any>): any;
}
