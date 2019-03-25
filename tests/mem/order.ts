import { memset, top, order } from '../../operations';
import { assert } from 'chai';

let getSource = function () {
    let source = [{
        name: 'test',
        id: 5,
        date:new Date(2010,1,1),
        nested: {
            name: 'hi',
            id: 10
        }
    }, {
        name: 'test2',
        id: 7,
        date:new Date(2011,1,1),
        nested:{
            id:11
        }
    }];
    return source;
}


describe('order', function () {
    it('desc for string', function (done) {
        let source = getSource();
        memset(source).get(order('name', 'desc')).then((result) => {
            assert.isArray(result);
            assert.equal(source.length, result.length);
            let sortedSource = source.reverse();
            let allOk = sortedSource.every((a, index) => a.id === result[index].id);
            assert.ok(allOk, 'reverse ok');
            done();
        });
    });

    it('desc for int', function (done) {
        let source = getSource();
        memset(source).get(order('id', 'desc')).then((result) => {
            assert.isArray(result);
            assert.equal(source.length, result.length);
            let sortedSource = source.reverse();
            let allOk = sortedSource.every((a, index) => a.id === result[index].id);
            assert.ok(allOk, 'reverse ok');
            done();
        });
    });

    it('desc for nested',function (done){
        let source = getSource();
        memset(source).get(order('nested.id', 'desc')).then((result) => {
            assert.isArray(result);
            assert.equal(source.length, result.length);
            let sortedSource = source.reverse();
            let allOk = sortedSource.every((a, index) => a.id === result[index].id);
            assert.ok(allOk, 'reverse ok');
            done();
        });
    });

    it('desc for date', function (done) {
        let source = getSource();
        memset(source).get(order('date', 'desc')).then((result) => {
            assert.isArray(result);
            assert.equal(source.length, result.length);
            let sortedSource = source.reverse();
            let allOk = sortedSource.every((a, index) => a.id === result[index].id);
            assert.ok(allOk, 'reverse ok');
            done();
        });
    });

    it('asc 1 for string', function (done) {
        let source = getSource();
        memset(source).get(order('name', 'asc')).then((result) => {
            assert.isArray(result);
            assert.equal(source.length, result.length);
            let allOk = source.every((a, index) => a.id === result[index].id);
            assert.ok(allOk, 'reverse ok');
            done();
        });
    });

    it('asc 1 for int', function (done) {
        let source = getSource();
        memset(source).get(order('id', 'asc')).then((result) => {
            assert.isArray(result);
            assert.equal(source.length, result.length);
            let allOk = source.every((a, index) => a.id === result[index].id);
            assert.ok(allOk, 'reverse ok');
            done();
        });
    });

    
    it('asc 1 for date', function (done) {
        let source = getSource();
        memset(source).get(order('date', 'asc')).then((result) => {
            assert.isArray(result);
            assert.equal(source.length, result.length);
            let allOk = source.every((a, index) => a.id === result[index].id);
            assert.ok(allOk, 'reverse ok');
            done();
        });
    });

    it('asc 2 for string', function (done) {
        let source = getSource();
        memset(source.reverse()).get(order('name', 'asc')).then((result) => {
            assert.isArray(result);
            assert.equal(source.length, result.length);
            let allOk = source.reverse().every((a, index) => a.id === result[index].id);
            assert.ok(allOk);
            done();
        });
    });

    it('asc 2 for int', function (done) {
        let source = getSource();
        memset(source.reverse()).get(order('id', 'asc')).then((result) => {
            assert.isArray(result);
            assert.equal(source.length, result.length);
            let allOk = source.reverse().every((a, index) => a.id === result[index].id);
            assert.ok(allOk);
            done();
        });
    });


    
    it('asc 2 for date', function (done) {
        let source = getSource();
        memset(source.reverse()).get(order('date', 'asc')).then((result) => {
            assert.isArray(result);
            assert.equal(source.length, result.length);
            let allOk = source.reverse().every((a, index) => a.id === result[index].id);
            assert.ok(allOk);
            done();
        });
    });

    it('default is desc for string',function (done){
        let source = getSource();
        memset(source).get(order('name')).then((result) => {
            assert.isArray(result);
            assert.equal(source.length, result.length);
            let allOk = source.reverse().every((a, index) => a.id === result[index].id);
            assert.ok(allOk);
            done();
        }).catch(done);
    });

    it('default is desc for int',function (done){
        let source = getSource();
        memset(source).get(order('id')).then((result) => {
            assert.isArray(result);
            assert.equal(source.length, result.length);
            let allOk = source.reverse().every((a, index) => a.id === result[index].id);
            assert.ok(allOk);
            done();
        }).catch(done);
    });

    it('default is desc for date',function (done){
        let source = getSource();
        memset(source).get(order('date')).then((result) => {
            assert.isArray(result);
            assert.equal(source.length, result.length);
            let allOk = source.reverse().every((a, index) => a.id === result[index].id);
            assert.ok(allOk);
            done();
        }).catch(done);
    });
});
