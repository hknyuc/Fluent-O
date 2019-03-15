import { TrackingMemset } from './trackingmemset';
import { ChangeSet } from './changeset';
import { Pointset } from './pointset';
import { IDataSet } from './dataset';
import { MapSet } from './mapset';
import { Guid } from './schema';
import { MemSet } from './memarrayvisitor';
import {ODataSet} from './odata';
import { Select, Filter, Count, EqBinary, Operation, Property, Top, Skip, Expand, Order, InlineCount, Value, ModelMethod, Root, SelectMany, It, Find, GlobalMethod, Action, Func } from './expressions';
import { DecorateSet} from './dataset';
import {CacheSet} from './cacheset';
import { Branchset, IBranchStrategy } from './branchset';
import { Pipeset } from './pipeset';
import { Utility } from './core';

export class EqBinaryExtend extends EqBinary {
    constructor(eqBinary: EqBinary) {
        super(eqBinary.left, eqBinary.op, eqBinary.right);

    }

    private create(op: string, value) {
        let v = value;
        if (Value.isValid(value)) {
            v = new Value(value);
        }
        return new EqBinaryExtend(new EqBinary(this, new Operation(op), v));
    }
    and(value: any): EqBinaryExtend {
        return this.create('and', value);
    }

    or(value: any): EqBinaryExtend {
        return this.create('or', value);
    }

    eq(value: any): EqBinaryExtend {
        return this.create('eq', value);
    }

    lt(value: any): EqBinaryExtend {
        return this.create('lt', value);
    }

    le(value: any): EqBinaryExtend {
        return this.create('le', value);
    }

    gt(value: any): EqBinaryExtend {
        return this.create('gt', value);
    }
    ge(value:any):EqBinaryExtend{
        return this.create("ge",value);
    }

    ne(value: any): EqBinaryExtend {
        return this.create('ne', value);
    }


}

export class ModelMethodExtend extends ModelMethod{
    constructor(name:string,property:any,args:Array<any>){
      super(name,property,args);
    }

    private createMethod(name:string,...properties:Array<any>):ModelMethodExtend{
        return method.apply(this,arguments);
     }

    private create(op:string,value:any):EqBinaryExtend{
      return o(this,op,value);
    }

    and(value:any):EqBinaryExtend{
      return this.create('and',value);
    }

    or(value:any):EqBinaryExtend{
       return this.create('or',value);
    }

    gt(value:any):EqBinaryExtend{
        return this.create('gt',value);
    }

    ge(value:any):EqBinaryExtend{
        return this.create('ge',value);
    }

    lt(value:any):EqBinaryExtend{
        return this.create('lt',value);
    }

    le(value:any):EqBinaryExtend{
        return this.create('le',value);
    }

    eq(value:any):EqBinaryExtend{
        return this.create('eq',value);
    }

    ne(value:any):EqBinaryExtend{
        return this.create('ne',value);
    }

    count():CountExtend{
        return new CountExtend(this);
    }

    concat(value:any):ModelMethodExtend{
        return this.createMethod('concat',value);
    }

    selectMany(name:string):SelectManyExtend{
        return selectMany(name,this);
    }

    contains(value:any):ModelMethodExtend{
        return this.createMethod('contains',value);
    }

    endsWith(value:any):ModelMethodExtend{
        return this.createMethod('endswith',value);
    }
    indexof(value:any):ModelMethodExtend{
        return this.createMethod('indexof',value);
    }

    length(value:any):ModelMethodExtend{
        return this.createMethod('length',value);
    }
    startsWith(value:any):ModelMethodExtend{
        return this.createMethod('startswith',value);
    }
    substring(start:any,end?:any):ModelMethodExtend{
        if(end == null)
         return this.createMethod('substring',start);
        return this.createMethod('substring',start,end);
    }

    toLower():ModelMethodExtend{
        return this.createMethod('tolower');
    }

    toUpper():ModelMethodExtend{
        return this.createMethod('toupper');
    }

    trim():ModelMethodExtend{
        return this.createMethod('trim');
    }

    date():ModelMethodExtend{
        return this.createMethod('date');
    }

    day():ModelMethodExtend{
        return this.createMethod('day');
    }
    fractionalseconds():ModelMethodExtend{
        return this.createMethod('fractionalseconds');
    }

    hour():ModelMethodExtend{
        return this.createMethod('hour');
    }

