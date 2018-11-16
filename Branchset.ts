import { Expand, Property } from './Expressions';
import { DataSet, IDataSet } from './Dataset';
class BranchContext {
    source: IDataSet<any>;
    branchName: string;
    expressions: Array<any>;
}

interface IBranchFetch {
    get(context: BranchContext);
}

class ClassArrayBranch implements IBranchFetch {
    get(context: BranchContext) {
        return context.source.get(((new Expand([{ property: new Property(context.branchName), expressions: context.expressions }])));
    }

}


export class Branchset<T> extends DataSet<T>{
    constructor(private source: DataSet<T>, private branchName: string) {
        super(source.getExpressions());
    }

    get(...expressions: Array<any>) {
        return this.source.get((new Expand([{ property: new Property(this.branchName), expressions: expressions }])));
    }

    then(callback, errorCallback?): Promise<any> {
        return this.source.query(new Expand([{ property: new Property(this.branchName), expressions: [] }])).then((response) => {
            return callback(response[this.branchName]);
        }, (error) => errorCallback || (function (a) { })(error));
    }

}