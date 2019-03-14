import { TrackingMemset } from './trackingmemset';
import { ChangeSet } from './changeSet';
import { Pointset } from './pointset';
import { IDataSet } from './dataset';
import { MapSet } from './mapset';
import { Guid } from './schema';
import { MemSet } from './memarrayvisitor';
import { ODataSet } from './odata';
import { Select, Filter, Count, EqBinary, Operation, Property, Top, Skip, Expand, Order, InlineCount, Value, ModelMethod, Root, SelectMany, It, Find, GlobalMethod, Action, Func } from './expressions';
import { DecorateSet } from './dataset';
import { CacheSet } from './cacheset';
import { IBranchStrategy } from './branchset';
import { Pipeset } from './pipeset';
export declare class EqBinaryExtend extends EqBinary {
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
export declare class ModelMethodExtend extends ModelMethod {
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
export declare const odataset: (options: any) => ODataSet<{}>;
export declare class PropertyExtend extends Property {
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
export declare class SelectManyExtend extends SelectMany {
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
export declare class ThisExtend extends PropertyExtend {
    constructor();
}
export declare class CountExtend extends Count {
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
export declare class RootExtend extends Root {
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
export declare class ItExtend extends It {
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
export declare var othis: ThisExtend;
export declare var $root: RootExtend;
export declare function count(): Count;
export declare function o(left: any, op: Operation | string, right: any): EqBinaryExtend;
export declare function p(name: string, parent?: any): PropertyExtend;
export declare function prop(name: any, parent?: any): PropertyExtend;
export declare function filter(expression: any): Filter;
export declare function select(...args: any[]): Select;
export declare function top(value: number): Top;
export declare function skip(value: number): Skip;
export declare function value(value: any): Value;
export declare function it(): ItExtend;
export declare class FindExtend extends Find {
    selectMany(name: string): SelectManyExtend;
}
export declare var $it: ItExtend;
export declare function selectMany(name: string, parent?: any): SelectManyExtend;
export declare function order(property: string | Property, type?: 'asc' | 'desc'): Order;
export declare function orderDesc(propery: string | Property): Order;
export declare function expand(property: string | Property, ...expression: any[]): Expand;
export declare function inlineCount(): InlineCount;
export declare function find(value: any): FindExtend;
export declare class GlobalExtend {
    readonly maxdatetime: GlobalMethod;
    readonly mindatetime: GlobalMethod;
    readonly now: GlobalMethod;
}
/**
 * creates memory data set for operations
 * @param {Array} source source is array
 * @param baseFilter is start filter
 */
export declare function memset(source: Array<any>, baseFilter?: any): MemSet;
/**
 * creates new Guid
 * @param {String} raw
 * @returns {Guid}
 */
export declare function guid(raw: string | Guid): Guid;
export declare function action(name: string, ...params: any[]): Action;
export declare function func(name: string, ...params: any[]): Func;
/**
 *
 * DecorateSet
 * @param source source dataset for processing
 * @param observer operations on source
 */
export declare function dataset(source: any, observer: {
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
export declare function cacheset(dataset: any): CacheSet<any>;
/**
 * maps data after data fetched.
 * @param source source dataset for processing
 * @param mapFn invokes map function after data fetched
 */
export declare function mapset(source: any, mapFn: ((item: any, index: number, arr: Array<any>) => any) | string, mapExFn?: (element: any, beforeElement: any, index: number, arr: Array<any>) => any): MapSet<any>;
/**
 * Herhangi bir source üzerindeki objenin expend edilen propertsini tek bir source gibi kullanmak için kullanılır.
 * @param force provides order,skip,top,filter expression after data fetching
 */
export declare function branchset(source: IDataSet<any>, branchName: string, strategy?: IBranchStrategy): IDataSet<any>;
/**
 * Query kısmına extradan lokalde yapılan işlemler eklenebilir. O işlemden sonra diğer işlem memset üzeriden gider.
 */
export declare function pipeset(source: IDataSet<any>): Pipeset<any>;
/**
 * Query
 * @param source
 */
export declare function pointset(source: IDataSet<any>): Pointset<any>;
/**
  *Observes when element is adding,added,updating,updated,deleting,deleted.
 * @param source which is will observe
 * @returns {ChangeSet}
 */
export declare function changeset<T>(source: IDataSet<T>): ChangeSet<T>;
export declare function trackingMemset(source: Array<any>): TrackingMemset;
/**
 * get first data from source
 * @param source datasource
 */
export declare function first(source: IDataSet<any> | Array<any>): DecorateSet<any>;
