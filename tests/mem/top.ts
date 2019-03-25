import { memset, top } from '../../operations';
import { assert } from 'chai';

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
}

describe('top', function () {
    it('top 1', function (done) {
        let source = getSource();
        memset(source).get(top(1)).then((result) => {
            assert.isArray(result);
            assert.equal(1, result.length);
            done();
        });
    });

    it('get more than source length', function (done) {
        let source = getSource();
        memset(source).get(top(source.length)).then((result) => {
            assert.isArray(result);
            assert.equal(source.length, result.length);
            done();
        }).catch(done);
    });

    it('argument is minus', function (done) {
        let source = getSource();
        try {
            memset(source).get(top(-1)).then((result) => {
                assert.ok(false);
                done();
            }).catch(done);
        } catch (e) {
            assert.ok(e instanceof RangeError);
            done();
        }
    });
});