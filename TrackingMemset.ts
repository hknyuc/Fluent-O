import { Select } from './Expressions';
import { Guid } from './Schema';
import { MemSet } from './MemArrayVisitor';
import { select } from './Operations';
export class TrackingMemset extends MemSet{
    private trackingId = Symbol(Guid.newString().toString());
    constructor(private memset:MemSet){
        super(memset["source"],memset.getExpressions());
        this.source.forEach((item)=>{
            this.addTrackingId(item);
        })
    }

    trackObject(index,object){
        let element = (Array.isArray(this.source)?this.source:[this.source])[index];
        for(let i in object){
            let _value;
            Object.defineProperty(object,i,{
                get:function (){
                    return _value;
                },
                set:function (newValue){
                    _value = newValue;
                    element[i] = newValue
                }
            })
        }
    }

    then(callback,errorCallback?):Promise<any>{
        return this.memset.then.apply(this.memset,arguments);
    }

    private addTrackingId(value){
       if(value != null)
           {
               let v = Guid.newString();
               Object.defineProperty(value,this.trackingId,{
                   get:function (){
                       return v;
                   }
               })
           }
    }
  
    add(value):Promise<any>{
        this.addTrackingId(value);
        return this.memset.add.apply(this.memset,arguments);
    }


    update(value):Promise<any>{
        return this.memset.update.apply(this.memset,arguments);
    }

    delete(value):Promise<any>{
        return this.memset.delete.apply(this.memset,arguments);
    }

    get(...expressions){
        let anySelect = expressions.find(x=>x instanceof Select);
        let externalExpression  = anySelect != null?[select(this.trackingId)] : []
        expressions = [].concat(expressions,externalExpression);
       return this.memset.get.apply(this.memset,expressions).then((response)=>{
            if(typeof response === "number") return response;
            return (Array.isArray(response) ?response:[response]).map(x=>{
                let indexOfItem = (Array.isArray(this.source)?this.source:[this.source]).findIndex(a=>a[this.trackingId] === x[this.trackingId]);
                if(indexOfItem < 0) return x;
                this.trackObject(indexOfItem,x);
                return x;
            });
            
       });
    }
}