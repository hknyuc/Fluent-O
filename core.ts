export class Emitter {
    type;
    _events;
    _async;
    _sync;
    _strategy;
    /**
     * 
     * @param {string} type is sync or async. if async emits values as asynchronously otherwise synchronously
     */
    constructor(type: 'async' | 'sync') {
        this.type = type;
        this._events = [];
        this._async = (events, args) => {
            events.forEach(function (event) {
                setTimeout(function () {
                    event.apply(window, args);
                }, 0);
            });
            return true;
        }

        this._sync = (events, args) => {
            let result = true;
            events.forEach(function (event) {
                if (event.apply(window, args) === false) {
                    result = false;
                    return false;
                }
                return true;
            });
            return result;
        }

        this._strategy = type === 'sync' ? this._sync : this._async;
    }
    /**
     * hooks to actions
     * @param {Function} callbackFn 
     */
    hook(callbackFn) {
        if (typeof callbackFn !== "function") throw new Error('callbackFn is not function');
        this._events.push(callbackFn);
    }

    /**
     * Creates new emitter builder for observing.
     * @param {Object} obj object to be watched
     */
    for(obj) {
        return new EmitterObjectBuilder(obj, this);
    }

    /**
     * emits to all observers . if strategy is sync, result can break value. if returns false it must be break
     * @returns {Boolean}  break value. if true continue otherwise break.
     */
    emit(...params: Array<any>): boolean {
        return this._strategy(this._events, arguments);
    }
}

export class EmitterObjectBuilder {
    emitter;
    obj;
    /**
     * 
     * @param {Object} obj 
     * @param {Emitter} emitter 
     */
    constructor(obj, emitter) {
        this.obj = obj;
        this.emitter = emitter;
    }

    /**
     * When props change. It emits changed object
     * @param {Array} props properties
     */
    peek(props) {
        if (!Array.isArray(props)) throw new Error('EmitterObjectBuilder in on method : argument is not valid');
        let self = this;
        props.forEach((prop) => {
            Object.defineProperty(this.obj, prop, {
                get: () => {
                    return self.obj[prop];
                },
                set: (newValue) => {
                    self.obj[prop] = newValue;
                    self.emitter.emit(self.obj);
                }
            });
        });
    }
}


export class Utility {
    static ObjectDefineProperty(o: any, p: PropertyKey, attributes: PropertyDescriptor & ThisType<any>) {
        let set = attributes.set;
        let oldAttributes = Object.getOwnPropertyDescriptor(o, p) || {};
        // let oldGet = oldAttributes.get;
        let oldSet = oldAttributes.set;

        attributes.set = function (newValue) {
            if (oldSet != null)
                oldSet.apply(oldAttributes, [newValue]);
            set.apply(attributes, [newValue]);
        }

        Object.defineProperty(o, p, attributes);

        /**
         *        configurable:attributes.configurable,
            writable:attributes.writable,
            enumerable:attributes.enumerable
         */
    }

    static instanceof(instance, castingObject): boolean {
        if (instance == null)
            return false;
        let castOf = instance instanceof castingObject;
        if (castOf)
            return true;
        if (castingObject.name == null)
            return false;
        let name = castingObject.name;
        let obj =  instance.__proto__;
        let currentName;
        while (true) {
            if (obj == null)
                return false;
            currentName = obj.constructor.name;
            if (name === currentName)
                return true;
            obj = obj.__proto__;
        }
    }
}





export class TaskHandler {
    static runSequent<T>(items: Array<T>, fn: (item: T) => Promise<any>, force: boolean = false): Promise<any> {
        return new SequentTaskHandler(items, fn, force).run();
    }

    static runAsync<T>(items: Array<T>, fn: (item: T) => Promise<any>, taskCount: number = 0, timeout: number = 0): Promise<any> {
        return new AsyncTaskHandler(items, fn, taskCount, timeout).run();
    }

    static runFirstSuccess<T>(items: Array<T>, fn: (item: T) => Promise<any>) {
        return new TaskHandlerFirstSuccess(items, fn);
    }

    /**
     * 
     * @param timeout task can cancel in timeout(ms)
     */
    static createCancellable(timeout: number = 0): CancellableTaskHandler {
        return new CancellableTaskHandler(timeout);
    }

}

class SequentTaskHandlerEvent {
    isCancelled: boolean = false;
    cancel(): void {
        this.isCancelled = true;
    }
}

