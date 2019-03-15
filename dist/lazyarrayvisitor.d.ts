import { ExpressionVisitor, Select, SelectMany, Order, Property, ModelMethod, Value, Expand, Skip, Find, Count, EqBinary, Operation, RefExpression, Root, Filter, It, GlobalMethod } from "./expressions";
export declare class LazyArrayVisitor extends ExpressionVisitor {
    private source;
    result: any;
    private rootValue;
    constructor(array: any, root: any);
    private _getSource;
    private getSource;
    select(select: Select): any;
    private static createEmptyObjectFor;
    filter(filter: Filter): any;
    _selectManyArray(selectMany: SelectMany, source: Array<any>): any;
    _selectManyObject(selectMany: SelectMany, source: Object): any;
    selectMany(selectMany: SelectMany): any;
    skip(skip: Skip): any;
    top(top: Value): any;
    find(find: Find): any;
    createMemVisitor(source: any): LazyArrayVisitor;
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
    it(it: It): any;
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
        array: {
            all: (value: any) => any;
            any: (value: any) => any;
        };
    };
    globalMethod(globalMethod: GlobalMethod): any;
    /**
     * todo : bu metotun refactoring'e ihtiyaçı var
     * @param modelMethod
     */
    modelMethod(modelMethod: ModelMethod): any;
    value(value: Value): any;
    /**
   * İlk önce
   */
    private static rangeExpressions;
    static getOnlyStucts(element: any): {};
    private static __invokeExpandAndSelects;
    private static filterExpressions;
    isDataSet(dataSetable: any): any;
    static get(source: any, ...expressions: any[]): Promise<any>;
    private static _get;
    static _pruneAndGet(source: any, expr: any): Promise<any>;
    static _prune(o: any): any;
    expand(expand: Expand): any;
    operation(operation: Operation): void;
    eqBinary(eqBinary: EqBinary): any;
    root(root: Root): Promise<any>;
    refExpression(refExpression: RefExpression): any;
}
