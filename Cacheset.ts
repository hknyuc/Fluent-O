import { DecorateSet, DataSet } from "./Dataset";
import { QuerySet } from "./OData";

export class CacheSet<T> extends DecorateSet<T>{
    private caches;
    constructor(dataset:DataSet<T>){
        if(dataset == null) throw new Error('dataset is null for caching');
        let self;
        super(dataset,{
            get:function (expressions){
                self.caches = self.caches || {};
                let query = QuerySet.get(expressions);
                if(self.caches[query] != null){ 
                    return Promise.resolve(self.caches[query]);
                }
                return this.next().then((response)=>{
                     self.caches[query] = response;
                     return response;
                });
            }
        });
        self = this;
    }

    query(expressions){
      let result = new CacheSet(this.dataSet.query.apply(this.dataSet,arguments));
      result.caches = this.caches;
      return result;
    }
 }
