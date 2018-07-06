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
    visit(host: any) {
        if(host instanceof Root)
            this.root(host);
        else if(host instanceof This)
            this.this(host);
        else if(host instanceof Property)
           this.property(host);
        else if (host instanceof Operation)
            this.operation(host);
        else if(host instanceof Select)
            this.select(host);
        else if(host instanceof SelectMany)
            this.selectMany(host);
        else if(host instanceof Filter)
            this.filter(host);
        else if(host instanceof Find)
            this.find(host);
        else if(host instanceof Count)
            this.count(host);
        else if(host instanceof Order)
            this.order(host);
        else if(host instanceof Expand)
             this.expand(host);
        else if(host instanceof Top)
             this.top(host);
        else if(host instanceof Skip)
             this.skip(host);
        else if(host instanceof InlineCount)
             this.inlineCount(host);
        else if (host instanceof Method)
            this.method(host);
        else if (host instanceof Value)
            this.value(host);
        else if (host instanceof ModelMethod)
            this.modelMethod(host);
        else if (host instanceof EqBinary)
            this.eqBinary(host);
        else if(host instanceof It)
            this.it(host);
        else if(host instanceof GlobalMethod)
            this.globalMethod(host);
          
   
    }


    operation(op: Operation): void {

    }

    find(find:Find):void{

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