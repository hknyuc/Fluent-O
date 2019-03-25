"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("assert");
const operations_1 = require("../../operations");
describe('select', function () {
    it('select all', function (done) {
        let source = [{
                name: 'test',
                id: 5
            }, {
                name: 'test2',
                id: 7
            }];
        operations_1.memset(source).query(operations_1.select()).then((result) => {
            assert_1.default.equal(source, result);
            done();
        }).catch(done);
    });
});
