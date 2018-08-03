var easyAssert = require("./extends").EasyAssert;
var assert = require('assert');
var memset = require('../MemArrayVisitor').MemSet;
var schema = require('../Schema');
var operations = require('../Operations');
var mem = require('../Operations').memset;

easyAssert.use(assert);

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
var count = operations.count;
var selectMany = operations.selectMany;

describe("expand", function () {
    it('expand lazy property can search',function (done){
        let obj  = {
            id:'5',
            name:mem([{id:'5',name:'5'},{'id':6,name:'9'}]).query(find({id:'5'}))
        }

        memset.get([obj],expand('name')).then((result)=>{
            assert.equal(Array.isArray(result),true);
            assert.equal(result.length,1);
            assert.equal(result[0].name.id,'5')
            done();
        });
    });
/*
    it('expand lazy property ',function (done){
        let arr = [{id:'5',name:'5'},{'id':6,name:'9'}];
        let obj  = {
            id:'5',
            names:mem(arr)
        }

       memset.get([obj]).then((result)=>{
             console.log({result});
            assert.equal(Array.isArray(result),true);
            assert.equal(Array.isArray(result[0].names),true);
            assert.equal(result[0].names,arr);
            done();
       });

    })
    */
    
});