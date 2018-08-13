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
    then() {
        return this.get();
    }
    static is(dataSetable) {
        if (dataSetable == null)
            return false;
        let name = "DataSet";
        if (dataSetable.constructor == null)
            return false;
        if (dataSetable.constructor.name === name)
            return true;
        return this.is(dataSetable.__proto__);
    }
}
exports.DataSet = DataSet;
class DecorateSet extends DataSet {
    constructor(dataSet, observer) {
        super();
        this.dataSet = dataSet;
        this.observer = observer;
        this.dataSet = dataSet;
    }
    get(...expressions) {
        if (this.observer.get == null)
            return this.dataSet.get.apply(this.dataSet, arguments);
        let self = this;
        let arg = arguments;
        return this.observer.get.apply({
            dataset: this.dataSet,
            next: function (value) {
                value = value || arg;
                return self.dataSet.get.apply(self.dataSet, value);
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
        return this.observer.addUpdate.apply({ dataset: this.dataSet, next: function (value) {
                value = value || arg;
                return self.dataSet.add.apply(self.dataSet, value);
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
        return this.observer.addUpdate.apply({ dataset: this.dataSet, next: function (value) {
                value = value || arg;
                return self.dataSet.update.apply(self.dataSet, value);
            } }, arguments);
    }
    query(...expressions) {
        return new DecorateSet(this.dataSet.query.apply(this.dataSet, arguments), this.observer);
    }
}
exports.DecorateSet = DecorateSet;
//# sourceMappingURL=Dataset.js.map