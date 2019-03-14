"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("./core");
const dataset_1 = require("./dataset");
class ChangeSet extends dataset_1.DataSet {
    constructor(source) {
        super(source.getExpressions());
        this.source = source;
        this.onAdding = new core_1.Emitter('sync');
        this.onAdded = new core_1.Emitter('async');
        this.onDeleting = new core_1.Emitter('sync');
        this.onDeleted = new core_1.Emitter('async');
        this.onUpdating = new core_1.Emitter('sync');
        this.onUpdated = new core_1.Emitter('async');
    }
    onAdd(callback) {
        this.onAdding.hook(callback);
        return this;
    }
    whenAdded(callback) {
        this.onAdded.hook(callback);
        return this;
    }
    whenDeleted(callback) {
        this.onDeleted.hook(callback);
        return this;
    }
    whenUpdated(callback) {
        this.onUpdated.hook(callback);
        return this;
    }
    onDelete(callback) {
        this.onDeleting.hook(callback);
        return this;
    }
    onUpdate(callback) {
        this.onUpdating.hook(callback);
        return this;
    }
    getEmitValue(obj) {
        return Object.assign({
            source: this.source,
            changeset: this,
        }, obj);
    }
    getInterrupted(message) {
        return new ChangeSetinterruptedArgs(this, message);
    }
    query(...expressions) {
        return new ChangeSet(this.source.query.apply(this.source, arguments));
    }
    add(value) {
        if (this.onAdding.emit(this.getEmitValue({ value })) == false)
            return Promise.reject(this.getInterrupted('adding is interrupted'));
        return this.source.add(value).then((response) => {
            this.onAdded.emit(this.getEmitValue({ value, response }));
            return response;
        });
    }
    update(value) {
        if (this.onUpdating.emit(this.getEmitValue({ value })) == false)
            return Promise.reject(this.getInterrupted('updating is interrupted'));
        return this.source.update(value).then((response) => {
            this.onUpdated.emit(this.getEmitValue({ value, response }));
            return response;
        });
    }
    delete(value) {
        if (this.onDeleting.emit(this.getEmitValue({ value })) == false)
            return Promise.reject(this.getInterrupted('deleting is interrupted'));
        return this.source.delete(value).then((response) => {
            this.onDeleted.emit(this.getEmitValue({ value, response }));
            return response;
        });
    }
    get() {
        return this.source.get.apply(this.source, arguments);
    }
}
exports.ChangeSet = ChangeSet;
class ChangeSetinterruptedArgs {
    constructor(changeset, message) {
        this.changeset = changeset;
        this.message = message;
    }
}
exports.ChangeSetinterruptedArgs = ChangeSetinterruptedArgs;
