import { DataSet } from './Dataset';
import { MemSet } from './MemArrayVisitor';
import { Select, Expand } from './Expressions';
export class MapSet<T> extends DataSet<T>{
    get isMemorized() {
        return this.memset != null;
    }
    memset: MemSet = null;
    constructor(private source: DataSet<T>, private mapFn: (element: T) => any, private expressions: Array<any> = []) {
        super();
    }

    private debug(x){
        return x;
    }

    private createMemset(expressions){
        return this.source.query.apply(this.source,expressions.filter(this.noneSelect)).then((response)=>{
            let set = new MemSet(this.mapFn(response) || []);
            set = set.query.apply(set,expressions.filter(this.onlySelect));
            this.memset = set;
            return {
                set:set
            };
        });
    }

    query(...expression:Array<any>) {
        let exp = expression || [];
        let expressions = [].concat(this.expressions).concat(exp);
        return new MapSet<T>(this.source, this.mapFn, expressions);
    }

    private onlySelect(x){
        let types = [Select,Expand]
       return types.some(t=> x instanceof t);
    }

    private noneSelect(x){
        let types = [Select,Expand]
       return !types.some(t=> x instanceof t);
    }

    add(item) {
      return Promise.reject('Mapset: not support add');
    }

    update(item) {
        return Promise.reject('Mapset: not support update');
    }

    delete(item) {
        return Promise.reject('Mapset: not support delete');
    }

    get(...expression:Array<any>) {
        let allExpressions = [].concat(this.expressions || []).concat(expression || []);
        return this.createMemset(allExpressions).then((e) => {
            return e.set.then((response)=>{
                return response;
            });
        });
    }
}