    maxdatetime():ModelMethodExtend{
        return this.createMethod('maxdatetime');
    }
    mindatetime():ModelMethodExtend{
        return this.createMethod('mindatetime')
    }

    minute():ModelMethodExtend{
        return this.createMethod('minute');
    }
    month():ModelMethodExtend{
        return this.createMethod('month');
    }

    now():ModelMethodExtend{
        return this.createMethod('now');
    }

    second():ModelMethodExtend{
        return this.createMethod('second');
    }

    time():ModelMethodExtend{
        return this.createMethod('time');
    }

    totaloffsetminutes():ModelMethodExtend{
        return this.createMethod('totaloffsetminutes');
    }
    totalseconds():ModelMethodExtend{
        return this.createMethod('totalseconds');
    }

    year():ModelMethodExtend{
        return this.createMethod('year');
    }

    ceiling():ModelMethodExtend{
        return this.createMethod('ceiling');
    }

    floor():ModelMethodExtend{
        return this.createMethod('floor');
    }

    round():ModelMethodExtend{
        return this.createMethod('round');
    }

}

/**
 * creates odata data set
 * @param {Object} options options options of data
 * @param {String} options.url url of source. 
 * @param {Object} options.http http provider. default is {XMLHttpRequest}
 * @param {Boolean} options.arrayable it changes behaviour of get methods. likes array data structure. Default is false
 * @returns {ODataSet} OData data set
 */
export const odataset = function(options){
    return new ODataSet(options);
}

 const method = function(name:string,...properties:Array<any>){
    let props = [];
    properties.forEach((elem)=>{
        if(Value.isValid(elem))
          props.push(new Value(elem));
        else props.push(elem);
    })
    return new ModelMethodExtend(name,this,props);
}

export class PropertyExtend extends Property {
    
    private create(op: string, value):EqBinaryExtend {
        let v = value;
        if (!(Utility.instanceof(value,Property))) {
            v = new Value(value);
        }
        return new EqBinaryExtend(new EqBinary(this, new Operation(op), v));
    }

    private createMethod(name:string,...properties:Array<any>):ModelMethodExtend{
       return method.apply(this,arguments);
    }
    and(value: any): EqBinaryExtend {
        return this.create('and', value);
    }

    all(expression):ModelMethodExtend{
        return this.createMethod('all',expression);
    }

    any(expression):ModelMethodExtend{
        return this.createMethod('any',expression);
    }

    or(value: any): EqBinaryExtend {
        return this.create('or', value);
    }

    eq(value: any): EqBinaryExtend {
        return this.create('eq', value);
    }

    lt(value: any): EqBinaryExtend {
        return this.create('lt', value);
    }

    le(value: any): EqBinaryExtend {
        return this.create('le', value);
    }

    gt(value: any): EqBinaryExtend {
        return this.create('gt', value);
    }

    ge(value:any):EqBinaryExtend{
        return this.create("ge",value);
    }

    ne(value: any): EqBinaryExtend {
        return this.create('ne', value);
    }

    count():CountExtend{
        return new CountExtend(this);
    }

    concat(value:any):ModelMethodExtend{
        return this.createMethod('concat',value);
    }

    selectMany(name:string):SelectManyExtend{
        return selectMany(name,this);
    }

    contains(value:any):ModelMethodExtend{
        return this.createMethod('contains',value);
    }

    endsWith(value:any):ModelMethodExtend{
        return this.createMethod('endswith',value);
    }
    indexof(value:any):ModelMethodExtend{
        return this.createMethod('indexof',value);
    }

    length(value:any):ModelMethodExtend{
        return this.createMethod('length',value);
    }
    startsWith(value:any):ModelMethodExtend{
        return this.createMethod('startswith',value);
    }
    substring(start:any,end?:any):ModelMethodExtend{
        if(end == null)
         return this.createMethod('substring',start);
        return this.createMethod('substring',start,end);
    }

    toLower():ModelMethodExtend{
        return this.createMethod('tolower');
    }

    toUpper():ModelMethodExtend{
        return this.createMethod('toupper');
    }

    trim():ModelMethodExtend{
        return this.createMethod('trim');
    }

    date():ModelMethodExtend{
        return this.createMethod('date');
    }

    day():ModelMethodExtend{
        return this.createMethod('day');
    }
    fractionalseconds():ModelMethodExtend{
        return this.createMethod('fractionalseconds');
    }

