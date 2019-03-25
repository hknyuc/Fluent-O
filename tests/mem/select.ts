import { TestUtility } from './../testUtility';
import { memset, select } from '../../operations';
import { assert } from 'chai';

let getSource = function () {
    let source = [{
        name: 'test',
        id: 5,
        nested:{
            name:'hi',
            id:10
        }
    }, {
        name: 'test2',
        id: 7
    }];
    return source;
}


describe('select', function () {
    it('all', function (done) {
        let source = getSource();
        memset(source).query(select()).then((result) => {
            TestUtility.validateProperties(result, source);
            done();
        }).catch(done);
    });

    it('elected properties by struct model', function (done) {
        let source = getSource();
        memset(source).query(select('name')).then((result) => {
            assert.ok(Array.isArray(result));
            assert.equal(source.length, result.length);
            let props = Object.keys(result[0]);
            assert.equal(1, props.length);
            assert.equal('name', props[0]);
            done();
        });
    });

    it('selected all properties by struct model', function (done) {
        let source = getSource();
        memset(source).query(select('name','id')).then((result) => {
            assert.ok(Array.isArray(result));
            assert.equal(source.length, result.length);
            let props = Object.keys(result[0]);
            assert.equal(2, props.length);
            assert.equal('name', props[0]);
            assert.equal('id',props[1]);
            done();
        });
    });


    it('select non exist property',function (done){
        let source = getSource();
        memset(source).query(select('value')).then((result) =>{
              assert.ok(Array.isArray(result));
              assert.equal(source.length,result.length);
              let props = Object.keys(result[0]);
              assert.equal('value',props[0]);
              done();
        });
    });


    it('with select model has tracking symbol',function (done){
        let source = getSource();
        let dataset = memset(source);
        dataset.then((result)=>{
            assert.isArray(result);
            assert.equal(source.length,result.length);
            let allHasTrackingId = result.every((item)=> item[dataset.trackingId as any] != null);
            assert.ok(allHasTrackingId);
            done();
        }).catch(done);
    });

    it('no arguments',function (done){
        let source = getSource();
        memset(source).query(select()).then((result) => {
            TestUtility.validateProperties(result, source);
            done();
        }).catch(done);
    });
});
