import { ExpressionVisitor, Select, SelectMany, Order, Property, ModelMethod, Value, Expand, Skip, Find, Count, EqBinary, Operation, RefExpression, Root, Filter, It, GlobalMethod } from "./Expressions";
import { DataSet } from "./Context";

export class MemArrayVisitor extends ExpressionVisitor{
    private source:any;
    public result:any;
    private rootValue:any;
    constructor(array:any,root:any){
     super();
     this.source = array;
     this.result = [];
     this.rootValue = root;
    }

    select(select:Select){
     if(Array.isArray(this.source)){
     this.result = this.source.map(element => {
          let result={} as any;
          select.args.forEach(arg => {
           this.__createNestedProperty(result,arg.property)
           .set(this.__getNestedProperty(element,arg.property));
          });
          return result;
      });
    }else{
        this.result = {};
        select.args.forEach((arg)=>{
           this.__createNestedProperty(this.result,arg.property).set(this.__getNestedProperty(this.source,arg.property));
        });
    }
    }

    filter(filter:Filter){
        let result = [];
        this.source.forEach(element => {
            let visitor = this.createMemVisitor(element);
            visitor.visit(filter.expression);
            if(visitor.result === true)
               result.push(element);
        });
        this.result = result;
    }

    _selectManyArray(selectMany:SelectMany,source:Array<any>){
        if(selectMany.parent != null){
            let visitor = this.createMemVisitor(source);
            visitor.visit(selectMany.parent);
            source = visitor.result;
        }
    
      if(!Array.isArray(source))  return source;
        let rs = [];
        source.forEach(element=>{
          let arr =element[selectMany.name];
          if(!Array.isArray(arr)) {
              rs.push(arr);
              return true;
          }
          for(let i=0;i<arr.length;i++)
              rs.push(arr[i]);
            return true;
        });
       this.result = rs;
    }
    _selectManyObject(selectMany:SelectMany,source:Object){
        if(selectMany.parent != null){
            let visitor = this.createMemVisitor(source);
            visitor.visit(selectMany.parent);
            source = visitor.result;
        }

        if(Array.isArray(source)) // array i nested
         {
            let rs = [];
            source.forEach(element=>{
              let arr =element[selectMany.name];
              if(!Array.isArray(arr)){ // is object
                  rs.push(arr);
                  return true;
              }
              for(let i=0;i<arr.length;i++) // is Array 
                  rs.push(arr[i]);
             return true;
            });
            return rs;
         }
        for(let i in source){ // object
            if(i === selectMany.name) return source[i];
        }
    
         throw new Error(selectMany.name +" is not found in object");
    }

    selectMany(selectMany:SelectMany){ 
       if(Array.isArray(this.source))
          this.result = this._selectManyArray(selectMany,this.source);
        else this.result = this._selectManyObject(selectMany,this.source);
    }

    skip(skip:Skip){
       this.result = this.source.slice(skip.value,this.source.length);
    }

    top(top:Value){
        this.result = this.source.slice(0,top.value);
    }

    find(find:Find){
        let value = find.value;
        if(typeof value !== "object"){ 
           this.result = this.source.find((x=>x.id===find.value || x.ID === find.value || x.Id === find.value));
        }
        else {
           let firstValueofObject = null;
           for(let i in find.value){
               firstValueofObject = {name:i,value:find.value[i]}
               break;
           }
           this.result = this.source.find((x=>x[firstValueofObject.name] == firstValueofObject.value));
        }
        let visitor = new MemArrayVisitor(this.result,this.source);
        if(find.expression != null){
            visitor.visit(find.expression);
            this.result = visitor.result;
        }

    }
    createMemVisitor(source:any):MemArrayVisitor{
      return new MemArrayVisitor(source,this.rootValue);
    }

    count(count:Count){
        this.result = this.source.length;
        if(count.expression != null){
         let memVisitor = this.createMemVisitor(this.source);
          memVisitor.visit(count.expression);
          this.result = memVisitor.result.length;
        }
    }

