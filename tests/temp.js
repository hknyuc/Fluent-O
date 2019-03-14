var assert = require('assert');
var odata = require('../odata');
var schema = require('../schema');
var QuerySet = odata.QuerySet;
var operations = require('../operations');
var select = operations.select;
var filter = operations.filter;
var order = operations.order;
var top = operations.top;
var skip = operations.skip;
var inlineCount = operations.inlineCount;
var expand = operations.expand;
var find = operations.find;
var prop = operations.prop;
var Guid = schema.Guid;
var o = operations.o;
var $root = operations.$root;
var $it = operations.$it;
var selectMany = operations.selectMany;
var entity = odata.entity;

describe('odata', function () {
    describe('test', function () {
        it('supports two entities test', function () {
            let result = QuerySet.get(prop('ID').all($it.eq(5)));
            console.log({result});
        });
    });
});