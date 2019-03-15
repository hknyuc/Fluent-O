declare module "dataset" {
    /**
     * Base data source for applying operations
     */
    export class DataSet<T> implements IDataSet<T> {
        protected expressions: Array<any>;
        constructor(expressions: Array<any>);
        getExpressions(): any[];
        /**
         * fetches data as array from source.
         * @param expressions specifies events that will operate on the resource.
         */
        get(...expressions: Array<any>): Promise<any>;
        /**
         * adds element to source
         * @param element
         */
        add(element: T): Promise<any>;
        /**
         * deletes element from source
         * @param element
         */
        delete(element: T): Promise<any>;
        /**
         * updates element
         * @param element
         */
        update(element: T): Promise<any>;
        /**
         * creates a new dataset after it applied expression on it
         * @param expressions specifies events that will operate on the resource.
         */
        query(...expressions: Array<any>): IDataSet<T>;
        /**
         * fetches data as array from source.
         * @returns Promise
         */
        then(callback: any, errorCallback?: any): Promise<any>;
        map(mapFn: (element: any) => any): Promise<any>;
        insertTo(params: Array<any> | object): Promise<any>;
        static is(dataSetable: any): any;
    }
    export class DecorateSet<T> extends DataSet<T> {
        dataSet: DataSet<T>;
        observer: {
            get?: Function;
            add?: Function;
            delete?: Function;
            update?: Function;
            addUpdate?: Function;
        };
        constructor(dataSet: DataSet<T>, observer: {
            get?: Function;
            add?: Function;
            delete?: Function;
            update?: Function;
            addUpdate?: Function;
        });
        get(...expressions: Array<any>): any;
        map(mapFn: any): Promise<any>;
        insertTo(params: any): Promise<any>;
        add(element: T): Promise<any>;
        delete(element: T): any;
        update(element: T): any;
        query(...expressions: Array<any>): any;
    }
    export interface IDataSet<T> {
        getExpressions(): Array<any>;
        /**
        * fetches data as array from source.
        * @param expressions specifies events that will operate on the resource.
        */
        get(...expressions: Array<any>): Promise<any>;
        /**
         * adds element to source
         * @param element
         */
        add(element: T): Promise<any>;
        /**
         * deletes element from source
         * @param element
         */
        delete(element: T): Promise<any>;
        /**
         * updates element
         * @param element
         */
        update(element: T): Promise<any>;
        /**
         * creates a new dataset after it applied expression on it
         * @param expressions specifies events that will operate on the resource.
         */
        query(...expressions: Array<any>): IDataSet<T>;
        /**
         * fetches data as array from source.
         * @returns Promise
         */
        then(callback: any, errorCallback?: any): Promise<any>;
        map(mapFn: (element: any) => any): Promise<any>;
        insertTo(params: Array<any> | object): Promise<any>;
    }
}
declare module "schema" {
    export class Guid {
        value: String;
        constructor(value: String);
        toString(): String;
        valueOf(): String;
        static new(): Guid;
        static newString(): String;
        static parse(value: any): Guid;
        static tryParse(value: any): Guid;
    }
    export class Float {
    }
}
declare module "expressions" {
    import { DataSet } from "dataset";
    export class Operation {
        type: string;
        constructor(type: string);
    }
    export class Method {
    }
    export class Select extends Method {
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
    export class Filter extends Method {
        expression: any;
        constructor(expression: any);
    }
    export class InlineCount extends Method {
        constructor();
    }
    export class Order extends Method {
        property: Property;
        type?: 'desc' | 'asc';
        constructor(property: Property, type?: 'desc' | 'asc');
    }
    export class Top extends Method {
        value: number;
        constructor(value: number);
    }
    export class Skip extends Method {
        value: number;
        constructor(value: number);
    }
    export class Action {
        name: String;
        parameters: Array<any>;
        constructor(name: String, parameters: Array<any>);
    }
    export class Func {
        name: String;
        parameters: Array<any>;
        constructor(name: String, parameters: Array<any>);
    }
    export class Find {
        value: any;
        expression?: any;
        constructor(value: any, expression?: any);
    }
    export class This {
    }
    export class Root {
        constructor();
    }
    export class DataSource {
        name: string;
        expression: any;
        constructor(name: string, expression: any);
    }
    export class SelectMany {
        name: string;
        parent?: any;
        constructor(name: string, parent?: any);
    }
    export class Count extends Method {
        expression: any;
        constructor(expression: any);
    }
    export class Expand extends Method {
        args: Array<{
            property: Property;
            expressions: Array<any>;
        }>;
        constructor(args: Array<{
            property: Property;
            expressions: Array<any>;
        }>);
    }
    export class SourceGet {
        expressions: Array<any>;
        constructor(expressions: Array<any>);
    }
    export class SourceAdd {
        constructor();
    }
    export class Value {
        value: any;
        constructor(value: any);
        static isValid(value: any): boolean;
    }
    export class ModelMethod {
        name: string;
        property: Property;
        args: Array<any>;
        constructor(name: string, property: Property, args: Array<any>);
    }
    export class GlobalMethod {
        name: string;
        args: Array<any>;
        constructor(name: string, ...args: Array<any>);
    }
    export class Property {
        name: string;
        parent?: Property;
        constructor(name: string, parent?: Property);
    }
    export class It {
        name: 'it';
    }
    export class EqBinary {
        left: any;
        op: Operation;
        right: any;
        constructor(left: any, op: Operation, right: any);
    }
    export class RefExpression {
        expression: any;
        next: RefExpression;
        constructor(expression: any, next: RefExpression);
    }
    export class ExpressionVisitor {
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
    export abstract class Memorize {
        abstract apply(odataset: DataSet<any>): any;
    }
}
declare module "visitors/selectPropertyFinder" {
    import { ExpressionVisitor, Filter, Order, Property, EqBinary, SelectMany, ModelMethod } from "expressions";
    export class SelectPropertyFinder extends ExpressionVisitor {
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
}
declare module "lazyarrayvisitor" {
    import { ExpressionVisitor, Select, SelectMany, Order, Property, ModelMethod, Value, Expand, Skip, Find, Count, EqBinary, Operation, RefExpression, Root, Filter, It, GlobalMethod } from "expressions";
    export class LazyArrayVisitor extends ExpressionVisitor {
        private source;
        result: any;
        private rootValue;
        constructor(array: any, root: any);
        private _getSource;
        private getSource;
        select(select: Select): Promise<any>;
        private static createEmptyObjectFor;
        filter(filter: Filter): Promise<any[]>;
        _selectManyArray(selectMany: SelectMany, source: Array<any>): any;
        _selectManyObject(selectMany: SelectMany, source: Object): any;
        selectMany(selectMany: SelectMany): Promise<any>;
        skip(skip: Skip): Promise<any>;
        top(top: Value): Promise<any>;
        find(find: Find): Promise<any>;
        createMemVisitor(source: any): LazyArrayVisitor;
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
        it(it: It): Promise<any>;
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
        globalMethod(globalMethod: GlobalMethod): Promise<any>;
        /**
         * todo : bu metotun refactoring'e ihtiyaçı var
         * @param modelMethod
         */
        modelMethod(modelMethod: ModelMethod): Promise<any>;
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
        expand(expand: Expand): Promise<any>;
        operation(operation: Operation): void;
        eqBinary(eqBinary: EqBinary): Promise<any>;
        root(root: Root): Promise<any>;
        refExpression(refExpression: RefExpression): Promise<any>;
    }
}
declare module "memarrayvisitor" {
    import { ExpressionVisitor, Select, SelectMany, Order, Property, ModelMethod, Value, Expand, Skip, Find, Count, EqBinary, Operation, RefExpression, Root, Filter, It, GlobalMethod } from "expressions";
    import { DataSet } from "dataset";
    export class MemArrayVisitor extends ExpressionVisitor {
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
    export class MemSet extends DataSet<any> {
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
}
declare module "branchset" {
    import { DataSet, IDataSet } from "dataset";
    class BranchContext {
        source: IDataSet<any>;
        branchName: string;
        expressions: Array<any>;
        constructor(source: IDataSet<any>, branchName: string, expressions: Array<any>);
    }
    export interface IBranchStrategy {
        get(context: BranchContext): Promise<any>;
    }
    /**
     * Bütün işlemleri expand üzerinde yapar.
     */
    export class DirectStrategy implements IBranchStrategy {
        private afterExpressions;
        private escapeAfterExpressions;
        get(context: BranchContext): any;
    }
    /**
     * Single Side Collector
     * Toplama işleminden sonra order,top,skip,filter işlemlerini yapar.
     */
    class SSCollectorStrategy implements IBranchStrategy {
        private getExpandAndSelect;
        get(context: BranchContext): Promise<any>;
    }
    /**
     * Double side filter collector.
     * Toplama işleminden sonra ve source üzerinde order,top,skip,filter işlemlerini yapar.
     */
    class DSFCollectorStrategy implements IBranchStrategy {
        private afterExpressions;
        private usesDoubleSourceExpressions;
        /**
         *
         * @param expressions
         */
        private escapeAfterExpressions;
        private getDoubleSourceExpressions;
        get(context: BranchContext): Promise<any>;
    }
    class SmartStrategy implements IBranchStrategy {
        getStrategy(context: BranchContext): DirectStrategy | SSCollectorStrategy;
        get(context: BranchContext): Promise<any>;
    }
    /**
     * Herhangi bir source üzerindeki objenin expend edilen propertsini tek bir source gibi kullanmak için kullanılır.
     *
     */
    export class Branchset<T> extends DataSet<T> {
        private source;
        private branchName;
        private strategy;
        /**
         * Double side filter collector.
         * Toplama işleminden sonra ve source üzerinde order,top,skip,filter işlemlerini yapar.
         */
        static DoubleSideCollector: DSFCollectorStrategy;
        /**
         * Single Side Collector
         * Toplama işleminden sonra order,top,skip,filter işlemlerini yapar.
        */
        static SingleSideCollector: SSCollectorStrategy;
        /**
         * Bütün işlemleri expand üzerinde yapar.
         */
        static Direct: DirectStrategy;
        static SmartStrategy: SmartStrategy;
        constructor(source: IDataSet<any>, branchName: string, expressions?: Array<any>, strategy?: IBranchStrategy);
        get(...expressions: any[]): Promise<any>;
        private getOn;
        add(element: T): Promise<any>;
        delete(element: T): Promise<any>;
        update(element: T): Promise<any>;
        query(...expressions: any[]): IDataSet<T>;
    }
}
declare module "logs/ILogger" {
    import { ILogger } from "logs/ILogger";
    export interface ILogger {
        info(message: any): Promise<any>;
        error(message: any): Promise<any>;
        warn(message: any): Promise<any>;
    }
    export class ConsoleLogger implements ILogger {
        info(message: any): Promise<any>;
        error(message: any): Promise<any>;
        warn(message: any): Promise<any>;
    }
}
declare module "restclient" {
    import { ILogger } from "logs/ILogger";
    export class HttpResponse {
        responseText: string;
        headers: {};
        status: number;
        readonly isSuccess: boolean;
        constructor(responseText: string, headers: {}, status: number);
        json(): any;
    }
    export interface XMLHttpRequestCreator {
        create(): XMLHttpRequest;
    }
    export class RestClient {
        creator?: XMLHttpRequestCreator;
        headers: {};
        private pipes;
        constructor(creator?: XMLHttpRequestCreator);
        /**
         * manipules Response
         */
        pipe(fn: (sender: RestClient, respone: HttpResponse) => void): RestClient;
        get(url: string, headers?: {}): Promise<HttpResponse>;
        post(url: string, data: any, headers?: {}): Promise<HttpResponse>;
        put(url: string, data: any, headers?: {}): Promise<HttpResponse>;
        delete(url: string, headers?: {}): Promise<HttpResponse>;
        private cloneHeaderOrEmpty;
        private invokePipe;
        create(method: string, url: string, data: any, headers: {}): Promise<HttpResponse>;
        private getHeaders;
    }
    export class TrackingClient extends RestClient {
        private restClient;
        private logger;
        constructor(restClient: RestClient, logger: ILogger);
        private calculateTimeString;
        create(method: string, url: string, data: any, headers: any): Promise<any>;
    }
}
declare module "http" {
    import { RestClient } from "restclient";
    export class Http extends RestClient {
        constructor();
    }
}
declare module "odata" {
    import { RestClient } from "restclient";
    import { DataSet } from "dataset";
    import { ExpressionVisitor, Operation, Method, Expand, Value, InlineCount, Order, Skip, ModelMethod, Property, EqBinary, RefExpression, Select, Top, Filter, Count, Find, SelectMany, This, Root, It, Action, Func } from "expressions";
    export class ODataVisitor extends ExpressionVisitor {
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
    export class ODataCombineVisitor extends ExpressionVisitor {
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
    export function idselector(ids: Array<string>): {
        apply: (value: any) => any;
    };
    export class ODataSet<T> extends DataSet<T> {
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
    export class QuerySet {
        static get(...expressions: any[]): string;
    }
    export var entity: (name: any) => {
        get: (...expressions: any[]) => {
            asQuery: () => any;
        };
    };
    export class ODataConfig {
        static createHttp(): RestClient;
    }
}
declare module "cacheset" {
    import { DataSet } from "dataset";
    export class CacheSet<T> extends DataSet<T> {
        private static caches;
        private dataset;
        constructor(dataset: DataSet<T>);
        update(value: any): Promise<any>;
        add(value: any): Promise<any>;
        delete(value: any): Promise<any>;
        get(expressions: any): any;
        query(): CacheSet<{}>;
    }
}
declare module "core" {
    export class Emitter {
        type: any;
        _events: any;
        _async: any;
        _sync: any;
        _strategy: any;
        /**
         *
         * @param {string} type is sync or async. if async emits values as asynchronously otherwise synchronously
         */
        constructor(type: 'async' | 'sync');
        /**
         * hooks to actions
         * @param {Function} callbackFn
         */
        hook(callbackFn: any): void;
        /**
         * Creates new emitter builder for observing.
         * @param {Object} obj object to be watched
         */
        for(obj: any): EmitterObjectBuilder;
        /**
         * emits to all observers . if strategy is sync, result can break value. if returns false it must be break
         * @returns {Boolean}  break value. if true continue otherwise break.
         */
        emit(...params: Array<any>): boolean;
    }
    export class EmitterObjectBuilder {
        emitter: any;
        obj: any;
        /**
         *
         * @param {Object} obj
         * @param {Emitter} emitter
         */
        constructor(obj: any, emitter: any);
        /**
         * When props change. It emits changed object
         * @param {Array} props properties
         */
        peek(props: any): void;
    }
    export class Utility {
        static ObjectDefineProperty(o: any, p: PropertyKey, attributes: PropertyDescriptor & ThisType<any>): void;
    }
    export class TaskHandler {
        static runSequent<T>(items: Array<T>, fn: (item: T) => Promise<any>, force?: boolean): Promise<any>;
        static runAsync<T>(items: Array<T>, fn: (item: T) => Promise<any>, taskCount?: number, timeout?: number): Promise<any>;
        static runFirstSuccess<T>(items: Array<T>, fn: (item: T) => Promise<any>): TaskHandlerFirstSuccess;
        /**
         *
         * @param timeout task can cancel in timeout(ms)
         */
        static createCancellable(timeout?: number): CancellableTaskHandler;
    }
    export class CancellableTaskHandler {
        private timeout;
        private mediators;
        /**
         *
         * @param timeout invoke time
         */
        constructor(timeout: number);
        /**
         * adds new actions and cancels before actions
         * @param fn new action
         */
        runOnly(fn: Function): void;
        private insertAction;
        /**
         * cancels all actions
         */
        cancel(): void;
        private pullMediator;
    }
    class TaskHandlerFirstSuccess {
        private items;
        private fn;
        constructor(items: Array<any>, fn: (item: any) => Promise<any>);
        run(): Promise<any>;
    }
}
declare module "changeset" {
    import { DataSet, IDataSet } from "dataset";
    export class ChangeSet<T> extends DataSet<T> {
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
    export class ChangeSetinterruptedArgs {
        changeset: any;
        message: any;
        constructor(changeset: any, message: any);
    }
}
declare module "mapset" {
    import { DataSet } from "dataset";
    export class MapSet<T> extends DataSet<T> {
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
}
declare module "memoperation" {
    export abstract class MemOperation {
        abstract pipe(array: Array<any>): Promise<Array<any>>;
    }
    /**Distincts */
    /**
     * Checks all properties
     */
    class FullMatchDistinctOp extends MemOperation {
        pipe(array: any[]): Promise<any[]>;
    }
    /**
     * Checks  only equality of references
     */
    class ReferenceDistinctOp extends MemOperation {
        pipe(array: any[]): Promise<any[]>;
    }
    /**
     * Checks only selected properties
     */
    class OneProperyDistinctOp extends MemOperation {
        private properties;
        constructor(properties: Array<any>);
        pipe(array: any[]): Promise<any[]>;
    }
    export class Distincs {
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
    export function distinct(algorithm?: MemOperation | Array<any> | string): any;
    /**
     * Checks all properties
     */
    export function fullDistinct(): FullMatchDistinctOp;
    class NotNullOp extends MemOperation {
        pipe(array: any[]): Promise<any[]>;
    }
    export function notNull(): NotNullOp;
    class MapOp extends MemOperation {
        private mapFn;
        constructor(mapFn: (item: any, index: any, array: any) => any);
        pipe(array: any[]): Promise<any[]>;
    }
    /**
        * Returns the elements of an array that meet the condition specified in a callback function.
     * @param mapFn
     */
    export function map(mapFn: (item: any, index: any, array: any) => any): MapOp;
}
declare module "trackingmemset" {
    import { MemSet } from "memarrayvisitor";
    export class TrackingMemset extends MemSet {
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
}
declare module "pointset" {
    import { IDataSet, DataSet } from "dataset";
    import { MemOperation } from "memoperation";
    /**
     * Ne kadar Expression eklenirse eklenirsin WhenMemorized kısmı sonra çalışır.  Pipesetde ise MemOperationdan sonra işlemler memory üzerinden gerçekleşir.
     */
    export class Pointset<T> extends DataSet<T> {
        private datasource;
        private memOperations;
        constructor(datasource: IDataSet<T>, expressions?: Array<any>, memOperations?: Array<any>);
        getExpressions(): any[];
        private static insureAsPromise;
        /**
         * Hafıza alındığında yapılacak işlemler.
         * @param expressions MemOperation ya da expressions
         */
        whenMemorized(...expressions: Array<MemOperation | any>): Pointset<T>;
        private applyMemOps;
        private withOwnExpressions;
        get(...expressions: any[]): Promise<any>;
        add(element: T): Promise<any>;
        delete(element: T): Promise<any>;
        update(element: T): Promise<any>;
        query(...expressions: any[]): Pointset<T>;
    }
}
declare module "pipeset" {
    import { DataSet, IDataSet } from "dataset";
    /**
     * Query kısmına extradan lokalde yapılan işlemler eklenebilir. O işlemden sonra diğer işlem memset üzeriden gider.
     */
    export class Pipeset<T> extends DataSet<T> {
        private source;
        constructor(source: IDataSet<T>, expressions?: Array<any>);
        query(...expression: Array<any>): Pipeset<T>;
        getExpressions(): any[];
        private notPipeQuery;
        private isPipeQuery;
        private splitExpressionsByPipeQuery;
        add(item: any): Promise<any>;
        update(item: any): Promise<any>;
        delete(item: any): Promise<any>;
        private isFunction;
        get(...expression: Array<any>): any;
    }
}
declare module "operations" {
    import { TrackingMemset } from "trackingmemset";
    import { ChangeSet } from "changeset";
    import { Pointset } from "pointset";
    import { IDataSet } from "dataset";
    import { MapSet } from "mapset";
    import { Guid } from "schema";
    import { MemSet } from "memarrayvisitor";
    import { ODataSet } from "odata";
    import { Select, Filter, Count, EqBinary, Operation, Property, Top, Skip, Expand, Order, InlineCount, Value, ModelMethod, Root, SelectMany, It, Find, GlobalMethod, Action, Func } from "expressions";
    import { DecorateSet } from "dataset";
    import { CacheSet } from "cacheset";
    import { IBranchStrategy } from "branchset";
    import { Pipeset } from "pipeset";
    export class EqBinaryExtend extends EqBinary {
        constructor(eqBinary: EqBinary);
        private create;
        and(value: any): EqBinaryExtend;
        or(value: any): EqBinaryExtend;
        eq(value: any): EqBinaryExtend;
        lt(value: any): EqBinaryExtend;
        le(value: any): EqBinaryExtend;
        gt(value: any): EqBinaryExtend;
        ge(value: any): EqBinaryExtend;
        ne(value: any): EqBinaryExtend;
    }
    export class ModelMethodExtend extends ModelMethod {
        constructor(name: string, property: any, args: Array<any>);
        private createMethod;
        private create;
        and(value: any): EqBinaryExtend;
        or(value: any): EqBinaryExtend;
        gt(value: any): EqBinaryExtend;
        ge(value: any): EqBinaryExtend;
        lt(value: any): EqBinaryExtend;
        le(value: any): EqBinaryExtend;
        eq(value: any): EqBinaryExtend;
        ne(value: any): EqBinaryExtend;
        count(): CountExtend;
        concat(value: any): ModelMethodExtend;
        selectMany(name: string): SelectManyExtend;
        contains(value: any): ModelMethodExtend;
        endsWith(value: any): ModelMethodExtend;
        indexof(value: any): ModelMethodExtend;
        length(value: any): ModelMethodExtend;
        startsWith(value: any): ModelMethodExtend;
        substring(start: any, end?: any): ModelMethodExtend;
        toLower(): ModelMethodExtend;
        toUpper(): ModelMethodExtend;
        trim(): ModelMethodExtend;
        date(): ModelMethodExtend;
        day(): ModelMethodExtend;
        fractionalseconds(): ModelMethodExtend;
        hour(): ModelMethodExtend;
        maxdatetime(): ModelMethodExtend;
        mindatetime(): ModelMethodExtend;
        minute(): ModelMethodExtend;
        month(): ModelMethodExtend;
        now(): ModelMethodExtend;
        second(): ModelMethodExtend;
        time(): ModelMethodExtend;
        totaloffsetminutes(): ModelMethodExtend;
        totalseconds(): ModelMethodExtend;
        year(): ModelMethodExtend;
        ceiling(): ModelMethodExtend;
        floor(): ModelMethodExtend;
        round(): ModelMethodExtend;
    }
    /**
     * creates odata data set
     * @param {Object} options options options of data
     * @param {String} options.url url of source.
     * @param {Object} options.http http provider. default is {XMLHttpRequest}
     * @param {Boolean} options.arrayable it changes behaviour of get methods. likes array data structure. Default is false
     * @returns {ODataSet} OData data set
     */
    export const odataset: (options: any) => ODataSet<{}>;
    export class PropertyExtend extends Property {
        private create;
        private createMethod;
        and(value: any): EqBinaryExtend;
        all(expression: any): ModelMethodExtend;
        any(expression: any): ModelMethodExtend;
        or(value: any): EqBinaryExtend;
        eq(value: any): EqBinaryExtend;
        lt(value: any): EqBinaryExtend;
        le(value: any): EqBinaryExtend;
        gt(value: any): EqBinaryExtend;
        ge(value: any): EqBinaryExtend;
        ne(value: any): EqBinaryExtend;
        count(): CountExtend;
        concat(value: any): ModelMethodExtend;
        selectMany(name: string): SelectManyExtend;
        contains(value: any): ModelMethodExtend;
        endsWith(value: any): ModelMethodExtend;
        indexof(value: any): ModelMethodExtend;
        length(value: any): ModelMethodExtend;
        startsWith(value: any): ModelMethodExtend;
        substring(start: any, end?: any): ModelMethodExtend;
        toLower(): ModelMethodExtend;
        toUpper(): ModelMethodExtend;
        trim(): ModelMethodExtend;
        date(): ModelMethodExtend;
        day(): ModelMethodExtend;
        fractionalseconds(): ModelMethodExtend;
        hour(): ModelMethodExtend;
        maxdatetime(): ModelMethodExtend;
        mindatetime(): ModelMethodExtend;
        minute(): ModelMethodExtend;
        month(): ModelMethodExtend;
        now(): ModelMethodExtend;
        second(): ModelMethodExtend;
        time(): ModelMethodExtend;
        totaloffsetminutes(): ModelMethodExtend;
        totalseconds(): ModelMethodExtend;
        year(): ModelMethodExtend;
        ceiling(): ModelMethodExtend;
        floor(): ModelMethodExtend;
        round(): ModelMethodExtend;
    }
    export class SelectManyExtend extends SelectMany {
        constructor(name: string, property?: any);
        private create;
        private createMethod;
        any(expression: any): ModelMethodExtend;
        all(expression: any): ModelMethodExtend;
        and(value: any): EqBinaryExtend;
        or(value: any): EqBinaryExtend;
        eq(value: any): EqBinaryExtend;
        lt(value: any): EqBinaryExtend;
        le(value: any): EqBinaryExtend;
        gt(value: any): EqBinaryExtend;
        ge(value: any): EqBinaryExtend;
        ne(value: any): EqBinaryExtend;
        count(): Count;
        concat(value: any): ModelMethodExtend;
        selectMany(name: string): SelectManyExtend;
        contains(value: any): ModelMethodExtend;
        endsWith(value: any): ModelMethodExtend;
        indexof(value: any): ModelMethodExtend;
        length(value: any): ModelMethodExtend;
        startSwith(value: any): ModelMethodExtend;
        substring(start: any, end?: any): ModelMethodExtend;
        toLower(): ModelMethodExtend;
        toUpper(): ModelMethodExtend;
        trim(): ModelMethodExtend;
        date(): ModelMethodExtend;
        day(): ModelMethodExtend;
        fractionalseconds(): ModelMethodExtend;
        hour(): ModelMethodExtend;
        maxdatetime(): ModelMethodExtend;
        mindatetime(): ModelMethodExtend;
        minute(): ModelMethodExtend;
        month(): ModelMethodExtend;
        now(): ModelMethodExtend;
        second(): ModelMethodExtend;
        time(): ModelMethodExtend;
        totaloffsetminutes(): ModelMethodExtend;
        totalseconds(): ModelMethodExtend;
        year(): ModelMethodExtend;
        ceiling(): ModelMethodExtend;
        floor(): ModelMethodExtend;
        round(): ModelMethodExtend;
        find(value: any): FindExtend;
    }
    export class ThisExtend extends PropertyExtend {
        constructor();
    }
    export class CountExtend extends Count {
        private create;
        and(value: any): EqBinaryExtend;
        or(value: any): EqBinaryExtend;
        eq(value: any): EqBinaryExtend;
        lt(value: any): EqBinaryExtend;
        le(value: any): EqBinaryExtend;
        gt(value: any): EqBinaryExtend;
        ge(value: any): EqBinaryExtend;
        ne(value: any): EqBinaryExtend;
    }
    export class RootExtend extends Root {
        private create;
        private createMethod;
        and(value: any): EqBinaryExtend;
        or(value: any): EqBinaryExtend;
        eq(value: any): EqBinaryExtend;
        lt(value: any): EqBinaryExtend;
        le(value: any): EqBinaryExtend;
        gt(value: any): EqBinaryExtend;
        ge(value: any): EqBinaryExtend;
        ne(value: any): EqBinaryExtend;
        count(): CountExtend;
        concat(value: any): ModelMethodExtend;
        selectMany(name: string): SelectManyExtend;
        contains(value: any): ModelMethodExtend;
        endsWith(value: any): ModelMethodExtend;
        indexof(value: any): ModelMethodExtend;
        length(value: any): ModelMethodExtend;
        startsWith(value: any): ModelMethodExtend;
        substring(start: any, end?: any): ModelMethodExtend;
        toLower(): ModelMethodExtend;
        toUpper(): ModelMethodExtend;
        trim(): ModelMethodExtend;
        date(): ModelMethodExtend;
        day(): ModelMethodExtend;
        fractionalseconds(): ModelMethodExtend;
        hour(): ModelMethodExtend;
        maxdatetime(): ModelMethodExtend;
        mindatetime(): ModelMethodExtend;
        minute(): ModelMethodExtend;
        month(): ModelMethodExtend;
        now(): ModelMethodExtend;
        second(): ModelMethodExtend;
        time(): ModelMethodExtend;
        totaloffsetminutes(): ModelMethodExtend;
        totalseconds(): ModelMethodExtend;
        year(): ModelMethodExtend;
        ceiling(): ModelMethodExtend;
        floor(): ModelMethodExtend;
        round(): ModelMethodExtend;
    }
    export class ItExtend extends It {
        constructor();
        private create;
        private createMethod;
        and(value: any): EqBinaryExtend;
        prop(name: any): PropertyExtend;
        or(value: any): EqBinaryExtend;
        eq(value: any): EqBinaryExtend;
        lt(value: any): EqBinaryExtend;
        le(value: any): EqBinaryExtend;
        gt(value: any): EqBinaryExtend;
        ge(value: any): EqBinaryExtend;
        ne(value: any): EqBinaryExtend;
        count(): CountExtend;
        concat(value: any): ModelMethodExtend;
        selectMany(name: string): SelectManyExtend;
        contains(value: any): ModelMethodExtend;
        endsWith(value: any): ModelMethodExtend;
        indexof(value: any): ModelMethodExtend;
        length(value: any): ModelMethodExtend;
        startsWith(value: any): ModelMethodExtend;
        substring(start: any, end?: any): ModelMethodExtend;
        toLower(): ModelMethodExtend;
        toUpper(): ModelMethodExtend;
        trim(): ModelMethodExtend;
        date(): ModelMethodExtend;
        day(): ModelMethodExtend;
        fractionalseconds(): ModelMethodExtend;
        hour(): ModelMethodExtend;
        maxdatetime(): ModelMethodExtend;
        mindatetime(): ModelMethodExtend;
        minute(): ModelMethodExtend;
        month(): ModelMethodExtend;
        now(): ModelMethodExtend;
        second(): ModelMethodExtend;
        time(): ModelMethodExtend;
        totaloffsetminutes(): ModelMethodExtend;
        totalseconds(): ModelMethodExtend;
        year(): ModelMethodExtend;
        ceiling(): ModelMethodExtend;
        floor(): ModelMethodExtend;
        round(): ModelMethodExtend;
    }
    export var othis: ThisExtend;
    export var $root: RootExtend;
    export function count(): Count;
    export function o(left: any, op: Operation | string, right: any): EqBinaryExtend;
    export function p(name: string, parent?: any): PropertyExtend;
    export function prop(name: any, parent?: any): PropertyExtend;
    export function filter(expression: any): Filter;
    export function select(...args: any[]): Select;
    export function top(value: number): Top;
    export function skip(value: number): Skip;
    export function value(value: any): Value;
    export function it(): ItExtend;
    export class FindExtend extends Find {
        selectMany(name: string): SelectManyExtend;
    }
    export var $it: ItExtend;
    export function selectMany(name: string, parent?: any): SelectManyExtend;
    export function order(property: string | Property, type?: 'asc' | 'desc'): Order;
    export function orderDesc(propery: string | Property): Order;
    export function expand(property: string | Property, ...expression: any[]): Expand;
    export function inlineCount(): InlineCount;
    export function find(value: any): FindExtend;
    export class GlobalExtend {
        readonly maxdatetime: GlobalMethod;
        readonly mindatetime: GlobalMethod;
        readonly now: GlobalMethod;
    }
    /**
     * creates memory data set for operations
     * @param {Array} source source is array
     * @param baseFilter is start filter
     */
    export function memset(source: Array<any>, baseFilter?: any): MemSet;
    /**
     * creates new Guid
     * @param {String} raw
     * @returns {Guid}
     */
    export function guid(raw: string | Guid): Guid;
    export function action(name: string, ...params: any[]): Action;
    export function func(name: string, ...params: any[]): Func;
    /**
     *
     * DecorateSet
     * @param source source dataset for processing
     * @param observer operations on source
     */
    export function dataset(source: any, observer: {
        get?: Function;
        add?: Function;
        delete?: Function;
        update?: Function;
        addUpdate?: Function;
    }): DecorateSet<any>;
    /**
     *
     * caches data. After fetching it is working in local.
     * @param dataset source dataset for processing
     */
    export function cacheset(dataset: any): CacheSet<any>;
    /**
     * maps data after data fetched.
     * @param source source dataset for processing
     * @param mapFn invokes map function after data fetched
     */
    export function mapset(source: any, mapFn: ((item: any, index: number, arr: Array<any>) => any) | string, mapExFn?: (element: any, beforeElement: any, index: number, arr: Array<any>) => any): MapSet<any>;
    /**
     * Herhangi bir source üzerindeki objenin expend edilen propertsini tek bir source gibi kullanmak için kullanılır.
     * @param force provides order,skip,top,filter expression after data fetching
     */
    export function branchset(source: IDataSet<any>, branchName: string, strategy?: IBranchStrategy): IDataSet<any>;
    /**
     * Query kısmına extradan lokalde yapılan işlemler eklenebilir. O işlemden sonra diğer işlem memset üzeriden gider.
     */
    export function pipeset(source: IDataSet<any>): Pipeset<any>;
    /**
     * Query
     * @param source
     */
    export function pointset(source: IDataSet<any>): Pointset<any>;
    /**
      *Observes when element is adding,added,updating,updated,deleting,deleted.
     * @param source which is will observe
     * @returns {ChangeSet}
     */
    export function changeset<T>(source: IDataSet<T>): ChangeSet<T>;
    export function trackingMemset(source: Array<any>): TrackingMemset;
    /**
     * get first data from source
     * @param source datasource
     */
    export function first(source: IDataSet<any> | Array<any>): DecorateSet<any>;
}
