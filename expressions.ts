import { DataSet } from './dataset';
import { Guid } from "./schema";
import { Utility } from './core';

export class Operation {
    constructor(public type: string) {

    }
}


export class Method {

}

export class Select extends Method {
    args: Array<{property:Property,expression?:any}>;
    constructor(args: Array<{property:Property,expression?:any}> = []) {
        super()
        this.args = args;
    }

      reduce(...params:Array<Select>):Select{
       return params.reduce((ac,c)=>{
         return new Select([].concat(ac.args,c.args))
       },this);
    }
}

export class Filter extends Method {
    constructor(public expression: any) {
        super()
    }
}

export class InlineCount extends Method {
    constructor() {
        super();
    }
}





export class Order extends Method {
    constructor(public property: Property, public type?: 'desc' | 'asc') {
        super();
    }
}


export class Top extends Method {
    constructor(public value: number) {
        super();
        if(value < 0) throw new RangeError(value + ' is not in range for top operation');
    }
}

export class Skip extends Method {
    constructor(public value: number) {
        super();
        if(value < 0) throw new RangeError(value + ' is not in range for skip operation');
    }
}

export class Action {
    constructor(public name:String,public parameters:Array<any>){
     
    }
}

export class Func {
    constructor(public name:String,public parameters:Array<any>){

    }
}


export class Find {
   constructor(public value:any,public expression?:any){
    
   }
}

export class This{

}

export class Root{
    constructor()
    {

    }
}

export class DataSource{
    constructor(public name:string,public expression:any){

    }
}

export class SelectMany{
    constructor(public name:string,public parent?:any){

    }
}

export class Count extends Method{
    constructor(public expression:any){
        super();
    }
}

export class Expand extends Method {
    constructor(public args:Array<{property:Property,expressions:Array<any>}>) {
        super();
    }
}

export class SourceGet{
    constructor(public expressions:Array<any>){

    }
}

export class SourceAdd{
    constructor(){
        
    }
}

export class Value {
    constructor(public value: any) {

    }

   static isValid(value:any){
        if(value == null) return true;
        switch(typeof value){
            case 'string':
              return true;
            case 'number':
              return true;
            case 'boolean':
            return true;
        }
        if(Utility.instanceof(value,Date))
          return true;
        if(Utility.instanceof(value,Guid))
          return true;
      return false;
    }
}

export class ModelMethod {
    constructor(public name: string,public property:Property, public args:Array<any>) {

    }
}

export class GlobalMethod{
    public args:Array<any> = [];
    constructor(public name:string,...args:Array<any>){
        this.args = args;
    }
}

export class Property {
    constructor(public name: string,public parent?:Property) {

    }
}

export class It{
   name:'it';
}

export class EqBinary {
    constructor(public left: any, public op: Operation, public right: any) {

    }
}

export class RefExpression {
    constructor(public expression: any,public next: RefExpression) {

    }
}

export class ExpressionVisitor {
    visit(host: any) :any {

        let is = function (a){
            return Utility.instanceof(host,a);
        }
        if(is(Root))
          return  this.root(host);
        if(is(This))
           return this.this(host);
         if(is(Property))
           return this.property(host);
         if (is(Operation))
           return this.operation(host);
         if(is(Select))
            return this.select(host);
         if(is(SelectMany))
            return this.selectMany(host);
         if(is(Filter))
           return this.filter(host);
         if(is(Find))
           return this.find(host);
         if(is(Count))
           return this.count(host);
         if(is(Order))
           return this.order(host);
         if(is(Expand))
            return this.expand(host);
         if(is(Top))
            return this.top(host);
         if(is(Skip))
            return this.skip(host);
         if(is(InlineCount))
            return this.inlineCount(host);
         if (is(Method))
            return this.method(host);
         if (is(Value))
           return this.value(host);
         if(Value.isValid(host))
           return this.value(new Value(host));
         if (is(ModelMethod))
           return this.modelMethod(host);
         if (is(EqBinary))
            return this.eqBinary(host);
         if(is(It))
            return this.it(host);
         if(is(GlobalMethod))
            return this.globalMethod(host);
         if(is(Action))
            return this.action(host);
         if(is(Func))
           return  this.func(host);
      return Promise.reject('not found');
    }



    operation(op: Operation): void {

    }

    find(find:Find):void{

    }

    action(action:Action):void{

    }

    func(func:Func):void{

    }

    count(count:Count):void{
        
    }

    it(it:It):void{

    }

    select(select:Select):void{

    }

    selectMany(selectMany:SelectMany):void{
       
    }

    filter(filter:Filter):void{

    }

    order(order:Order):void{

    }

    expand(expand:Expand):void{

    }

    top(top:Top):void{

    }

    skip(skip:Skip):void{

    }

    inlineCount(inlineCount:InlineCount):void{

    }

    method(method: Method): void {

    }
    value(value: Value): void {

    }

    modelMethod(value: ModelMethod): void {

    }

    property(property: Property): void {

    }

    eqBinary(eqBinary: EqBinary): void {

    }

    refExpression(refExpression: RefExpression): void {

    }

    root(root:Root):void{

    }

    this($this:This):void{

    }

    globalMethod(globalMethod:GlobalMethod):void{
        
    }

}

export abstract class Memorize {
  abstract apply(odataset:DataSet<any>);
}