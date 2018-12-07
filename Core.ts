export class Emitter{
    type;
    _events;
    _async;
    _sync;
    _strategy;
    /**
     * 
     * @param {string} type is sync or async. if async emits values as asynchronously otherwise synchronously
     */
    constructor(type:'async'|'sync'){
        this.type = type;
        this._events = [];
        this._async = (events,args)=>{
            events.forEach(function (event){
                setTimeout(function (){
                   event.apply(window,args);
                },0);
             });
             return true;
        }

        this._sync = (events,args)=>{
            let result = true;
            events.forEach(function (event){
                if(event.apply(window,args) === false) {
                     result = false;
                     return false;
                  }
                  return true;
             });
            return result;
        }

        this._strategy = type === 'sync'?this._sync:this._async;
    }
    /**
     * hooks to actions
     * @param {Function} callbackFn 
     */
    hook(callbackFn){
        if(typeof callbackFn !== "function") throw new Error('callbackFn is not function');
       this._events.push(callbackFn);
    }

    /**
     * Creates new emitter builder for observing.
     * @param {Object} obj object to be watched
     */
    for(obj){
       return new EmitterObjectBuilder(obj,this);
    }

    /**
     * emits to all observers . if strategy is sync, result can break value. if returns false it must be break
     * @returns {Boolean}  break value. if true continue otherwise break.
     */
    emit(...params:Array<any>):boolean{
      return this._strategy(this._events,arguments);
    }
}

export class EmitterObjectBuilder{
    emitter;
    obj;
    /**
     * 
     * @param {Object} obj 
     * @param {Emitter} emitter 
     */
    constructor(obj,emitter){
       this.obj = obj;
       this.emitter = emitter;
    }

    /**
     * When props change. It emits changed object
     * @param {Array} props properties
     */
    peek(props){
       if(!Array.isArray(props)) throw new Error('EmitterObjectBuilder in on method : argument is not valid');
       let self = this;
       props.forEach((prop)=>{
            Object.defineProperty(this.obj,prop,{
                get:()=>{
                    return self.obj[prop];
                },
                set:(newValue)=>{
                    self.obj[prop] = newValue;
                    self.emitter.emit(self.obj);
                }
            });
       });
    }
}