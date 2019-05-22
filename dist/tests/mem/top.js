"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
describe('top', function () {
    it('top 1', function (done) {
        let source = getSource();
        operations_1.memset(source).get(operations_1.top(1)).then((result) => {
            chai_1.assert.isArray(result);
            chai_1.assert.equal(1, result.length);
            done();
        });
    });
    it('get more than source length', function (done) {
        let source = getSource();
        operations_1.memset(source).get(operations_1.top(source.length)).then((result) => {
            chai_1.assert.isArray(result);
            chai_1.assert.equal(source.length, result.length);
            done();
        }).catch(done);
    });
    it('argument is minus', function (done) {
        let source = getSource();
        try {
            operations_1.memset(source).get(operations_1.top(-1)).then((result) => {
                chai_1.assert.ok(false);
                done();
            }).catch(done);
        }
        catch (e) {
            chai_1.assert.ok(e instanceof RangeError);
            done();
        }
    });
});
