import { Guid } from "./Schema";

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
    }
}

export class Skip extends Method {
    constructor(public value: number) {
        super();
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
        if(value instanceof Date)
          return true;
        if(value instanceof Guid)
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
        if(host instanceof Root)
          return  this.root(host);
        if(host instanceof This)
           return this.this(host);
         if(host instanceof Property)
           return this.property(host);
         if (host instanceof Operation)
           return this.operation(host);
         if(host instanceof Select)
            return this.select(host);
         if(host instanceof SelectMany)
            return this.selectMany(host);
         if(host instanceof Filter)
           return this.filter(host);
         if(host instanceof Find)
           return this.find(host);
         if(host instanceof Count)
           return this.count(host);
         if(host instanceof Order)
           return this.order(host);
         if(host instanceof Expand)
            return this.expand(host);
         if(host instanceof Top)
            return this.top(host);
         if(host instanceof Skip)
            return this.skip(host);
         if(host instanceof InlineCount)
            return this.inlineCount(host);
         if (host instanceof Method)
            return this.method(host);
         if (host instanceof Value)
           return this.value(host);
         if(Value.isValid(host))
           return this.value(new Value(host));
         if (host instanceof ModelMethod)
           return this.modelMethod(host);
         if (host instanceof EqBinary)
            return this.eqBinary(host);
         if(host instanceof It)
            return this.it(host);
         if(host instanceof GlobalMethod)
            return this.globalMethod(host);
         if(host instanceof Action)
            return this.action(host);
         if(host instanceof Func)
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