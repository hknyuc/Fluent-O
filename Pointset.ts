import {IDataSet } from './Dataset';
import { MemOperation } from './MemOperation';
export class Pointset<T> implements IDataSet<T>{
    constructor(private datasource:IDataSet<T>,private expressions:Array<any> = [],private memOperations:Array<any> = []){
 
    }

    getExpressions(): any[] {
        return this.expressions.map(x=>x);
    }

    private applyMemOperation(response:Array<any>):Promise<any>{
        if(!Array.isArray(response)) return response;
        let current = response;
        this.memOperations.forEach((mem)=>{
            if(typeof mem === "function")
               current = mem(current);
            if(mem instanceof MemOperation)
               current = mem.pipe(current);
        });
    }
    get(...expressions: any[]): Promise<any> {
       return this.datasource.get.apply(this.datasource,arguments).then((response)=>{
            return this.applyMemOperation(response);
       });
    }
    add(element: T): Promise<any> {
        return this.datasource.add(element);
    }
    delete(element: T): Promise<any> {
        return this.datasource.delete(element);
    }
    update(element: T): Promise<any> {
        return this.datasource.update(element);
    }
    query(...expressions: any[]): IDataSet<T> {
        return new Pointset(this.datasource,this.expressions.concat(expressions),this.memOperations.map(x=>x));
    }
    then(callback: any, errorCallback?: any): Promise<any> {
        return this.datasource.then(callback,errorCallback);
    }
    map(mapFn: (element: any) => any): Promise<any> {
        return this.datasource.map(mapFn);
    }
    insertTo(params: object | any[]): Promise<any> {
        return this.datasource.insertTo(params);
    }
  
}