    order(order:Order){
        if(!Array.isArray(this.source)) throw new Error("order: order support only array");
        this.result = this.source.map(x=>x).sort((left,right)=>{
            let leftVisitor = this.createMemVisitor(left);
            let rightVisitor = this.createMemVisitor(right);
            leftVisitor.visit(order.property);
            rightVisitor.visit(order.property);
            if(order.type === null || order.type === "asc")
                return leftVisitor.result - rightVisitor.result;
            return rightVisitor.result - leftVisitor.result; 
        });
    }

    property(property:Property){
         this.result = this.__getNestedProperty(this.source,property);
    }

    __createNestedProperty(source,property:Property){
        if(source == null) return null;
        let props =[];
        let parent = property.parent;
        while(parent != null){
          props.push(parent.name);
          parent = parent.parent;
        }
        props = props.reverse();
        props.push(property.name);
        let current = source;
        props.forEach((name)=>{
            current[name] = current[name] == null?{}:current[name];
            current = current[name];
        });
        return {
            /**
             * sets value to created property
             */
            set:(value)=>{
                let current = source;
               for(let i = 0;i<props.length;i++){
                   if(i === (props.length -1)){
                       if(current[props[i]] == null) throw new Error(props[i] +" is undefined for set in model");
                       current[props[i]] = value;
                   }
                   
                   current = current[props[i]];
               }
            }
        }
    }

    __getNestedProperty(source,property:Property){
        let props =[];
        let parent = property.parent;
        while(parent != null){
          props.push(parent.name);
          parent = parent.parent;
        }
        props = props.reverse();
        props.push(property.name);
        //props = props.reverse();
        let current = source;
        props.forEach((name)=>{
            if(current == null){
                return null;
                throw new Error("source is null for getting "+name +" property");
            }
             current = current[name];
        });
        return current;
    }

    it(it:It){
        this.result = this.source;
    }

    getModelMethod(){
        let stringFuncs = {
            contains:function (value){
              return this.context.indexOf(value) >=0;
            },
            endswith:function(value:string){
              return this.context.endsWith(value);
            },
            indexof:function (value:string){
             return this.context.indexOf(value);
            },
            length:function (){
              return this.context.length;
            },
            startswith:function (value:string){
                return this.context.startsWith(value);
            },
            substring:function (start:any,end?:any){
                return this.context.substring(start,end);
            },
            tolower:function (){
                return this.context.toLowerCase();
            },
            toupper:function (){
                return this.context.toUpperCase();
            },
            trim:function (){
                return this.context.trim();
            }
        }

        let dateFuncs = {
            date:function(){
                return this.context.getDate();
            },
            day:function (){
                return this.context.getDay();
            },
            fractionalseconds:function(){
                return this.context.getDate();
            },
            hour:function(){
                return this.context.getHour();
            },
            minute:function(){
                return this.context.getMinutes();
            },
            month:function(){
                return this.context.getMonth()+1;
            },
            second:function(){
                return this.context.getSeconds();
            },
            time:function(){
                return this.cotnext.getTime();
            },
            year:function (){
                return this.context.getFullYear();
            }
        }

      return {
          string:stringFuncs,
          date:dateFuncs
      }
    }

    globalMethod(globalMethod:GlobalMethod){
       let methods = {
        maxdatetime:function(){
            return new Date(8640000000000000);
        },
        mindatetime:function(){
            return new Date(-8640000000000000)
        },
        now:function(){
            return new Date(Date.now());
         },
         ceiling:function(value){
             return Math.ceil(value);
         },
         floor:function(x:number){
             return Math.floor(x);
         },
         round:function(x:number){
             return Math.round(x);
         }
       }
       if(methods[globalMethod.name] == null) throw new Error(globalMethod.name +" is not exists in global method");
       let props = [];
       globalMethod.args.forEach((elem)=>{
           let visitor = this.createMemVisitor(this.source);
           visitor.visit(elem);
           props.push(visitor.result);           
       })
       this.result = methods[globalMethod.name].apply(null,props);  
    }

