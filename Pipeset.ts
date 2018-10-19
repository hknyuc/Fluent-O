import { DataSet, IDataSet } from './Dataset';
export class Pipeset<T> extends DataSet<T>{
    constructor(private source: IDataSet<T>,private pipes:Array<(response:any)=>any>,private expressions:Array<any> = []) {
        super();
    }

    query(...expression: Array<any>) {
      return new Pipeset(this.source,this.pipes,[].concat(this.expressions).concat(expression));
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
       return this.source.query.apply(this.source,[].concat(this.expressions).concat(expression)).then((response)=>{
            let result = response;
            this.pipes.forEach((pipe)=>{
                result = pipe(result);
            });
            return result;
       });
    }
}