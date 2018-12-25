import { Emitter } from './Core';
import { DataSet, IDataSet } from './Dataset';
export class ChangeSet<T> extends DataSet<T>{
    private onAdding = new Emitter('sync');
    private onAdded = new Emitter('async');
    private onDeleting = new Emitter('sync');
    private onDeleted = new Emitter('async');
    private onUpdating = new Emitter('sync');
    private onUpdated = new Emitter('async');
    constructor(private source:IDataSet<any>){
        super(source.getExpressions())
    }

    onAdd(callback:(value:any)=>boolean):ChangeSet<T>{
      this.onAdding.hook(callback);
      return this;
    }

    whenAdded(callback:(value:any)=>any):ChangeSet<T>{
        this.onAdded.hook(callback);
        return this;
    }

    whenDeleted(callback:(value:any)=>any):ChangeSet<T>{
        this.onDeleted.hook(callback);
        return this;
    }
    whenUpdated(callback:(value:any)=>any):ChangeSet<T>{
        this.onUpdated.hook(callback);
        return this;
    }


    onDelete(callback:(value:any)=>boolean):ChangeSet<T>{
        this.onDeleting.hook(callback);
        return this;
    }

    onUpdate(callback:(value:any) =>boolean):ChangeSet<T>{
        this.onUpdating.hook(callback);
        return this;
    }

    getEmitValue(obj){
        return Object.assign({
            source:this.source,
            changeset:this,
        },obj);
    }

    getInterrupted(message){
       return new ChangeSetinterruptedArgs(this,message);
    }

    query(...expressions:Array<any>):ChangeSet<T>{
        return new ChangeSet(this.source.query.apply(this.source,arguments));
    }

    add(value):Promise<T>{
        if(this.onAdding.emit(this.getEmitValue({value})) == false) return Promise.reject(this.getInterrupted('adding is interrupted'));
      return this.source.add(value).then((response)=>{
            this.onAdded.emit(this.getEmitValue({value,response}));
            return response;
      });
    }

    update(value):Promise<T>{
        if(this.onUpdating.emit(this.getEmitValue({value})) == false) return Promise.reject(this.getInterrupted('updating is interrupted'));
        return this.source.update(value).then((response)=>{
            this.onUpdated.emit(this.getEmitValue({value,response}));
            return response;
        });
    }


    delete(value):Promise<T>{
        if(this.onDeleting.emit(this.getEmitValue({value})) == false) return Promise.reject(this.getInterrupted('deleting is interrupted'));
        return this.source.delete(value).then((response)=>{
             this.onDeleted.emit(this.getEmitValue({value,response}));
            return response;
        })
    }

    get(){
        return this.source.get.apply(this.source,arguments);
    }
}

export class ChangeSetinterruptedArgs{
    constructor(public changeset,public message){
   
    }
}