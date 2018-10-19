"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Dataset_1 = require("./Dataset");
class Pipeset extends Dataset_1.DataSet {
    constructor(source, pipes, expressions = []) {
        super();
        this.source = source;
        this.pipes = pipes;
        this.expressions = expressions;
    }
    query(...expression) {
        return new Pipeset(this.source, this.pipes, [].concat(this.expressions).concat(expression));
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
    get(...expression) {
        return this.source.query.apply(this.source, [].concat(this.expressions).concat(expression)).then((response) => {
            let result = response;
            this.pipes.forEach((pipe) => {
                result = pipe(result);
            });
            return result;
        });
    }
}
exports.Pipeset = Pipeset;
//# sourceMappingURL=Pipeset.js.map