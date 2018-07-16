export interface DataSet<T>{
    get(...expressions:Array<any>):Promise<any>;
    add(element:T):Promise<any>;
    delete(element:T):Promise<any>;
    update(element:T):Promise<any>;
    query(...expressions:Array<any>):DataSet<T>;
}
