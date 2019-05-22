"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const operations_1 = require("../../operations");
const chai_1 = require("chai");
const testUtility_1 = require("../testUtility");
let getSource = function () {
    let source = [{
            name: 'test',
            type: 'orange',
            id: 5,
            nested: {
                name: 'hi',
                id: 10
            }
        }, {
            name: 'test2',
            type: 'apple',
            id: 5
        }, {
            name: 'test3',
            type: 'apple',
            id: 7
        }, {
            name: 'test4',
            type: 'apple',
            id: 10
        }];
    return source;
};
describe('filter', function () {
    describe('eq', function () {
        it('one logic exp', function (done) {
            let source = getSource();
            operations_1.memset(source).query(operations_1.filter(operations_1.prop('name').eq('test'))).then((result) => {
                chai_1.assert.isArray(result);
                let newResult = source.filter(a => a.name == 'test');
                chai_1.assert.equal(newResult.length, result.length);
                let allIn = result.every((p) => {
                    return newResult.some(a => testUtility_1.TestUtility.hasProperties(a, p));
                });
                chai_1.assert.ok(allIn);
                done();
            });
        });
        it('two logic exp', function (done) {
            let source = getSource();
            operations_1.memset(source).get(operations_1.filter(operations_1.prop('type').eq('apple').and(operations_1.prop('id').gt(5)))).then((result) => {
                chai_1.assert.isArray(result);
                let newResult = source.filter(x => x.type == 'apple' && x.id > 5);
                chai_1.assert.equal(newResult.length, result.length);
                done();
            });
        });
    });
});
