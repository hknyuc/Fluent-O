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


describe("lazy", function () {
    let self = this;
    describe("select", function () {
        it("single", function (done) {
            memset.get(self.createArray(), select("id")).then((result) => {
                assert.equal(Array.isArray(result), true);
                assert.notEqual(result.length, null);
                assert.notEqual(result.length, 0);
                assert.equal(result.every((elem) => elem.name == null), true);
                assert.equal(result.every((elem) => elem.id != null), true);
                done();
            });
        });

        it("it works with object", function (done) {
            memset.get(self.createArray()[1], select("id")).then((result) => {
                assert.equal(result != null, true);
                assert.equal(result.id != null, true);
                assert.equal(result.id, 1);
                assert.equal(result.name, null);
                done();
            });
        });

        it("select more property", function (done) {
            memset.get(self.createArray(), select("id", "name")).then((result) => {
                assert.equal(Array.isArray(result), true);
                assert.notEqual(result.length, 0);
                assert.equal(result.every((item) => item.id != null && item.name != null), true);
                done();
            });
        });

        it("select nested property single", function (done) {
            memset.get(self.createArray(), select("location.id")).then((result) => {
                assert.equal(Array.isArray(result), true);
                assert.notEqual(result.length, 0);
                assert.equal(result.every((item) => item.location != null), true);
                assert.equal(result.every((item) => item.location.id != null), true);
                done();
            });
        });

        it("select nested property more than", function (done) {
            memset.get(self.createArray(), select("location.id", "location.code")).then((result) => {
                assert.equal(Array.isArray(result), true);
                assert.notEqual(result.length, 0);
                assert.equal(result.every((item) => item.location != null), true);
                assert.equal(result.every((item) => item.location.id != null && item.location.code != null), true);
                done();
            });
        });
        it("select nested property and root property", function (done) {
            memset.get(self.createArray(), select("location.id", "location.code", "id")).then((result) => {
                assert.equal(Array.isArray(result), true);
                assert.notEqual(result.length, 0);
                assert.equal(result.every((item) => item.location != null), true);
                assert.equal(result.every((item) => item.location.id != null && item.location.code != null && item.location.id != null), true);
                done();
            });
        });
        it("select nested 3th property and root property", function (done) {
            memset.get(self.createArray(), select("location.id", "location.code", "location.route.id", "id")).then((result) => {
                assert.equal(Array.isArray(result), true);
                assert.notEqual(result.length, 0);
                assert.equal(result.every((item) => item.location != null), true);
                assert.equal(result.every((item) => item.location.id != null &&
                    item.location.code != null &&
                    item.location.id != null &&
                    item.location.route != null &&
                    item.location.route.id != null), true);
                done();
            });
        });
        it("select nested -n property and root property", function (done) {
            memset.get(self.createArray(), select("location.id", "location.code", "location.route.id", "id", "location.route.option", "location.route.option.enable"))
                .then((result) => {
                    assert.equal(Array.isArray(result), true);
                    assert.notEqual(result.length, 0);
                    assert.equal(result.every((item) => item.location != null), true);
                    assert.equal(result.every((item) => item.location.id != null &&
                        item.location.code != null &&
                        item.location.id != null &&
                        item.location.route != null &&
                        item.location.route.id != null &&
                        item.location.route.option != null &&
                        item.location.route.option.enable != null), true);
                    done();
                });
        });

    });

    describe("top", function () {
        it("single", function (done) {
            memset.get(self.createArray(), top(1)).then((result) => {
                assert.equal(Array.isArray(result), true);
                assert.equal(result.length, 1);
                done();
            });
        });

        it("parameter is string", function (done) {
            memset.get(self.createArray(), top("1")).then((result) => {
                assert.equal(Array.isArray(result), true);
                assert.equal(result.length, 1);
                done();
            });
        });
    });


    describe("skip", function () {
        it("single", function (done) {
            memset.get(self.createArray(), skip(1)).then((result) => {
                assert.equal(Array.isArray(result), true);
                assert.equal(self.createArray().length, result.length + 1);
                done();
            });
        });
        it("more than skip", function (done) {
            memset.get(self.createArray(), skip(1), skip(2)).then((result) => {
                assert.equal(Array.isArray(result), true);
                assert.equal(self.createArray().length, result.length + 3);
                done();
            });
        });
    });


    describe("find", function () {
        it("single", function (done) {
            memset.get(self.createArray(), find(1)).then((result) => {
                assert.equal(result != null, true);
                assert.equal(result.id != null, true);
                assert.equal(result.id, 1);
                done();
            });
        });

        it("single with expression", function (done) {
            memset.get(self.createArray(), find(1), select("id")).then((result) => {
                assert.equal(result != null, true);
                assert.equal(result.id != null, true);
                assert.equal(result.id, 1);
                assert.equal(result.name, null);
                done();
            });
        });
        it("single with expression if value object", function (done) {
            memset.get(self.createArray(), find({ id: 1 }), select("id")).then((result) => {
                assert.equal(result != null, true);
                assert.equal(result.id != null, true);
                assert.equal(result.id, 1);
                assert.equal(result.name, null);
                done();
            });
        });
    });

    describe("filter", function () {
        it("single", function (done) {
            memset.get(self.createArray(), filter(prop("id").eq(1))).then((result) => {
                assert.equal(Array.isArray(result), true);
                assert.equal(result.length, 1);
                done();
            });
        });

        it("two binary [ge,eq]", function (done) {
            memset.get(self.createArray(), filter(prop("id").ge(1).and(prop("state").eq("even")))).then((result) => {
                assert.equal(Array.isArray(result), true);
                assert.equal(result.length, 1);
                done();
            });
        });

        it("three binary]ge,eq,or,and]", function (done) {
            memset.get(self.createArray(), filter(prop("id").ge(1).and(prop("state").eq("even").or(prop("state").eq("odd"))))).then((result) => {
                assert.equal(Array.isArray(result), true);
                assert.equal(result.length, 3);
                done();
            });
        });

    });

    describe("order", function () {
        it("single desc", function (done) {
            memset.get(self.createArray(), order("id", "desc")).then((result) => {
                let reversed = self.createArray().reverse();
                assert.equal(result.length, reversed.length);
                assert.equal(result.every((elem, index) => {
                    if (elem.id != reversed[index].id) return false;
                    return true;
                }), true);
                done();
            });
        });

        it("single asc", function (done) {
            memset.get(self.createArray().reverse(), order("id", "asc")).then((result) => {
                let reversed = self.createArray();
                assert.equal(result.length, reversed.length);
                assert.equal(result.every((elem, index) => {
                    if (elem.id != reversed[index].id) return false;
                    return true;
                }), true);
                done();
            });
        });

        it("single not type is default asc", function (done) {
            memset.get(self.createArray().reverse(), order("id", "asc")).then((result) => {
                let reversed = self.createArray();
                assert.equal(result.length, reversed.length);
                assert.equal(result.every((elem, index) => {
                    if (elem.id != reversed[index].id) return false;
                    return true;
                }), true);
                done();
            });
        });

        it("more than order support", function (done) {
            memset.get(self.createArray().reverse(), order("id", "asc"), order("id", "desc"))
                .then((result) => {
                    let reversed = self.createArray().reverse();
                    assert.equal(result.length, reversed.length);
                    assert.equal(result.every((elem, index) => {
                        if (elem.id != reversed[index].id) return false;
                        return true;
                    }), true);
                    done();
                });
        });

        it("support nested property in order", function (done) {
            memset.get(self.createArray(), order("location.id", "desc")).then((result) => {
                let reversed = self.createArray().reverse();
                assert.equal(result.length, reversed.length);
                assert.equal(result.every((elem, index) => {
                    if (elem.location.id != reversed[index].location.id) return false;
                    return true;
                }), true);
                done();
            });
        });
    });
    
        describe("selectMany", function () {
            it("single in filter", function (done) {
                memset.get(self.createArray(), filter($it.selectMany("users").count().eq(3))).then((result) => {
                    assert.equal(Array.isArray(result), true);
                    assert.equal(result.length, 1);
                    done();
                });
            });
    
            it("nested array-object", function (done) {
                memset.get(self.createArray(), find(2), selectMany("users/age")).then((result) => {
                    assert.equal(Array.isArray(result), true);
                    assert.equal(result.length, 3);
                    done();
                });
            });
    
            it("with property in filter", function (done) {
                memset.get(self.createArray(), filter(prop("company").selectMany("phones").count().eq(2))).then((result) => {
                    assert.equal(Array.isArray(result), true);
                    assert.equal(result.length, 1);
                    memset.get(self.createArray(), filter(prop("company").selectMany("phones").count().eq(1))).then((result2) => {
                        assert.equal(result2, 0);
                        done();
                    });
                });
            });
    
            it("complex example 1", function (done) {
                memset.get(self.createArray(), filter(prop("company").selectMany("phones").count().eq(prop("users").count()))).then((result) => {
                    assert.equal(Array.isArray(result), true);
                    assert.equal(result.length, 1);
                    done();
                });
            });
            it("complex example 2", function (done) {
                memset.get(self.createArray(), filter(prop("company").selectMany("phones").count().gt(prop("users").count()))).then((result) => {
                    assert.equal(Array.isArray(result), true);
                    assert.equal(result.length, 2);
                    done();
                });
            });
    
            it("complex example 3", function (done) {
                memset.get(self.createArray(), filter(prop("company").selectMany("phones").count().eq($root.count()))).then((result) => {
                    assert.equal(Array.isArray(result), true);
                    assert.equal(result.length, 1);
                    done();
                });
            });
         /*
            it("complex example 4", function (done) {
                memset.get(self.createArray(), find(3), selectMany("fields"), filter($it.contains("2"))).then((result) => {
                    assert.equal(Array.isArray(result), true);
                    assert.equal(result.length, 1);
                    done();
                });
            });
            */
    
        });
        

    describe("expand", function () {
        it("single", function (done) {
            let source = self.createArray();
            memset.get(source, expand("users")).then((result) => {
                assert.equal(Array.isArray(result), true);
                assert.equal(result.every((elem, index) => elem.users == source[index].users), true);
                done();
            });
        });

        it("filter 1", function (done) {
            let source = self.createArray();
            memset.get(source, expand("users", filter(prop("id").gt(2)))).then((result) => {
                assert.equal(source.length, result.length);
                assert.equal(result.every((elem) => elem.users.every((user) => user.id > 2)), true);
                done();
            });
        });

        it("filter 2", function (done) {
            let source = self.createArray();
            memset.get(source, expand("users", filter(prop("id").lt(2)))).then((result) => {
                assert.equal(source.length, result.length);
                assert.equal(result.every((elem) => elem.users.every((user) => user.id < 2)), true);
                done();
            });
        });

        it("filter with select", function (done) {
            let source = self.createArray();
            assert.equal(Array.isArray(source), true);
            assert.notEqual(source.length, 0);
            memset.get(source, expand("users", filter(prop("id").gt(2)), select("id"))).then((result) => {
                assert.equal(source.length, result.length);
                assert.equal(result.filter((elem) => elem.users.length === 0).length, 3);
                assert.equal(result.filter((elem) => elem.users.length !== 0).length, 1);
                assert.true(result.every((elem) => elem.users.every((user) => self.onlyContains(user, "id")))); // only i
                done();
            });
        });

        it('expand lazy property',function (done){
            let obj  = {
                id:'5',
                name:mem([{id:'5',name:'5'},{'id':6,name:'9'}]).query(find({id:'5'}))
            }

            memset.get([obj],expand('name')).then((result)=>{
                console.log({name:result.name});
                done();
            });
        })


    });

    describe("count", function () {
        it("single", function (done) {
            let source = self.createArray();
            memset.get(source, count()).then((result) => {
                assert.equal(result, source.length);
                done();
            });
        });
    });




    this.onlyContains = function (obj, ...params) {
        return Object.keys(obj)
            .every((elem) => params.some((t) => t === elem));
    }

    this.notContains = function (obj, ...params) {
        return Object.keys(obj)
            .every((elem) => params.some((t) => t !== elem));
    }

    this.timesMap = function (number, fn) {
        let result = [];
        for (let i = 0; i < number; i++) {
            result.push(fn(i));
        }
        return result;
    }

    this.getRandom = function (number) {
        return Math.floor(Math.random() * number);
    }

    this.createArray = function () {
        return self.timesMap(4, i => {
            return {
                id: i,
                name: "test" + i,
                state: i % 2 == 0 ? "even" : "odd",
                fields: self.timesMap(i, (f) => "fields_" + f),
                company: {
                    phones: self.timesMap(i * 2, (p) => p)
                },
                users: self.timesMap(i + 1, (x) => {
                    return {
                        id: x,
                        name: "user_" + x,
                        age: 100 - i * x,
                        numbers: self.timesMap(i, (y) => y)
                    }
                }),
                location: {
                    id: i,
                    code: "code_" + i,
                    route: {
                        id: i,
                        option: {
                            enable: true
                        }
                    }
                }
            }
        });
    }
});