class SequentTaskHandler<T> {
    private returnPromise: Promise<any>;
    private arg: SequentTaskHandlerEvent;
    constructor(private items: Array<T>, private fn: (item: T, controller) => Promise<any>, private force: boolean = false) {

    }
    run(): Promise<any> {
        this.arg = new SequentTaskHandlerEvent();
        if (this.noPromise()) return Promise.resolve();
        let self = this;
        let newItems = this.createNewCollectionPromise();
        return new Promise((resolve, reject) => {
            self.bind(resolve, reject, newItems, newItems.pop());
        });
    }

    private bind(resolve: Function, reject, items: Array<Promise<any>>, value: any): void {
        this.returnPromise = this.fn(value, this.arg);
        if (this.arg.isCancelled) {
            reject("cancelled");
            return;
        }
        let self = this;
        self.returnPromise.then(() => {
            if (items.length == 0) {
                resolve();
                return;
            }
            if (this.arg.isCancelled) {
                reject("cancelled");
                return;
            }
            self.bind(resolve, reject, items, items.pop())
        }, (error) => {
            if (self.force) {
                if (items.length == 0) {
                    resolve();
                    return;
                }
                if (this.arg.isCancelled) {
                    reject("cancelled");
                    return;
                }
                self.bind(resolve, reject, items, items.pop());
                return;
            }
            reject(error);
        });

    }


    private createNewCollectionPromise(): Array<Promise<any>> {
        return this.items.map(x => x) as any;
    }

    private noPromise(): boolean {
        return this.items.length == 0;
    }

}


class AsyncTaskHandler<T> {
    constructor(private items: Array<T>, private fn: (item: T) => Promise<any>, private taskCount: number = 0, private timeout = 0) {
        if (!this.isTaskCountValid())
            throw new Error("taskCount is not valid for operation");
    }

    private isTaskCountValid(): boolean {
        if (this.taskCount < 0) return false;
        return true;
    }

    private getCount(): number {
        if (this.taskCount === 0)
            return this.items.length;
        if (this.taskCount > this.items.length)
            return this.items.length;
        return this.taskCount;
    }

    run(): Promise<any> {
        let parts = this.getAllParts();
        if (parts.length == 0) return Promise.resolve();
        return new SequentTaskHandler(parts.reverse(), (items) => {
            if (items.length == 0) return Promise.resolve();
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    let ps = items.map(x => this.fn(x));
                    Promise.all(ps).then(r => {
                        resolve(r);
                    }, (error) => {
                        reject(error)
                    });
                }, this.timeout)
            })
        }, true).run();
    }


    private isEmpty(): boolean {
        return this.items.length == 0;
    }

    private getParts(): Array<any> {
        if (this.isEmpty()) return [];
        let returns = new Array();
        for (let i = 0; i < this.getCount(); i++) {
            if (this.isEmpty()) break;
            returns.push(this.items.pop());
        }
        return returns;
    }

    private getAllParts(): Array<Array<any>> {
        let results = new Array();
        while (!this.isEmpty())
            results.push(this.getParts());
        return results;
    }

}

class CancellableTaskMediator {
    private _isCancel = false;
    get isCancelled(): boolean {
        return this._isCancel;
    }

    cancel(): void {
        this._isCancel = true;
    }
}
export class CancellableTaskHandler {
    private mediators: Array<CancellableTaskMediator> = [];
    /**
     * 
     * @param timeout invoke time 
     */
    constructor(private timeout: number) {

    }

    /**
     * adds new actions and cancels before actions
     * @param fn new action
     */
    runOnly(fn: Function): void {
        this.cancel();
        this.insertAction(fn);
    }

    private insertAction(fn: Function): void {
        var mediator = this.pullMediator();
        setTimeout(() => {
            if (mediator.isCancelled) return;
            fn();
        }, this.timeout);
    }
    /**
     * cancels all actions
     */
    cancel(): void {
        this.mediators.forEach(mediator => {
            mediator.cancel();
        })
    }

    private pullMediator(): CancellableTaskMediator {
        var mediator = new CancellableTaskMediator();
        this.mediators.push(mediator);
        return mediator;
    }
}

class TaskHandlerFirstSuccess {
    constructor(private items: Array<any>, private fn: (item: any) => Promise<any>) {

    }


    run(): Promise<any> {
        let self = this;
        let errorCount = 0;
        return new Promise((resolve, reject) => {
            new SequentTaskHandler(self.items.map(x => x), (item, ev) => {
                return self.fn(item).then((response) => {
                    ev.cancel();
                    resolve(response);
                    return response;
                }, (error) => {
                    errorCount++;
                    if (errorCount == self.items.length) {
                        reject(); // hepsi fail olursa 
                        return;
                    }
                    return error;
                })
            }, true).run().catch(() => {
                //ignore
            });
        })

    }
}