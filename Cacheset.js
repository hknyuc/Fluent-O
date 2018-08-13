"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Dataset_1 = require("./Dataset");
const OData_1 = require("./OData");
class CacheSet extends Dataset_1.DecorateSet {
    constructor(dataset) {
        if (dataset == null)
            throw new Error('dataset is null for caching');
        let self;
        super(dataset, {
            get: function (expressions) {
                self.caches = self.caches || {};
                let query = OData_1.QuerySet.get(expressions);
                if (self.caches[query] != null) {
                    console.log({ caching: true, expressions, response: self.caches[query] });
                    return Promise.resolve(self.caches[query]);
                }
                return this.next().then((response) => {
                    self.caches[query] = response;
                    return response;
                });
            }
        });
        self = this;
    }
    query(expressions) {
        let result = new CacheSet(this.dataSet.query.apply(this.dataSet, arguments));
        result.caches = this.caches;
        return result;
    }
}
exports.CacheSet = CacheSet;
//# sourceMappingURL=Cacheset.js.map