import { MemSet } from './MemArrayVisitor';
import { IDataSet, DataSet } from './Dataset';
import { MemOperation } from './MemOperation';
export class Pointset<T> extends DataSet<T>{
    constructor(private datasource: IDataSet<T>,  expressions: Array<any> = [], private memOperations: Array<any> = []) {
            super(expressions)
    }

    getExpressions(): any[] {
        return this.expressions.map(x => x);
    }

    private static insureAsPromise(value){
        return value instanceof Promise ?value:Promise.resolve(value);
    }

    /**
     * Hafıza alındığında yapılacak işlemler.
     * @param expressions MemOperation ya da expressions
     */
    whenMemorized(...expressions:Array<MemOperation|any>):Pointset<T>{
        this.memOperations = this.memOperations.concat(expressions);
        return this;
    }

    private applyMemOps(ops:Array<any>,response:Array<any>){
        if(!Array.isArray(response) || ops.length === 0) return Pointset.insureAsPromise(response);
        let operations = [].concat(ops);
        let pipe = operations.pop();
        if(typeof pipe === "function"){
            return Pointset.insureAsPromise(pipe(response)).then((response)=>{
                    return this.applyMemOps(operations,response);
            });
        }
        if(pipe instanceof MemOperation)
           return  Pointset.insureAsPromise(pipe.pipe(response)).then((response)=>{
                return this.applyMemOps(operations,response);
           });
           //expressionda olabilir.
        return new MemSet(response,[pipe]).then((resp)=>{
            return resp;
        });
    }

    get(...expressions: any[]): Promise<any> {
        return this.datasource.get.apply(this.datasource, arguments).then((response) => {
            return this.applyMemOps(this.memOperations,response);
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
        return new Pointset(this.datasource, this.expressions.concat(expressions), this.memOperations.map(x => x));
    }

}