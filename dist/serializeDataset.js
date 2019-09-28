/*import { ExpressionVisitor, Property, Value } from './expressions';
import { IDataSet } from './dataset';
import { Expand } from './dist/expressions';
export class SerializerDataSet extends ExpressionVisitor {
    private _result = "";

    public get result(){
        return this._result;
    }
     expand(expand:Expand){
         this.setResult(this.getString('expand',expand.args.map(x=>this.getResult(x))))
     }

     property(property:Property){
         this.setResult(this.getString('property',{name:property.name,parent:this.getResult(property.parent)}))
     }

     value(value:Value){
        this.setResult(this.getString('value',{value:}))
     }

     private getResult(o){
     if(o == null) return null;
       let serializer = new SerializerDataSet();
       serializer.visit(o);
       return serializer.result;;
     }


     setResult(text:string){
        this._result = text;
     }


     private getString(type,object){
         let o = {__fluento_type__:type,o:object};
         return JSON.stringify(o);
     }
}
*/ 
