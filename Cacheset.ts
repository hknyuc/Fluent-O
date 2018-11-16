import { DataSet } from "./Dataset";
import { QuerySet } from "./OData";

export class CacheSet<T> extends DataSet<T>{
    private static caches:any = {};
    private dataset:DataSet<T>
    constructor(dataset:DataSet<T>){
        if(dataset == null) throw new Error('dataset is null for caching');
        super(dataset.getExpressions());
        this.dataset = dataset;

    }
    get(expressions){
        let query = QuerySet.get(expressions);
        if(CacheSet.caches[query] != null){ 
            return Promise.resolve(CacheSet.caches[query]);
        }
        return this.dataset.get.apply(this.dataset,arguments).then((response)=>{
            CacheSet.caches[query] = response;
            return response;
        });
    }

    query(){
      let result = new CacheSet(this.dataset.query.apply(this.dataset,arguments));
      return result;
    }
 }
