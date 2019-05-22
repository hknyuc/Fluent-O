"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testUtility_1 = require("./../testUtility");
const operations_1 = require("../../operations");
const chai_1 = require("chai");
let getSource = function () {
    let source = [{
            name: 'test',
            id: 5,
            nested: {
                name: 'hi',
                id: 10
            }
        }, {
            name: 'test2',
            id: 7
        }];
    return source;
};
describe('select', function () {
    it('all', function (done) {
        let source = getSource();
        operations_1.memset(source).query(operations_1.select()).then((result) => {
            testUtility_1.TestUtility.validateProperties(result, source);
            done();
        }).catch(done);
    });
    it('elected properties by struct model', function (done) {
        let source = getSource();
        operations_1.memset(source).query(operations_1.select('name')).then((result) => {
            chai_1.assert.ok(Array.isArray(result));
            chai_1.assert.equal(source.length, result.length);
            let props = Object.keys(result[0]);
            chai_1.assert.equal(1, props.length);
            chai_1.assert.equal('name', props[0]);
            done();
        });
    });
    it('selected all properties by struct model', function (done) {
        let source = getSource();
        operations_1.memset(source).query(operations_1.select('name', 'id')).then((result) => {
            chai_1.assert.ok(Array.isArray(result));
            chai_1.assert.equal(source.length, result.length);
            let props = Object.keys(result[0]);
            chai_1.assert.equal(2, props.length);
            chai_1.assert.equal('name', props[0]);
            chai_1.assert.equal('id', props[1]);
            done();
        });
    });
    it('select non exist property', function (done) {
        let source = getSource();
        operations_1.memset(source).query(operations_1.select('value')).then((result) => {
            chai_1.assert.ok(Array.isArray(result));
            chai_1.assert.equal(source.length, result.length);
            let props = Object.keys(result[0]);
            chai_1.assert.equal('value', props[0]);
            done();
        });
    });
    it('with select model has tracking symbol', function (done) {
        let source = getSource();
        let dataset = operations_1.memset(source);
        dataset.then((result) => {
            chai_1.assert.isArray(result);
            chai_1.assert.equal(source.length, result.length);
            let allHasTrackingId = result.every((item) => item[dataset.trackingId] != null);
            chai_1.assert.ok(allHasTrackingId);
            done();
        }).catch(done);
    });
    it('no arguments', function (done) {
        let source = getSource();
        operations_1.memset(source).query(operations_1.select()).then((result) => {
            testUtility_1.TestUtility.validateProperties(result, source);
            done();
        }).catch(done);
    });
});
