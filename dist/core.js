"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Emitter {
    /**
     *
     * @param {string} type is sync or async. if async emits values as asynchronously otherwise synchronously
     */
    constructor(type) {
        this.type = type;
        this._events = [];
        this._async = (events, args) => {
            events.forEach(function (event) {
                setTimeout(function () {
                    event.apply(window, args);
                }, 0);
            });
            return true;
        };
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
        };
        this._strategy = type === 'sync' ? this._sync : this._async;
    }
    /**
     * hooks to actions
     * @param {Function} callbackFn
     */
    hook(callbackFn) {
        if (typeof callbackFn !== "function")
            throw new Error('callbackFn is not function');
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
    emit(...params) {
        return this._strategy(this._events, arguments);
    }
}
exports.Emitter = Emitter;
class EmitterObjectBuilder {
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
        if (!Array.isArray(props))
            throw new Error('EmitterObjectBuilder in on method : argument is not valid');
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
exports.EmitterObjectBuilder = EmitterObjectBuilder;
class Utility {
    static ObjectDefineProperty(o, p, attributes) {
        let set = attributes.set;
        let oldAttributes = Object.getOwnPropertyDescriptor(o, p) || {};
        // let oldGet = oldAttributes.get;
        let oldSet = oldAttributes.set;
        attributes.set = function (newValue) {
            if (oldSet != null)
                oldSet.apply(oldAttributes, [newValue]);
            set.apply(attributes, [newValue]);
        };
        Object.defineProperty(o, p, attributes);
        /**
         *        configurable:attributes.configurable,
            writable:attributes.writable,
            enumerable:attributes.enumerable
         */
    }
    static instanceof(instance, castingObject) {
        if (instance == null)
            return false;
        let castOf = instance instanceof castingObject;
        if (castOf)
            return true;
        let constructor = instance["constructor"];
        if (constructor == null)
            return false;
        let name = constructor["name"];
        if (name == null)
            return false;
        if (castingObject.name == null)
            return false;
        let obj = instance.prototype;
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
exports.Utility = Utility;
class TaskHandler {
    static runSequent(items, fn, force = false) {
        return new SequentTaskHandler(items, fn, force).run();
    }
    static runAsync(items, fn, taskCount = 0, timeout = 0) {
        return new AsyncTaskHandler(items, fn, taskCount, timeout).run();
    }
    static runFirstSuccess(items, fn) {
        return new TaskHandlerFirstSuccess(items, fn);
    }
    /**
     *
     * @param timeout task can cancel in timeout(ms)
     */
    static createCancellable(timeout = 0) {
        return new CancellableTaskHandler(timeout);
    }
}
exports.TaskHandler = TaskHandler;
class SequentTaskHandlerEvent {
    constructor() {
        this.isCancelled = false;
    }
    cancel() {
        this.isCancelled = true;
    }
}
class SequentTaskHandler {
    constructor(items, fn, force = false) {
        this.items = items;
        this.fn = fn;
        this.force = force;
    }
    run() {
        this.arg = new SequentTaskHandlerEvent();
        if (this.noPromise())
            return Promise.resolve();
        let self = this;
        let newItems = this.createNewCollectionPromise();
        return new Promise((resolve, reject) => {
            self.bind(resolve, reject, newItems, newItems.pop());
        });
    }
    bind(resolve, reject, items, value) {
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
            self.bind(resolve, reject, items, items.pop());
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
    createNewCollectionPromise() {
        return this.items.map(x => x);
    }
    noPromise() {
        return this.items.length == 0;
    }
}
class AsyncTaskHandler {
    constructor(items, fn, taskCount = 0, timeout = 0) {
        this.items = items;
        this.fn = fn;
        this.taskCount = taskCount;
        this.timeout = timeout;
        if (!this.isTaskCountValid())
            throw new Error("taskCount is not valid for operation");
    }
    isTaskCountValid() {
        if (this.taskCount < 0)
            return false;
        return true;
    }
    getCount() {
        if (this.taskCount === 0)
            return this.items.length;
        if (this.taskCount > this.items.length)
            return this.items.length;
        return this.taskCount;
    }
    run() {
        let parts = this.getAllParts();
        if (parts.length == 0)
            return Promise.resolve();
        return new SequentTaskHandler(parts.reverse(), (items) => {
            if (items.length == 0)
                return Promise.resolve();
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    let ps = items.map(x => this.fn(x));
                    Promise.all(ps).then(r => {
                        resolve(r);
                    }, (error) => {
                        reject(error);
                    });
                }, this.timeout);
            });
        }, true).run();
    }
    isEmpty() {
        return this.items.length == 0;
    }
    getParts() {
        if (this.isEmpty())
            return [];
        let returns = new Array();
        for (let i = 0; i < this.getCount(); i++) {
            if (this.isEmpty())
                break;
            returns.push(this.items.pop());
        }
        return returns;
    }
    getAllParts() {
        let results = new Array();
        while (!this.isEmpty())
            results.push(this.getParts());
        return results;
    }
}
class CancellableTaskMediator {
    constructor() {
        this._isCancel = false;
    }
    get isCancelled() {
        return this._isCancel;
    }
    cancel() {
        this._isCancel = true;
    }
}
class CancellableTaskHandler {
    /**
     *
     * @param timeout invoke time
     */
    constructor(timeout) {
        this.timeout = timeout;
        this.mediators = [];
    }
    /**
     * adds new actions and cancels before actions
     * @param fn new action
     */
    runOnly(fn) {
        this.cancel();
        this.insertAction(fn);
    }
    insertAction(fn) {
        var mediator = this.pullMediator();
        setTimeout(() => {
            if (mediator.isCancelled)
                return;
            fn();
        }, this.timeout);
    }
    /**
     * cancels all actions
     */
    cancel() {
        this.mediators.forEach(mediator => {
            mediator.cancel();
        });
    }
    pullMediator() {
        var mediator = new CancellableTaskMediator();
        this.mediators.push(mediator);
        return mediator;
    }
}
exports.CancellableTaskHandler = CancellableTaskHandler;
class TaskHandlerFirstSuccess {
    constructor(items, fn) {
        this.items = items;
        this.fn = fn;
    }
    run() {
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
                });
            }, true).run().catch(() => {
                //ignore
            });
        });
    }
}
