import { DataSet } from "./Dataset";
import { QuerySet } from "./OData";

export class CacheSet<T> extends DataSet<T>{
    private caches;
    private dataset:DataSet<T>
    constructor(dataset:DataSet<T>){
        if(dataset == null) throw new Error('dataset is null for caching');
        super();
        this.dataset = dataset;
    }

    get(expressions){
        let self = this;
        this.caches = self.caches || {};
        let query = QuerySet.get(expressions);
        if(self.caches[query] != null){ 
            return Promise.resolve(self.caches[query]);
        }
        return this.dataset.get.apply(this.dataset,arguments).then((response)=>{
            self.caches[query] = response;
            return response;
        });
    }

    query(){
      let result = new CacheSet(this.dataset.query.apply(this.dataset,arguments));
      result.caches = this.caches;
      return result;
    }
 }