    modelMethod(modelMethod:ModelMethod){
        let visitor = this.createMemVisitor(this.source);
        visitor.visit(modelMethod.property);
        let props = [];
        let self= this;
        modelMethod.args.forEach(function (arg){
           let v = self.createMemVisitor(self.source);
            v.visit(arg);
            props.push(v.result);
        });
  
           if(typeof visitor.result === "string"){
            let methods = this.getModelMethod().string;
            methods["context"] = visitor.result;
            if(methods[modelMethod.name] != null){
              this.result =  methods[modelMethod.name].apply(methods,props);
              return;
            }
        }else if(visitor.result instanceof Date){
            let methods = this.getModelMethod().date;
            methods["context"] = visitor.result;
            if(methods[modelMethod.name] != null){
              this.result =  methods[modelMethod.name].apply(methods,props);
              return;
            }
        }
          if(visitor.result == null) return;
         if(visitor.result[modelMethod.name] == null) {
             return;
             throw new Error(modelMethod.name +" method not found in context");
          }
         this.result = visitor.result[modelMethod.name].apply(visitor.result,props);
    }

    value(value:Value){
        this.result = value.value;
    }

    expand(expand:Expand){
       this.source.forEach(element => {
        expand.args.forEach((arg)=>{
            let oldValue = this.__getNestedProperty(element,arg.property);
            let applier  = this.__createNestedProperty(element,arg.property);
            if(arg.expressions != null && arg.expressions.length != 0){
                let resultValue = oldValue;
                arg.expressions.forEach((expression)=>{
                    let memVisitor = this.createMemVisitor(resultValue);
                    memVisitor.visit(expression);
                    resultValue = memVisitor.result;
                    return true;
                });
                applier.set(resultValue);
            }else applier.set(oldValue);
          });
        this.result = this.source.map(x=>x);
    });
    }

    operation(operation:Operation){

    }

    eqBinary(eqBinary:EqBinary){
        let source = this.source;
        let leftVisitor = this.createMemVisitor(source);
        let rightVisitor = this.createMemVisitor(source);
        leftVisitor.visit(eqBinary.left);
        rightVisitor.visit(eqBinary.right);
        let left = leftVisitor.result;
        let right = rightVisitor.result;
        let result = null;
        switch(eqBinary.op.type){
            case "or":
                result = left || right;
            break;
            case "and":
                result = left && right;
            break;
            case  "eq":
                result = left === right;
            break;
            case "ne":
                result = left !== right;
            break;
            case "lt":
                result = left < right;
            break;
            case "le":
                result = left <= right;
            break;
            case "gt":
                result = left > right;
            break;
            case "ge":
                result = left >= right;
            break;
        default:
            throw new Error(eqBinary.op.type +" is not support yet");
        }
        this.result = result;
    }

     root(root:Root){
       this.result = this.rootValue;
     }

    refExpression(refExpression:RefExpression){
         let visitor = this.createMemVisitor(this.source);
         visitor.visit(refExpression.expression);
         this.result = visitor.result;
         if(refExpression.next != null){
              let visitorNext = this.createMemVisitor(this.result);
              visitorNext.visit(refExpression.next);
              this.result = visitorNext.result;
         }
    }    
}



export class MemSet implements DataSet<any>{

    constructor(private source,private expressions:Array<any>){
     this.expressions = expressions || [];
    }

    query(...expressions: any[]): DataSet<any> {
        return new MemSet(this.source,this.expressions.map(x=>x).concat(expressions));
    }
    get(...expressions: any[]): Promise<any> {
        let expression = this.expressions.map(x=>x).concat(expressions);
        return Promise.resolve(MemSet._get(this.source,expression));
    }    
    add(element: any): Promise<any> {
       this.source.push(element);
       return Promise.resolve(element);
    }
    delete(element: any): Promise<any> {
        let indexOfItem = this.source.find((elem)=> elem === element);
        if(indexOfItem === -1) return Promise.reject('element not found');
        return Promise.resolve();
    }
    update(element: any): Promise<any> {
        let indexOfItem = this.source.findIndex((elem)=> elem === element);
        if(indexOfItem === -1) return Promise.reject('element not found');
        this.source[indexOfItem] = element;
        return Promise.resolve();
    }

    static get(source,...expressions: any[]){
       return this._get(source,expressions);
    }

    private static _get(source,expressions:any[]){
        let result = source;
        expressions.forEach((expression)=>{
          let visitor = new MemArrayVisitor(result,source);
          visitor.visit(expression);
           result = visitor.result;
        });
        return result;
    }
}