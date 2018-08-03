"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DecorateSet {
    constructor(dataSet, observer) {
        this.dataSet = dataSet;
        this.observer = observer;
    }
    get(...expressions) {
        if (this.observer.get == null)
            return this.dataSet.get.apply(this.dataSet, arguments);
        return this.observer.get.apply(this.dataSet, arguments);
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
        return this.observer.delete.apply(this.dataSet, arguments);
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
//# sourceMappingURL=Context.js.map