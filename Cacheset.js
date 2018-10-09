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
        let self = this;
        this.caches = self.caches || {};
        let query = OData_1.QuerySet.get(expressions);
        if (self.caches[query] != null) {
            return Promise.resolve(self.caches[query]);
        }
        return this.dataset.get.apply(this.dataset, arguments).then((response) => {
            self.caches[query] = response;
            return response;
        });
    }
    query() {
        let result = new CacheSet(this.dataset.query.apply(this.dataset, arguments));
        result.caches = this.caches;
        return result;
    }
}
exports.CacheSet = CacheSet;
//# sourceMappingURL=Cacheset.js.map