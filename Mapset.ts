import { DataSet } from './Dataset';
import { MemSet } from './MemArrayVisitor';
import { Select, Expand, Filter, Top, Skip, Property, Order } from './Expressions';
export class MapSet<T> extends DataSet<T>{
    constructor(private source: DataSet<T>, private mapFn: ((element: T, index: number, items: T[]) => any) | string, private expressions: Array<any> = []) {
        super();
    }

    private createMemset(expressions) {
        if (typeof this.mapFn === "function") {
            let filters = expressions.filter(this.onlySortandElimination);
            return this.source.query.apply(this.source, expressions.filter(this.onlyRange))
                .then((response) => {
                    let result = Array.isArray(response) ? response.map(this.mapFn as any) : (this.mapFn as any)(response, -1, null);
                    let set = new MemSet(result);
                    set = set.query.apply(set, expressions.filter(this.onlySelect));
                    let memset = filters.length != 0 ? set.query.apply(set,filters) : set;
                    return {
                        set: memset
                    };
                });
        }
        if (typeof this.mapFn === "string") {
            let filters = expressions.filter(this.onlySortandElimination);
            let exps = expressions.filter(this.onlyRange).concat(new Expand([{
                property: new Property(this.mapFn),
                expressions: expressions.filter(this.onlySelect)
            }]));
            return this.source.query.apply(this.source, exps).then((response) => {
                let result = Array.isArray(response) ? response.map(x => x[this.mapFn as string]) : response[this.mapFn as string];
                let set = new MemSet(result);
                return {
                    set: (filters.length != 0 ? set.query.apply(set,filters) : set)
                };
            });
        }
        throw new Error('Not support');
    }

    query(...expression: Array<any>) {
        return new MapSet<T>(this.source, this.mapFn, [].concat(this.expressions).concat(expression || []));
    }

    private onlySelect(x) {
        let types = [Select, Expand]
        return types.some(t => x instanceof t);
    }

    private onlyRange(x) {
        let types = [Skip, Top]
        return types.some(t => x instanceof t);
    }

    private onlySortandElimination(x) {
        let types = [Filter, Order]
        return types.some(t => x instanceof t);
    }



    add(item) {
        return Promise.reject('Mapset: not support add');
    }

    update(item) {
        return Promise.reject('Mapset: not support update');
    }

    delete(item) {
        return Promise.reject('Mapset: not support delete');
    }

    get(...expression: Array<any>) {
        let allExpressions = [].concat(this.expressions || []).concat(expression || []);
        return this.createMemset(allExpressions).then((e) => {
            return e.set.then((response) => {
                return response;
            });
        });
    }
}