    hour():ModelMethodExtend{
        return this.createMethod('hour');
    }

    maxdatetime():ModelMethodExtend{
        return this.createMethod('maxdatetime');
    }
    mindatetime():ModelMethodExtend{
        return this.createMethod('mindatetime')
    }

    minute():ModelMethodExtend{
        return this.createMethod('minute');
    }
    month():ModelMethodExtend{
        return this.createMethod('month');
    }

    now():ModelMethodExtend{
        return this.createMethod('now');
    }

    second():ModelMethodExtend{
        return this.createMethod('second');
    }

    time():ModelMethodExtend{
        return this.createMethod('time');
    }

    totaloffsetminutes():ModelMethodExtend{
        return this.createMethod('totaloffsetminutes');
    }
    totalseconds():ModelMethodExtend{
        return this.createMethod('totalseconds');
    }

    year():ModelMethodExtend{
        return this.createMethod('year');
    }

    ceiling():ModelMethodExtend{
        return this.createMethod('ceiling');
    }

    floor():ModelMethodExtend{
        return this.createMethod('floor');
    }

    round():ModelMethodExtend{
        return this.createMethod('round');
    }
}

export class SelectManyExtend extends SelectMany{
    constructor(name:string,property?:any)
    {
        super(name,property);
    }

    private create(op: string, value):EqBinaryExtend {
        let v = value;
        if(Value.isValid(value))
          v = new Value(value);
        return new EqBinaryExtend(new EqBinary(this, new Operation(op), v));
    }

    private createMethod(name:string,...properties:Array<any>):ModelMethodExtend{
        return method.apply(this,arguments);
    }

    any(expression){
        return this.createMethod('any',expression);
    }

    all(expression){
        return this.createMethod('all',expression);
    }

    and(value: any): EqBinaryExtend {
        return this.create('and', value);
    }

    or(value: any): EqBinaryExtend {
        return this.create('or', value);
    }

    eq(value: any): EqBinaryExtend {
        return this.create('eq', value);
    }

    lt(value: any): EqBinaryExtend {
        return this.create('lt', value);
    }

    le(value: any): EqBinaryExtend {
        return this.create('le', value);
    }

    gt(value: any): EqBinaryExtend {
        return this.create('gt', value);
    }

    ge(value:any):EqBinaryExtend{
        return this.create("ge",value);
    }

    ne(value: any): EqBinaryExtend {
        return this.create('ne', value);
    }

    count():Count{
        return new CountExtend(this);
    }

    concat(value:any):ModelMethodExtend{
        return this.createMethod('concat',value);
    }

    selectMany(name:string):SelectManyExtend{
        return selectMany(name,this);
    }

    contains(value:any):ModelMethodExtend{
        return this.createMethod('contains',value);
    }

    endsWith(value:any):ModelMethodExtend{
        return this.createMethod('endswith',value);
    }
    indexof(value:any):ModelMethodExtend{
        return this.createMethod('indexof',value);
    }

    length(value:any):ModelMethodExtend{
        return this.createMethod('length',value);
    }
    startSwith(value:any):ModelMethodExtend{
        return this.createMethod('startswith',value);
    }
    substring(start:any,end?:any):ModelMethodExtend{
        if(end == null)
         return this.createMethod('substring',start);
        return this.createMethod('substring',start,end);
    }

    toLower():ModelMethodExtend{
        return this.createMethod('tolower');
    }

    toUpper():ModelMethodExtend{
        return this.createMethod('toupper');
    }

    trim():ModelMethodExtend{
        return this.createMethod('trim');
    }

    date():ModelMethodExtend{
        return this.createMethod('date');
    }

    day():ModelMethodExtend{
        return this.createMethod('day');
    }
    fractionalseconds():ModelMethodExtend{
        return this.createMethod('fractionalseconds');
    }

    hour():ModelMethodExtend{
        return this.createMethod('hour');
    }

    maxdatetime():ModelMethodExtend{
        return this.createMethod('maxdatetime');
    }
    mindatetime():ModelMethodExtend{
        return this.createMethod('mindatetime')
    }

    minute():ModelMethodExtend{
        return this.createMethod('minute');
    }
    month():ModelMethodExtend{
        return this.createMethod('month');
    }

    now():ModelMethodExtend{
        return this.createMethod('now');
    }

