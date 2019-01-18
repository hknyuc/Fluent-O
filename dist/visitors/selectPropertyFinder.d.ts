import { ExpressionVisitor, Filter, Order, Property, EqBinary, SelectMany, ModelMethod } from './../Expressions';
export declare class SelectPropertyFinder extends ExpressionVisitor {
    properties: Array<Property>;
    filter(filter: Filter): void;
    private addProperty;
    getAsExpressions(): any[];
    order(order: Order): void;
    eqBinary(binary: EqBinary): void;
    property(propery: Property): void;
    selectMany(selectManay: SelectMany): void;
    modelMethod(method: ModelMethod): void;
}
