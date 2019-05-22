import { memset, select, expand, filter, prop } from '../../operations';
import { assert } from 'chai';

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
}


describe('expand', function () {

    describe('expand inner dataset',function (){
        it('child dataset works',function (done){
        let model = {id:5,items:memset([{id:7}])};
        let source = memset([model]);
          source.query(expand('items')).then((result)=>{
             let items = result[0].items;
             assert.equal(items.length,1);
            done();
        })
       });

       it('child dataset filter working',function (done){
        let model = {id:5,items:memset([{id:7},{id:8},{id:10}]).query(filter(prop('id').ge(8)))};
        let source = memset([model]);
          source.query(expand('items')).then((result)=>{
             let items = result[0].items;
             assert.equal(items.length,2);
            done();
        })
       });

    })

    describe('single', function () {
        it('get object with all properties 1', function (done) {
            let source = getSource();
            memset(source).get(expand('nested')).then((result) => {
                assert.isArray(result);
                assert.equal(source.length, result.length);
                assert.ok(result[0] != null);
                assert.ok(result[0].nested != null);
                assert.ok(result[0].nested2 == null);
                done();
            });
        });

        it('get object with all properties 2', function (done) {
            let source = getSource();
            memset(source).get(expand('nested2')).then((result) => {
                assert.isArray(result);
                assert.equal(source.length, result.length);
                assert.ok(result[0] != null);
                assert.ok(result[0].nested2 != null);
                assert.ok(result[0].nested == null);
                done();
            });
        });
    });

    describe('select',function (){
       it('get object with select', function (done) {
            let source = getSource();
            memset(source).get(expand('nested', select('id'))).then((result) => {
                assert.isArray(result);
                assert.equal(source.length, result.length);
                assert.ok(result[0] != null);
                assert.ok(result[0].nested != null);
                assert.ok(result[0].nested.id == source[0].nested.id);
                assert.ok(result[0].nested.name == null);
                done();
            });
        });
   });
   
});