    second():ModelMethodExtend{
        return this.createMethod('second');
    }

    time():ModelMethodExtend{
        return this.createMethod('time');
    }

    totaloffsetminutes():ModelMethodExtend{
        return this.createMethod('totaloffsetminutes');
    }
    totalseconds():ModelMethodExtend{
        return this.createMethod('totalseconds');
    }

    year():ModelMethodExtend{
        return this.createMethod('year');
    }

    ceiling():ModelMethodExtend{
        return this.createMethod('ceiling');
    }

    floor():ModelMethodExtend{
        return this.createMethod('floor');
    }

    round():ModelMethodExtend{
        return this.createMethod('round');
    }


    find(value:any):FindExtend{
        return new FindExtend(value,this);
    }
    
}

export class ThisExtend extends PropertyExtend{
      constructor(){
          super('$this')
      }
}

export class CountExtend extends Count{
    private create(op: string, value):EqBinaryExtend {
        let v = value;
        if(Value.isValid(value))
          v = new Value(value);
        return new EqBinaryExtend(new EqBinary(this, new Operation(op), v));
    }

    and(value: any): EqBinaryExtend {
        return this.create('and', value);
    }

    or(value: any): EqBinaryExtend {
        return this.create('or', value);
    }

    eq(value: any): EqBinaryExtend {
        return this.create('eq', value);
    }

    lt(value: any): EqBinaryExtend {
        return this.create('lt', value);
    }

    le(value: any): EqBinaryExtend {
        return this.create('le', value);
    }

    gt(value: any): EqBinaryExtend {
        return this.create('gt', value);
    }

    ge(value:any):EqBinaryExtend{
        return this.create("ge",value);
    }

    ne(value: any): EqBinaryExtend {
        return this.create('ne', value);
    }
}

export class RootExtend extends Root{
    private create(op: string, value):EqBinaryExtend {
        let v = value;
        if (!(Utility.instanceof(value,Root))) {
            v = new Value(value);
        }
        return new EqBinaryExtend(new EqBinary(this, new Operation(op), v));
    }

    private createMethod(name:string,...properties:Array<any>):ModelMethodExtend{
        return method.apply(this,arguments);
    }
    and(value: any): EqBinaryExtend {
        return this.create('and', value);
    }

    or(value: any): EqBinaryExtend {
        return this.create('or', value);
    }

    eq(value: any): EqBinaryExtend {
        return this.create('eq', value);
    }

    lt(value: any): EqBinaryExtend {
        return this.create('lt', value);
    }

    le(value: any): EqBinaryExtend {
        return this.create('le', value);
    }

    gt(value: any): EqBinaryExtend {
        return this.create('gt', value);
    }

    ge(value:any):EqBinaryExtend{
        return this.create("ge",value);
    }


    ne(value: any): EqBinaryExtend {
        return this.create('ne', value);
    }

    count():CountExtend{
        return new CountExtend(this);
    }

    concat(value:any):ModelMethodExtend{
        return this.createMethod('concat',value);
    }


    selectMany(name:string):SelectManyExtend{
        return selectMany(name,this);
    }

    contains(value:any):ModelMethodExtend{
        return this.createMethod('contains',value);
    }

    endsWith(value:any):ModelMethodExtend{
        return this.createMethod('endswith',value);
    }
    indexof(value:any):ModelMethodExtend{
        return this.createMethod('indexof',value);
    }

    length(value:any):ModelMethodExtend{
        return this.createMethod('length',value);
    }
    startsWith(value:any):ModelMethodExtend{
        return this.createMethod('startswith',value);
    }
    substring(start:any,end?:any):ModelMethodExtend{
        if(end == null)
         return this.createMethod('substring',start);
        return this.createMethod('substring',start,end);
    }

    toLower():ModelMethodExtend{
        return this.createMethod('tolower');
    }

    toUpper():ModelMethodExtend{
        return this.createMethod('toupper');
    }

    trim():ModelMethodExtend{
        return this.createMethod('trim');
    }

    date():ModelMethodExtend{
        return this.createMethod('date');
    }

    day():ModelMethodExtend{
        return this.createMethod('day');
    }
    fractionalseconds():ModelMethodExtend{
        return this.createMethod('fractionalseconds');
    }

    hour():ModelMethodExtend{
        return this.createMethod('hour');
    }

