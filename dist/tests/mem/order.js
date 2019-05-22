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
            }
        }, {
            name: 'test2',
            id: 7,
            date: new Date(2011, 1, 1),
            nested: {
                id: 11
            }
        }];
    return source;
};
describe('order', function () {
    it('desc for string', function (done) {
        let source = getSource();
        operations_1.memset(source).get(operations_1.order('name', 'desc')).then((result) => {
            chai_1.assert.isArray(result);
            chai_1.assert.equal(source.length, result.length);
            let sortedSource = source.reverse();
            let allOk = sortedSource.every((a, index) => a.id === result[index].id);
            chai_1.assert.ok(allOk, 'reverse ok');
            done();
        });
    });
    it('desc for int', function (done) {
        let source = getSource();
        operations_1.memset(source).get(operations_1.order('id', 'desc')).then((result) => {
            chai_1.assert.isArray(result);
            chai_1.assert.equal(source.length, result.length);
            let sortedSource = source.reverse();
            let allOk = sortedSource.every((a, index) => a.id === result[index].id);
            chai_1.assert.ok(allOk, 'reverse ok');
            done();
        });
    });
    it('desc for nested', function (done) {
        let source = getSource();
        operations_1.memset(source).get(operations_1.order('nested.id', 'desc')).then((result) => {
            chai_1.assert.isArray(result);
            chai_1.assert.equal(source.length, result.length);
            let sortedSource = source.reverse();
            let allOk = sortedSource.every((a, index) => a.id === result[index].id);
            chai_1.assert.ok(allOk, 'reverse ok');
            done();
        });
    });
    it('desc for date', function (done) {
        let source = getSource();
        operations_1.memset(source).get(operations_1.order('date', 'desc')).then((result) => {
            chai_1.assert.isArray(result);
            chai_1.assert.equal(source.length, result.length);
            let sortedSource = source.reverse();
            let allOk = sortedSource.every((a, index) => a.id === result[index].id);
            chai_1.assert.ok(allOk, 'reverse ok');
            done();
        });
    });
    it('asc 1 for string', function (done) {
        let source = getSource();
        operations_1.memset(source).get(operations_1.order('name', 'asc')).then((result) => {
            chai_1.assert.isArray(result);
            chai_1.assert.equal(source.length, result.length);
            let allOk = source.every((a, index) => a.id === result[index].id);
            chai_1.assert.ok(allOk, 'reverse ok');
            done();
        });
    });
    it('asc 1 for int', function (done) {
        let source = getSource();
        operations_1.memset(source).get(operations_1.order('id', 'asc')).then((result) => {
            chai_1.assert.isArray(result);
            chai_1.assert.equal(source.length, result.length);
            let allOk = source.every((a, index) => a.id === result[index].id);
            chai_1.assert.ok(allOk, 'reverse ok');
            done();
        });
    });
    it('asc 1 for date', function (done) {
        let source = getSource();
        operations_1.memset(source).get(operations_1.order('date', 'asc')).then((result) => {
            chai_1.assert.isArray(result);
            chai_1.assert.equal(source.length, result.length);
            let allOk = source.every((a, index) => a.id === result[index].id);
            chai_1.assert.ok(allOk, 'reverse ok');
            done();
        });
    });
    it('asc 2 for string', function (done) {
        let source = getSource();
        operations_1.memset(source.reverse()).get(operations_1.order('name', 'asc')).then((result) => {
            chai_1.assert.isArray(result);
            chai_1.assert.equal(source.length, result.length);
            let allOk = source.reverse().every((a, index) => a.id === result[index].id);
            chai_1.assert.ok(allOk);
            done();
        });
    });
    it('asc 2 for int', function (done) {
        let source = getSource();
        operations_1.memset(source.reverse()).get(operations_1.order('id', 'asc')).then((result) => {
            chai_1.assert.isArray(result);
            chai_1.assert.equal(source.length, result.length);
            let allOk = source.reverse().every((a, index) => a.id === result[index].id);
            chai_1.assert.ok(allOk);
            done();
        });
    });
    it('asc 2 for date', function (done) {
        let source = getSource();
        operations_1.memset(source.reverse()).get(operations_1.order('date', 'asc')).then((result) => {
            chai_1.assert.isArray(result);
            chai_1.assert.equal(source.length, result.length);
            let allOk = source.reverse().every((a, index) => a.id === result[index].id);
            chai_1.assert.ok(allOk);
            done();
        });
    });
    it('default is desc for string', function (done) {
        let source = getSource();
        operations_1.memset(source).get(operations_1.order('name')).then((result) => {
            chai_1.assert.isArray(result);
            chai_1.assert.equal(source.length, result.length);
            let allOk = source.reverse().every((a, index) => a.id === result[index].id);
            chai_1.assert.ok(allOk);
            done();
        }).catch(done);
    });
    it('default is desc for int', function (done) {
        let source = getSource();
        operations_1.memset(source).get(operations_1.order('id')).then((result) => {
            chai_1.assert.isArray(result);
            chai_1.assert.equal(source.length, result.length);
            let allOk = source.reverse().every((a, index) => a.id === result[index].id);
            chai_1.assert.ok(allOk);
            done();
        }).catch(done);
    });
    it('default is desc for date', function (done) {
        let source = getSource();
        operations_1.memset(source).get(operations_1.order('date')).then((result) => {
            chai_1.assert.isArray(result);
            chai_1.assert.equal(source.length, result.length);
            let allOk = source.reverse().every((a, index) => a.id === result[index].id);
            chai_1.assert.ok(allOk);
            done();
        }).catch(done);
    });
});
