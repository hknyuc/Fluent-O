import { memset, top, prop, filter } from '../../operations';
import { assert } from 'chai';
import { TestUtility } from '../testUtility';

let getSource = function () {
    let source = [{
        name: 'test',
        type:'orange',
        id: 5,
        nested: {
            name: 'hi',
            id: 10
        }
    },{
        name:'test2',
        type:'apple',
        id:5
    }, {
        name: 'test3',
        type:'apple',
        id: 7
    },{
        name:'test4',
        type:'apple',
        id:10
    }];
    return source;
}


describe('filter', function () {
    describe('eq', function () {
        it('one logic exp', function (done) {
            let source = getSource();
            memset(source).query(filter(prop('name').eq('test'))).then((result) => {
                assert.isArray(result);
                let newResult = source.filter(a => a.name == 'test');
                assert.equal(newResult.length, result.length);
                let allIn = result.every((p) => {
                    return newResult.some(a => TestUtility.hasProperties(a, p));
                });
                assert.ok(allIn);
                done();
            });
        });

        it('two logic exp',function (done){
            let source = getSource();
            memset(source).get(filter(prop('type').eq('apple').and(prop('id').gt(5)))).then((result)=>{
                assert.isArray(result);
                let newResult = source.filter(x=>x.type == 'apple' && x.id > 5);
                assert.equal(newResult.length,result.length);
                done();
            });
        });
    });
});