    maxdatetime():ModelMethodExtend{
        return this.createMethod('maxdatetime');
    }
    mindatetime():ModelMethodExtend{
        return this.createMethod('mindatetime')
    }

    minute():ModelMethodExtend{
        return this.createMethod('minute');
    }
    month():ModelMethodExtend{
        return this.createMethod('month');
    }

    now():ModelMethodExtend{
        return this.createMethod('now');
    }

    second():ModelMethodExtend{
        return this.createMethod('second');
    }

    time():ModelMethodExtend{
        return this.createMethod('time');
    }

    totaloffsetminutes():ModelMethodExtend{
        return this.createMethod('totaloffsetminutes');
    }
    totalseconds():ModelMethodExtend{
        return this.createMethod('totalseconds');
    }

    year():ModelMethodExtend{
        return this.createMethod('year');
    }

    ceiling():ModelMethodExtend{
        return this.createMethod('ceiling');
    }

    floor():ModelMethodExtend{
        return this.createMethod('floor');
    }

    round():ModelMethodExtend{
        return this.createMethod('round');
    }
}

export class ItExtend extends It{
    constructor(){
        super();
    }
    private create(op: string, value):EqBinaryExtend {
        let v = value;
        if (!(Utility.instanceof(value,Root))) {
            v = new Value(value);
        }
        return new EqBinaryExtend(new EqBinary(this, new Operation(op), v));
    }

    private createMethod(name:string,...properties:Array<any>):ModelMethodExtend{
        return method.apply(this,arguments);
    }
    and(value: any): EqBinaryExtend {
        return this.create('and', value);
    }

    prop(name):PropertyExtend{
        return prop(name,this);
    }

    or(value: any): EqBinaryExtend {
        return this.create('or', value);
    }

    eq(value: any): EqBinaryExtend {
        return this.create('eq', value);
    }

    lt(value: any): EqBinaryExtend {
        return this.create('lt', value);
    }

    le(value: any): EqBinaryExtend {
        return this.create('le', value);
    }

    gt(value: any): EqBinaryExtend {
        return this.create('gt', value);
    }

    ge(value:any):EqBinaryExtend{
        return this.create("ge",value);
    }


    ne(value: any): EqBinaryExtend {
        return this.create('ne', value);
    }

    count():CountExtend{
        return new CountExtend(this);
    }

    concat(value:any):ModelMethodExtend{
        return this.createMethod('concat',value);
    }

    selectMany(name:string):SelectManyExtend{
        return selectMany(name,this);
    }

    contains(value:any):ModelMethodExtend{
        return this.createMethod('contains',value);
    }

    endsWith(value:any):ModelMethodExtend{
        return this.createMethod('endswith',value);
    }
    indexof(value:any):ModelMethodExtend{
        return this.createMethod('indexof',value);
    }

    length(value:any):ModelMethodExtend{
        return this.createMethod('length',value);
    }
    startsWith(value:any):ModelMethodExtend{
        return this.createMethod('startswith',value);
    }
    substring(start:any,end?:any):ModelMethodExtend{
        if(end == null)
         return this.createMethod('substring',start);
        return this.createMethod('substring',start,end);
    }

    toLower():ModelMethodExtend{
        return this.createMethod('tolower');
    }

    toUpper():ModelMethodExtend{
        return this.createMethod('toupper');
    }

    trim():ModelMethodExtend{
        return this.createMethod('trim');
    }

    date():ModelMethodExtend{
        return this.createMethod('date');
    }

    day():ModelMethodExtend{
        return this.createMethod('day');
    }
    fractionalseconds():ModelMethodExtend{
        return this.createMethod('fractionalseconds');
    }

    hour():ModelMethodExtend{
        return this.createMethod('hour');
    }

    maxdatetime():ModelMethodExtend{
        return this.createMethod('maxdatetime');
    }
    mindatetime():ModelMethodExtend{
        return this.createMethod('mindatetime')
    }

    minute():ModelMethodExtend{
        return this.createMethod('minute');
    }
    month():ModelMethodExtend{
        return this.createMethod('month');
    }

    now():ModelMethodExtend{
        return this.createMethod('now');
    }

    second():ModelMethodExtend{
        return this.createMethod('second');
    }

    time():ModelMethodExtend{
        return this.createMethod('time');
    }

