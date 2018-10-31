"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Dataset_1 = require("./Dataset");
const OData_1 = require("./OData");
class CacheSet extends Dataset_1.DataSet {
    constructor(dataset) {
        if (dataset == null)
            throw new Error('dataset is null for caching');
        super();
        this.dataset = dataset;
    }
    get(expressions) {
        let query = OData_1.QuerySet.get(expressions);
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
//# sourceMappingURL=Cacheset.js.map