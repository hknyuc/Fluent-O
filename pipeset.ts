import { MemSet } from './memarrayvisitor';
import { DataSet, IDataSet } from './dataset';
import { MemOperation } from './memoperation';
/**
 * Query kısmına extradan lokalde yapılan işlemler eklenebilir. O işlemden sonra diğer işlem memset üzeriden gider.
 */
export class Pipeset<T> extends DataSet<T>{
    constructor(private source: IDataSet<T>, expressions: Array<any> = []) {
        super(expressions);
    }

    query(...expression: Array<any>) {
        return new Pipeset(this.source, [].concat(this.expressions).concat(expression));
    }

    getExpressions() {
        return this.expressions.filter(this.notPipeQuery);
    }

    private notPipeQuery(item) {
        return !((item instanceof MemOperation) || typeof item === "function");
    }

    private isPipeQuery(item) {
        return ((item instanceof MemOperation) || typeof item === "function");
    }

    private splitExpressionsByPipeQuery(expressions: Array<any>): {
        left: Array<any>,
        pipeQuery: MemOperation | Function,
        right: Array<any>
    } {
        let indexOfItem = expressions.findIndex(this.isPipeQuery);
        if (indexOfItem < 0) return {
            left: expressions,
            pipeQuery: null,
            right: []
        }
        let left = expressions.slice(0, indexOfItem);
        let pipeQuery = expressions[indexOfItem];
        let right = expressions.slice(indexOfItem + 1, expressions.length);
        return {
            left,
            pipeQuery,
            right
        }
    }

    add(item) {
        return this.source.add(item);
    }

    update(item) {
        return this.source.update(item);
    }

    delete(item) {
        return this.source.delete(item);
    }

    private isFunction(funcable) {
        return typeof funcable === "function";
    }

    get(...expression: Array<any>) {
        let getResultFromPipesAsPromise = function (pipes: Array<any>, value) {
            let pArray = [].concat(Array.isArray(pipes) ? pipes : [pipes]).filter(fn => typeof fn === "function");
            let valuePromise = (value instanceof Promise) ? value : Promise.resolve(value);
            if (pArray.length === 0) return valuePromise;
            return valuePromise.then((v) => {
                let pipefunc = pArray.pop();
                let funcResult = pipefunc(v);
                return getResultFromPipesAsPromise(pArray, funcResult);
            });
        }
        let expressions = this.splitExpressionsByPipeQuery([].concat(this.expressions).concat(expression));
        return this.source.query.apply(this.source, expressions.left).then((r) => {
            if (expressions.pipeQuery == null) return r;
            if (expressions.right.length === 0) return r;
            let pipeResult = !this.isFunction(expressions.pipeQuery) ?
                (expressions.pipeQuery as MemOperation).pipe(r)
                : (expressions.pipeQuery as Function)(r);
             if(pipeResult instanceof Promise){
                return pipeResult.then((response)=>{
                    return new Pipeset(new MemSet(response, expressions.right)).then((response) => {
                        return response;
                    });
                 });
             }
              return new Pipeset(new MemSet(pipeResult, expressions.right)).then((response) => {
                return response;
            });
          
        });
    }
}

