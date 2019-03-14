"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dataset_1 = require("./dataset");
const odata_1 = require("./odata");
class CacheSet extends dataset_1.DataSet {
    constructor(dataset) {
        if (dataset == null)
            throw new Error('dataset is null for caching');
        super(dataset.getExpressions());
        this.dataset = dataset;
    }
    update(value) {
        return this.dataset.update.apply(this.dataset, arguments);
    }
    add(value) {
        return this.dataset.add.apply(this.dataset, arguments);
    }
    delete(value) {
        return this.dataset.delete.apply(this.dataset, arguments);
    }
    get(expressions) {
        let query = odata_1.QuerySet.get(expressions);
        if (CacheSet.caches[query] != null) {
            return Promise.resolve(CacheSet.caches[query]);
        }
        return this.dataset.get.apply(this.dataset, arguments).then((response) => {
            CacheSet.caches[query] = response;
            return response;
        });
    }
    query() {
        let result = new CacheSet(this.dataset.query.apply(this.dataset, arguments));
        return result;
    }
}
CacheSet.caches = {};
exports.CacheSet = CacheSet;
