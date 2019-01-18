export declare class Emitter {
    type: any;
    _events: any;
    _async: any;
    _sync: any;
    _strategy: any;
    /**
     *
     * @param {string} type is sync or async. if async emits values as asynchronously otherwise synchronously
     */
    constructor(type: 'async' | 'sync');
    /**
     * hooks to actions
     * @param {Function} callbackFn
     */
    hook(callbackFn: any): void;
    /**
     * Creates new emitter builder for observing.
     * @param {Object} obj object to be watched
     */
    for(obj: any): EmitterObjectBuilder;
    /**
     * emits to all observers . if strategy is sync, result can break value. if returns false it must be break
     * @returns {Boolean}  break value. if true continue otherwise break.
     */
    emit(...params: Array<any>): boolean;
}
export declare class EmitterObjectBuilder {
    emitter: any;
    obj: any;
    /**
     *
     * @param {Object} obj
     * @param {Emitter} emitter
     */
    constructor(obj: any, emitter: any);
    /**
     * When props change. It emits changed object
     * @param {Array} props properties
     */
    peek(props: any): void;
}
export declare class Utility {
    static ObjectDefineProperty(o: any, p: PropertyKey, attributes: PropertyDescriptor & ThisType<any>): void;
}
export declare class TaskHandler {
    static runSequent<T>(items: Array<T>, fn: (item: T) => Promise<any>, force?: boolean): Promise<any>;
    static runAsync<T>(items: Array<T>, fn: (item: T) => Promise<any>, taskCount?: number, timeout?: number): Promise<any>;
    static runFirstSuccess<T>(items: Array<T>, fn: (item: T) => Promise<any>): TaskHandlerFirstSuccess;
    /**
     *
     * @param timeout task can cancel in timeout(ms)
     */
    static createCancellable(timeout?: number): CancellableTaskHandler;
}
export declare class CancellableTaskHandler {
    private timeout;
    private mediators;
    /**
     *
     * @param timeout invoke time
     */
    constructor(timeout: number);
    /**
     * adds new actions and cancels before actions
     * @param fn new action
     */
    runOnly(fn: Function): void;
    private insertAction;
    /**
     * cancels all actions
     */
    cancel(): void;
    private pullMediator;
}
declare class TaskHandlerFirstSuccess {
    private items;
    private fn;
    constructor(items: Array<any>, fn: (item: any) => Promise<any>);
    run(): Promise<any>;
}
export {};
