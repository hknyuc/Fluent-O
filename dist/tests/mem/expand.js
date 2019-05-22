"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const operations_1 = require("../../operations");
const chai_1 = require("chai");
let getSource = function () {
    let source = [{
            name: 'test',
            id: 5,
            date: new Date(2010, 1, 1),
            nested: {
                name: 'hi',
                id: 10
            },
            nested2: {
                name: 'hi 2',
                id: 11
            }
        }];
    return source;
};
describe('expand', function () {
    describe('expand inner dataset', function () {
        it('child dataset works', function (done) {
            let model = { id: 5, items: operations_1.memset([{ id: 7 }]) };
            let source = operations_1.memset([model]);
            source.query(operations_1.expand('items')).then((result) => {
                let items = result[0].items;
                chai_1.assert.equal(items.length, 1);
                done();
            });
        });
        it('child dataset filter working', function (done) {
            let model = { id: 5, items: operations_1.memset([{ id: 7 }, { id: 8 }, { id: 10 }]).query(operations_1.filter(operations_1.prop('id').ge(8))) };
            let source = operations_1.memset([model]);
            source.query(operations_1.expand('items')).then((result) => {
                let items = result[0].items;
                chai_1.assert.equal(items.length, 2);
                done();
            });
        });
    });
    describe('single', function () {
        it('get object with all properties 1', function (done) {
            let source = getSource();
            operations_1.memset(source).get(operations_1.expand('nested')).then((result) => {
                chai_1.assert.isArray(result);
                chai_1.assert.equal(source.length, result.length);
                chai_1.assert.ok(result[0] != null);
                chai_1.assert.ok(result[0].nested != null);
                chai_1.assert.ok(result[0].nested2 == null);
                done();
            });
        });
        it('get object with all properties 2', function (done) {
            let source = getSource();
            operations_1.memset(source).get(operations_1.expand('nested2')).then((result) => {
                chai_1.assert.isArray(result);
                chai_1.assert.equal(source.length, result.length);
                chai_1.assert.ok(result[0] != null);
                chai_1.assert.ok(result[0].nested2 != null);
                chai_1.assert.ok(result[0].nested == null);
                done();
            });
        });
    });
    describe('select', function () {
        it('get object with select', function (done) {
            let source = getSource();
            operations_1.memset(source).get(operations_1.expand('nested', operations_1.select('id'))).then((result) => {
                chai_1.assert.isArray(result);
                chai_1.assert.equal(source.length, result.length);
                chai_1.assert.ok(result[0] != null);
                chai_1.assert.ok(result[0].nested != null);
                chai_1.assert.ok(result[0].nested.id == source[0].nested.id);
                chai_1.assert.ok(result[0].nested.name == null);
                done();
            });
        });
    });
});
