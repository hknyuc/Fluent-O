var easyAssert = require("./extends").EasyAssert;
var assert = require('assert');
var memset = require('../memarrayvisitor').MemSet;
var schema = require('../schema');
var operations = require('../operations');
var mem = require('../operations').memset;


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
easyAssert.use(assert);

describe("expand", function () {

    it('expand dataset',function (done){
        let arr = [{id:'7',name:'hakan'},{id:'10',name:'erkan'}]
         let obj = {
             id:'5',
             names:mem(arr)
         }

         memset.get([obj],expand('names')).then((result)=>{
            assert.true(Array.isArray(result));
            assert.equal(result.length,1);
            let item = result[0];
            assert.notEqual(item.names,null);
            assert.equal(Array.isArray(item.names),true);
            assert.equal(item.names.length,2);
            assert.deepEqual(item.names,arr);
            done();
         })
    });

    it('expand dataset property can search',function (done){
        let obj  = {
            id:'5',
            name:mem([{id:'5',name:'5'},{'id':6,name:'9'}]).query(find({id:'5'}))
        }
        memset.get([obj],expand('name')).then((result)=>{
            assert.equal(Array.isArray(result),true);
            assert.equal(result.length,1);
            assert.equal(result[0].name.id,'5');
            done();
        });
    });

    it('select odataset not return',function (done){
        let arr = [{id:'5',name:'5'},{'id':6,name:'9'}];
        let obj  = {
            id:'5',
            names:mem(arr)
        }

       memset.get([obj]).then((result)=>{
            assert.equal(Array.isArray(result),true);
            assert.equal(result[0].names,null);
            assert.equal(result[0].id,"5");
            done();
           // assert.equal(result[0].names,arr);
       });

    });

    it('expand dataset return empty nested dataset if it is not expanded',function (done){
        let types =[{id:1,name:'voice'},{id:2,name:'net'}];
        let obj  = {
            id:'5',
            names:mem([{id:'5',name:'5',types:mem(types)},{'id':6,name:'9',types:mem(types)}])
        }

        memset.get([obj],expand('names',expand('types'))).then((result)=>{
            assert.true(Array.isArray(result));
            assert.equal(result.length,1);
            let item = result[0];
            assert.true(Array.isArray(item.names));
            assert.equal(item.names.length,2);
            assert.equal(item.names[0].id,'5');
            assert.notEqual(item.names[0].types,null);
            assert.deepEqual(item.names[0].types,types);
            done();
        });
    });
    it('dataset expand nested dataset',function (done){
        let types =[{id:1,name:'voice'},{id:2,name:'net'}];
        let obj  = {
            id:'5',
            names:mem([{id:'5',name:'5',types:mem(types)},{'id':6,name:'9',types:mem(types)}])
        }

        memset.get([obj],expand('names',expand('types'))).then((result)=>{
            assert.true(Array.isArray(result));
            assert.equal(result.length,1);
            let item = result[0];
            assert.true(Array.isArray(item.names));
            assert.equal(item.names.length,2);
            assert.equal(item.names[0].id,'5');
            assert.notEqual(item.names[0].types,null);
            assert.deepEqual(item.names[0].types,types);
            done();
        });
    });

    it('dataset expand nested fitler dataset',function (done){
        let types =[{id:1,name:'voice'},{id:2,name:'net'}];
        let obj  = {
            id:'5',
            names:mem([{id:'5',name:'5',types:mem(types)},{'id':6,name:'9',types:mem(types)}])
        }
        memset.get([obj],expand('names',expand('types',filter(prop('name').eq('voice'))))).then((result)=>{
            assert.true(Array.isArray(result));
            assert.equal(result.length,1);
            let item = result[0];
            assert.true(Array.isArray(item.names));
            assert.equal(item.names.length,2);
            assert.equal(item.names[0].id,'5');
            assert.notEqual(item.names[0].types,null);
            assert.true(Array.isArray(item.names[0].types));
            assert.equal(item.names[0].types.length,1);
            assert.deepEqual(item.names[0].types[0],{id:1,name:'voice'});
            done();
        });
    });

    it('expand object works',function (done){
        let types =[{id:1,name:'voice'},{id:2,name:'net'}];
        let obj  = {
            id:'5',
            names:mem([{id:'5',name:'5',types:mem(types)},{'id':6,name:'9',types:mem(types)}])
        }
        memset.get(obj,expand('names',expand('types',filter(prop('name').eq('voice'))))).then((result)=>{
            let item = result;
            assert.true(Array.isArray(item.names));
            assert.equal(item.names.length,2);
            assert.equal(item.names[0].id,'5');
            assert.notEqual(item.names[0].types,null);
            assert.true(Array.isArray(item.names[0].types));
            assert.equal(item.names[0].types.length,1);
            assert.deepEqual(item.names[0].types[0],{id:1,name:'voice'});
            done();
        });
    });


    
});