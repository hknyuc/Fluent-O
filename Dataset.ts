

export interface IDataSet<T>{
    getExpressions():Array<any>;
     /**
     * fetches data as array from source.
     * @param expressions specifies events that will operate on the resource.
     */
    get(...expressions:Array<any>):Promise<any>;
    /**
     * adds element to source 
     * @param element 
     */
    add(element:T):Promise<any>;
    /**
     * deletes element from source
     * @param element 
     */
    delete(element:T):Promise<any>;

    /**
     * updates element
     * @param element 
     */
    update(element:T):Promise<any>;
    /**
     * creates a new dataset after it applied expression on it
     * @param expressions specifies events that will operate on the resource.
     */
    query(...expressions:Array<any>):IDataSet<T>;
    /**
     * fetches data as array from source.
     * @returns Promise
     */
    then(callback,errorCallback?):Promise<any>;

    map(mapFn:(element:any)=>any):Promise<any>;

    insertTo(params:Array<any>|object):Promise<any>;
}


/**
 * Base data source for applying operations
 */
export class DataSet<T> implements IDataSet<T>{
    protected expressions:Array<any>;
    constructor(expressions:Array<any>){
        this.expressions = expressions;
     
    }
    getExpressions(){
        return this.expressions;
    }
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
    then(callback,errorCallback?):Promise<any>{
       return this.get().then(callback,errorCallback);
    }

    map(mapFn:(element:any)=>any):Promise<any>{
        return this.then((response)=>(response || []).map(mapFn));
    }

    insertTo(params:Array<any>|object):Promise<any>{
        if(params == null) return Promise.resolve(null);
        return this.then((response)=>{
             if(Array.isArray(params) && Array.isArray(response)){
                 response.forEach((item)=>{
                    params.push(item);
                 });
                 return params;
             }
 
             if(Array.isArray(params) && !Array.isArray(response)){
                 params.push(response);
                 return params;
             }
 
             if(!Array.isArray(params) && !Array.isArray(response)){
                 for(let i in response){
                     params[i] = response[i];
                 }
 
                 return params;
             }
             throw new Error('not support');
        });
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
    constructor(public dataSet:DataSet<T>,public observer:{get?:Function,add?:Function,delete?:Function,update?:Function,addUpdate?:Function}){
        super(dataSet.getExpressions());
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

    map(mapFn){
        return this.dataSet.map(mapFn);
    }

    insertTo(params){
        return this.dataSet.insertTo(params);
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
        return new DecorateSet(this.dataSet.query.apply(this.dataSet,arguments),this.observer) as any;
    }
}

