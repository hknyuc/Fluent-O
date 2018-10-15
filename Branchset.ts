import { Expand, Property } from './Expressions';
import { DataSet } from './Dataset';
export class Branchset<T> extends DataSet<T>{
   constructor(private source:DataSet<T>,private branchName:string){
        super();
   }

   get(...expressions:Array<any>){
       return this.source.get((new Expand([{property:new Property(this.branchName),expressions:expressions}])));
   }

   then(callback,errorCallback?):Promise<any>{
       return this.source.query(new Expand([{property:new Property(this.branchName),expressions:[]}])).then((response)=>{
           return callback(response[this.branchName]);
       },(error)=>errorCallback||(function (a){})(error));
   }

}