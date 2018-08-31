
/**
 * Base data source for applying operations
 */
export class DataSet<T>{
    /**
     * fetches data as array from source.
     * @param expressions specifies events that will operate on the resource.
     */
    get(...expressions:Array<any>):Promise<any>{
        return Promise.reject('not implement');
    }
    /**
     * adds element to source 
     * @param element 
     */
    add(element:T):Promise<any>{
        return Promise.reject('not implement');
    }
    /**
     * deletes element from source
     * @param element 
     */
    delete(element:T):Promise<any>{
        return Promise.reject('not implement');
    }

    /**
     * updates element
     * @param element 
     */
    update(element:T):Promise<any>{
        return Promise.reject('not implement');
    }
    /**
     * creates a new dataset after it applied expression on it
     * @param expressions specifies events that will operate on the resource.
     */
    query(...expressions:Array<any>):DataSet<T>{
        return this;
    }
    /**
     * fetches data as array from source.
     * @returns Promise
     */
    then(callback,error):Promise<any>{
       return this.get().then(callback,error);
    }

    public static is(dataSetable){
        if(dataSetable == null) return false;
        let name = "DataSet";
       if(dataSetable.constructor == null) return false;
       if(dataSetable.constructor.name === name) return true;
       return this.is(dataSetable.__proto__);
    }
}

export class DecorateSet<T> extends DataSet<T>{
    constructor(public dataSet,public observer:{get?:Function,add?:Function,delete?:Function,update?:Function,addUpdate?:Function}){
        super();
       this.dataSet = dataSet;
    }
    get(...expressions:Array<any>){
        if(this.observer.get == null) return this.dataSet.get.apply(this.dataSet,arguments);
        let self = this;
        let arg = arguments;
        return this.observer.get.apply({
            dataset:this.dataSet,
            next:function (value){
                value = value || arg;
                return self.dataSet.get.apply(self.dataSet,value);
            }
        },arguments);
    }
    add(element:T):Promise<any>{
        if(this.observer.add == null && this.observer.addUpdate == null) return this.dataSet.add.apply(this.dataSet,arguments);
        if(this.observer.add != null)
          return this.observer.add.apply(this.dataSet,arguments);
        let arg = arguments;
        let self = this;
        return this.observer.addUpdate.apply({dataset:this.dataSet,next:function (value){
            value = value || arg;
           return self.dataSet.add.apply(self.dataSet,value);
        }},arguments);
    }
    delete(element:T){
        if(this.observer.delete == null) return this.dataSet.delete.apply(this.dataSet,arguments);
        let self = this;
        let arg = arguments;
        return this.observer.delete.apply({
            dataset:this.dataSet,
            next:function (){
                return self.dataSet.delete.apply(self.dataSet,arg);
            }
        },arguments);
    }
    update(element:T){
        if(this.observer.update == null && this.observer.addUpdate == null) return this.dataSet.update.apply(this.dataSet,arguments);
        if(this.observer.update != null)
             return this.observer.update.apply(this.dataSet,arguments);
     let arg = arguments;
     let self = this;
     return this.observer.addUpdate.apply({dataset:this.dataSet,next:function (value){
           value = value || arg;
           return self.dataSet.update.apply(self.dataSet,value);
        }},arguments);
    }
    query(...expressions:Array<any>){
        return new DecorateSet(this.dataSet.query.apply(this.dataSet,arguments),this.observer);
    }
}

