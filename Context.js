"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DataSet {
    get(...expressions) {
        return Promise.reject('not implement');
    }
    add(element) {
        return Promise.reject('not implement');
    }
    delete(element) {
        return Promise.reject('not implement');
    }
    update(element) {
        return Promise.reject('not implement');
    }
    query(...expressions) {
        return this;
    }
}
exports.DataSet = DataSet;
class DecorateSet {
    constructor(dataSet, observer) {
        this.dataSet = dataSet;
        this.observer = observer;
    }
    get(...expressions) {
        if (this.observer.get == null)
            return this.dataSet.get.apply(this.dataSet, arguments);
        let self = this;
        let arg = arguments;
        return this.observer.get.apply({
            dataset: this.dataSet,
            next: function () {
                return self.dataSet.get.apply(self.dataSet, arg);
            }
        }, arguments);
    }
    add(element) {
        if (this.observer.add == null && this.observer.addUpdate == null)
            return this.dataSet.add.apply(this.dataSet, arguments);
        if (this.observer.add != null)
            return this.observer.add.apply(this.dataSet, arguments);
        let arg = arguments;
        let self = this;
        return this.observer.addUpdate.apply({ dataset: this.dataSet, next: function () {
                return self.dataSet.add.apply(self.dataSet, arg);
            } }, arguments);
    }
    delete(element) {
        if (this.observer.delete == null)
            return this.dataSet.delete.apply(this.dataSet, arguments);
        let self = this;
        let arg = arguments;
        return this.observer.delete.apply({
            dataset: this.dataSet,
            next: function () {
                return self.dataSet.delete.apply(self.dataSet, arg);
            }
        }, arguments);
    }
    update(element) {
        if (this.observer.update == null && this.observer.addUpdate == null)
            return this.dataSet.update.apply(this.dataSet, arguments);
        if (this.observer.update != null)
            return this.observer.update.apply(this.dataSet, arguments);
        let arg = arguments;
        let self = this;
        return this.observer.addUpdate.apply({ dataset: this.dataSet, next: function () {
                return self.dataSet.update.apply(self.dataSet, arg);
            } }, arguments);
    }
    query(...expressions) {
        return new DecorateSet(this.dataSet.query.apply(this.dataSet, arguments), this.observer);
    }
}
exports.DecorateSet = DecorateSet;
class CacheSet extends DecorateSet {
    constructor(dataset) {
        super(dataset, {
            get: function () {
                return this;
            }
        });
    }
}
exports.CacheSet = CacheSet;
//# sourceMappingURL=Context.js.map