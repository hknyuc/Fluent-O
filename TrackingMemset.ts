import { Utility } from './core';
import { Select, Property } from './expressions';
import { MemSet } from './memarrayvisitor';
import { select } from './operations';
export class TrackingMemset extends MemSet{
    constructor(private memset:MemSet){
        super(memset["source"],memset.getExpressions());
        this.trackingId = memset.trackingId;
    }


    private trackObject(index,object){
        let element = (Array.isArray(this.source)?this.source:[this.source])[index];
        let newResult = {
            test:'timeout'
        };
        for(let i in object){
            let _value = object[i];
            Utility.ObjectDefineProperty(newResult,i,{
                get:function (){
                    return _value;
                },
                set:function (newValue){
                    _value = newValue;
                    element[i] = newValue;
                },
                configurable:true,
                enumerable:true
            })
        }
        Object.getOwnPropertySymbols(object).forEach((prop)=>{
            newResult[prop] = object[prop];
        })
        return newResult;
    }

    query(...expressions){
        return new TrackingMemset(this.memset.query.apply(this.memset,expressions));
    }

    then(callback,errorCallback?):Promise<any>{
        return this.memset.then.apply(this.memset,arguments);
    }

  
    add(value):Promise<any>{
        return this.memset.add.apply(this.memset,arguments);
    }


    update(value):Promise<any>{
        return this.memset.update.apply(this.memset,arguments);
    }

    delete(value):Promise<any>{
        return this.memset.delete.apply(this.memset,arguments);
    }

    private selectTrackId(expressionsArr:Array<any>){
        let expressions = [].concat(expressionsArr);
        let indexOfLast = expressions.lastIndexOf(x=>x instanceof Select);
        if(indexOfLast < 0){
            return expressions; // gets all
        }

        expressions[indexOfLast] = new Select([].concat(expressions[indexOfLast].args,{
            property:new Property(this.trackingId as any)
        }));
        return expressions;
    }

    get(...expressions){
        expressions = this.selectTrackId(expressions);
       return this.memset.get.apply(this.memset,expressions).then((response)=>{
            if(typeof response === "number") return response;
            return (Array.isArray(response) ?response:[response]).map(x=>{
                let indexOfItem = (Array.isArray(this.source)?this.source:[this.source]).findIndex(a=>a[this.trackingId as any] === x[this.trackingId as any]);
                if(indexOfItem < 0) return x;
                let result = this.trackObject(indexOfItem,x);
                return result;
            });
            
       });
    }
}