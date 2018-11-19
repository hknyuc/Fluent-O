import { DataSet, IDataSet } from './Dataset';
export class Pipeset<T> extends DataSet<T>{
    constructor(private source: IDataSet<T>,private pipes:Array<(response:any)=>any>, expressions:Array<any> = []) {
        super(expressions);
    }

    query(...expression: Array<any>) {
      return new Pipeset(this.source,this.pipes,[].concat(this.expressions).concat(expression));
    }

    getExpressions(){
        return this.expressions;
    }

    add(item) {
        return this.source.add(item);
    }

    update(item) {
        return this.source.update(item);
    }

    delete(item) {
        return this.source.delete(item);
    }

    get(...expression: Array<any>) {
        let getResultFromPipesAsPromise = function (pipes:Array<any>,value){
          let pArray = [].concat(Array.isArray(pipes)?pipes:[pipes]).filter(fn=>typeof fn === "function");
          let valuePromise = (value instanceof Promise)?value:Promise.resolve(value);
          if(pArray.length === 0)return valuePromise;
          return valuePromise.then((v)=>{
              let pipefunc = pArray.pop();
              let funcResult = pipefunc(v);
              return getResultFromPipesAsPromise(pArray,funcResult);
          });   
        }
       return this.source.query.apply(this.source,[].concat(this.expressions).concat(expression)).then((r)=>{
          return getResultFromPipesAsPromise(this.pipes,r);
       });
    }
}