    totaloffsetminutes():ModelMethodExtend{
        return this.createMethod('totaloffsetminutes');
    }
    totalseconds():ModelMethodExtend{
        return this.createMethod('totalseconds');
    }

    year():ModelMethodExtend{
        return this.createMethod('year');
    }

    ceiling():ModelMethodExtend{
        return this.createMethod('ceiling');
    }

    floor():ModelMethodExtend{
        return this.createMethod('floor');
    }

    round():ModelMethodExtend{
        return this.createMethod('round');
    }
}

export var othis = new ThisExtend(); 

export var $root = new RootExtend();

export function count(){
    return new Count(null);
}

export function o(left: any, op: Operation | string, right: any): EqBinaryExtend {
    let opValue = op;
    let leftValue = left;
    if (typeof op === "string")
        opValue = new Operation(op);
    if (typeof left === "string")
        leftValue = new Property(left);
    let r = right;
    if (Value.isValid(right))
        r = new Value(right);
    return new EqBinaryExtend(new EqBinary(leftValue, opValue as any, r));
}

export function p(name: string,parent?): PropertyExtend {
    return prop(name,parent);
}


export function prop(name,parent?): PropertyExtend {
    if(name == null) throw new Error('property name could not null');
    if(typeof name != "string") throw new Error('property name must string');
    if(name.indexOf('.')>=0){
        let current = parent;
        name.split('.').forEach(function (item){
           if(current == null)
              current = new PropertyExtend(item);
            else current = new PropertyExtend(item,current);
        });

        return current;
    }
    return new PropertyExtend(name,parent);
}

export function filter(expression: any): Filter {
    return new Filter(expression);
}

export function select(...args: any[]): Select {
   let results = [];

   let appendAsString = function (){
       args.forEach(function (arg){
          results.push({
              property:Utility.instanceof(arg,Property)?arg:prop(arg)
          });
       });
   }

   let singleProperty = function (){
     results.push({
         property: Utility.instanceof(args[0],Property)?args[0]:prop(args[0]),
         expression:args[1] 
     });
   }
    if(args.length == 2){
        let allString = args.every(function (arg){
            return typeof arg === "string";
        });
        if(allString){
            appendAsString();
        }else{
            singleProperty();
        }
    }else{
        let indexOfNonString = args.findIndex(function (item){
            let isString = typeof item === "string";
            let isProperty = Utility.instanceof(item,Property);
            return !(isString || isProperty);
        });

        if(indexOfNonString >= 0){
            throw new Error('argument index of '+indexOfNonString +" is not property");
        }
        appendAsString();
    }
    return new Select(results);
}

export function top(value: number): Top {
    return new Top(value);
}

export function skip(value: number): Skip {
    return new Skip(value);
}

export function value(value: any): Value {
    return new Value(value);
}

export function it():ItExtend{
    return new ItExtend();
}

export class FindExtend extends Find{
  selectMany(name:string):SelectManyExtend{
     return selectMany(name,this);
  }
}

export var $it = it();

export function selectMany(name:string,parent?:any):SelectManyExtend{
    /*
    if(name == null) throw new Error('selectMany:name is invalid');
    if(prop == null) throw new Error('selectMany:property is invalid');
    if(typeof name !== "string") throw new Error('selectMany:name is invalid type');
    */
    if(name == null){
        throw new Error('selectMany: name is invalid');
    }
   if(name.indexOf('/')>=0){
     let sp = name.split('/');
     let current;
     sp.forEach(function (elem){
         if(current == null)
          current = new SelectManyExtend(elem,parent);
         else current = new SelectManyExtend(elem,current);
     });
     return current;
   }
   return new SelectManyExtend(name,parent);//single
}

export function order(property: string | Property, type?: 'asc' | 'desc'): Order {
    let propem = property;
    if (typeof property == "string")
        propem = prop(property)
    if (!(Utility.instanceof(propem,Property)))
        throw new Error('order :property is not valid');
    if(type == null) return new Order(propem as any);
    let validTypes = ["asc", "desc"];
    if (!validTypes.some(x => x == type)) {
        throw new Error('order: type is not valid');
    }
    return new Order(propem as any, type);
}


export function orderDesc(propery: string | Property) {
    return order(propery, 'desc');
}

export function expand(property: string | Property, ...expression: any[]): Expand {
    let prop = property;
    if (typeof property == "string")
        prop = new Property(property);
    if (!(Utility.instanceof(prop,Property)))
        throw new Error("property is not valid");
    return new Expand([{
        property:prop as any,
        expressions:expression
    }]);
}

