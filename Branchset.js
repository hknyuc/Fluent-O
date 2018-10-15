"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expressions_1 = require("./Expressions");
const Dataset_1 = require("./Dataset");
class Branchset extends Dataset_1.DataSet {
    constructor(source, branchName) {
        super();
        this.source = source;
        this.branchName = branchName;
    }
    get(...expressions) {
        return this.source.get((new Expressions_1.Expand([{ property: new Expressions_1.Property(this.branchName), expressions: expressions }])));
    }
    then(callback, errorCallback) {
        return this.source.query(new Expressions_1.Expand([{ property: new Expressions_1.Property(this.branchName), expressions: [] }])).then((response) => {
            return callback(response[this.branchName]);
        }, (error) => errorCallback || (function (a) { })(error));
    }
}
exports.Branchset = Branchset;
//# sourceMappingURL=Branchset.js.map