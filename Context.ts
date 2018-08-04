export class DataSet<T>{
    get(...expressions:Array<any>):Promise<any>{
        return Promise.reject('not implement');
    }
    add(element:T):Promise<any>{
        return Promise.reject('not implement');
    }
    delete(element:T):Promise<any>{
        return Promise.reject('not implement');
    }
    update(element:T):Promise<any>{
        return Promise.reject('not implement');
    }
    query(...expressions:Array<any>):DataSet<T>{
        return this;
    }
}

export class DecorateSet<T>{
    constructor(public dataSet,public observer:{get:Function,add:Function,delete:Function,query:Function,update:Function,addUpdate:Function}){
      
    }
    get(...expressions:Array<any>){
        if(this.observer.get == null) return this.dataSet.get.apply(this.dataSet,arguments);
        return this.observer.get.apply(this.dataSet,arguments);
    }
    add(element:T):Promise<any>{
        if(this.observer.add == null && this.observer.addUpdate == null) return this.dataSet.add.apply(this.dataSet,arguments);
        if(this.observer.add != null)
          return this.observer.add.apply(this.dataSet,arguments);
        let arg = arguments;
        let self = this;
        return this.observer.addUpdate.apply({dataset:this.dataSet,next:function (){
           return self.dataSet.add.apply(self.dataSet,arg);
        }},arguments);
    }
    delete(element:T){
        if(this.observer.delete == null) return this.dataSet.delete.apply(this.dataSet,arguments);
        return this.observer.delete.apply(this.dataSet,arguments);
    }
    update(element:T){
        if(this.observer.update == null && this.observer.addUpdate == null) return this.dataSet.update.apply(this.dataSet,arguments);
        if(this.observer.update != null)
             return this.observer.update.apply(this.dataSet,arguments);
     let arg = arguments;
     let self = this;
     return this.observer.addUpdate.apply({dataset:this.dataSet,next:function (){
           return self.dataSet.update.apply(self.dataSet,arg);
        }},arguments);
    }
    query(...expressions:Array<any>){
        return new DecorateSet(this.dataSet.query.apply(this.dataSet,arguments),this.observer);
    }
}