export function inlineCount(): InlineCount {
    return new InlineCount();
}

export function find(value:any):FindExtend{
    return new FindExtend(value);
}


export class GlobalExtend {
   get maxdatetime():GlobalMethod{
      return new GlobalMethod("maxdatetime");
    }
    get mindatetime():GlobalMethod{
        return new GlobalMethod("mindatetime");
    }
   
    get now():GlobalMethod{
        return new GlobalMethod("now");
    }

}

/**
 * creates memory data set for operations
 * @param {Array} source source is array
 * @param baseFilter is start filter
 */
export function memset(source:Array<any>,baseFilter?){
    let r = source == null?[]:source;
    return new MemSet(r,baseFilter);
}


/**
 * creates new Guid
 * @param {String} raw 
 * @returns {Guid}
 */
export function guid(raw: string | Guid): Guid{
    if(Utility.instanceof(raw,Guid)) return raw as any;
   return new Guid(raw as any);
}

export function action(name:string,...params){
    let args = [];
    params.forEach((param)=>{
        if(Utility.instanceof(param,Value)) {
            args.push(param);
            return true;
        }
        args.push(new Value(param));
        return true;
    });
    return new Action(name,args);
}

export function func(name:string,...params){
    let args = [];
    params.forEach((param)=>{
        if(Utility.instanceof(param,Value)) {
            args.push(param);
            return true;
        }
        args.push(new Value(param));
        return true;
    });
    return new Func(name,args);
}   

/**
 * 
 * DecorateSet
 * @param source source dataset for processing
 * @param observer operations on source
 */
export function dataset(source,observer:{get?:Function,add?:Function,delete?:Function,update?:Function,addUpdate?:Function}):DecorateSet<any>{
   return new DecorateSet(source,observer);
}

/**
 * 
 * caches data. After fetching it is working in local.
 * @param dataset source dataset for processing
 */
export function cacheset(dataset):CacheSet<any>{
    return new CacheSet(dataset);
}

/**
 * maps data after data fetched.
 * @param source source dataset for processing
 * @param mapFn invokes map function after data fetched
 */
export function mapset(source,mapFn:((item:any,index:number,arr:Array<any>)=>any)|string,mapExFn?:(element:any,beforeElement:any,index:number,arr:Array<any>)=>any):MapSet<any>{
     return new MapSet(source,mapFn,[],mapExFn);
}


/**
 * Herhangi bir source üzerindeki objenin expend edilen propertsini tek bir source gibi kullanmak için kullanılır.
 * @param force provides order,skip,top,filter expression after data fetching
 */
 export function branchset(source:IDataSet<any>,branchName:string,strategy?:IBranchStrategy):IDataSet<any>{
      return new Branchset(source,branchName,[],strategy || Branchset.SmartStrategy);
 }


/**
 * Query kısmına extradan lokalde yapılan işlemler eklenebilir. O işlemden sonra diğer işlem memset üzeriden gider.
 */
 export function pipeset(source:IDataSet<any>){
     return new Pipeset(source);
 }

 /**
  * Query 
  * @param source 
  */
 export function pointset(source:IDataSet<any>){
     return new Pointset(source);
 }

 /**
   *Observes when element is adding,added,updating,updated,deleting,deleted.
  * @param source which is will observe
  * @returns {ChangeSet}
  */
 export function changeset<T>(source:IDataSet<T>):ChangeSet<T>{
     return new ChangeSet(source);
 }


 export function trackingMemset(source:Array<any>):TrackingMemset{
    return new TrackingMemset(memset(source));
 }

 /**
  * get first data from source
  * @param source datasource
  */
 export function first(source:IDataSet<any>|Array<any>):DecorateSet<any>{
     source =  Array.isArray(source)?memset(source):source;
    return dataset(source,{
        get:function (expressions){
            expressions = expressions || [];
            let exp = this.dataset.getExpressions().concat(expressions);
            let anyFirst = exp.find(a=> Utility.instanceof(a,Find));
            if(anyFirst) { // eğer find yazılmışşsa tek gelecek demek zaten
                return this.next();
            }
            return this.next(exp.concat(top(1))).then((response)=>{
                if(Array.isArray(response)) return response[0];
                return response;
            });
        }
    })
 }
