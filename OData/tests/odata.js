var assert = require('assert');
var odata = require('../OData');
var schema = require('../Schema');
var QuerySet = odata.QuerySet;
var operations = require('../Operations');
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
    describe('select', function () {
        it("only", function () {
            let result = QuerySet.get(select('ID'));
            assert.equal(result,'$select=ID');
        });

        it('series', function () {
            let result = QuerySet.get(select('ID', 'NAME'));
            assert.equal(result,'$select=ID,NAME');
        });

        it('nested', function () {
            let result = QuerySet.get(select('COMPANY.NAME', 'NAME'));
            assert.equal(result,'$select=COMPANY.NAME,NAME');
        });


        it('select with expression',function (){
           let result = QuerySet.get(select('Customers',filter($root.eq(5))));
           assert.equal(result,'$select=Customers($filter=$root eq 5)');
        });

        it('select with with expression 2',function (){
            let result = QuerySet.get(select('Customers',filter($root.selectMany('People').eq(5))));
            assert.equal(result,'$select=Customers($filter=$root/People eq 5)');
        });

        it('select with with expression 3',function (){
            let result = QuerySet.get(select('Customers',filter($root.selectMany('People/Names').eq(5))));
            assert.equal(result,'$select=Customers($filter=$root/People/Names eq 5)');
        });

        it('more than one select are converted one',function (){
            let result = QuerySet.get(select('ID','NAME'),select('VALUE'));
            assert.equal(result,'$select=ID,NAME,VALUE');
        });

        it('more than one select are converted one2',function (){
            let result = QuerySet.get(select('Customers',filter($root.selectMany('People').eq(5))),select('VALUE'));
            assert.equal(result,'$select=Customers($filter=$root/People eq 5),VALUE');
        })
    });

    describe('filter', function () {
        describe('operations', function () {
            describe('types', function () {
                it('eq int', function () {
                    let result = QuerySet.get(filter(prop('ID').eq(5)));
                    assert.equal(result,'$filter=ID eq 5');
                });

                it('ne int', function () {
                    let result = QuerySet.get(filter(prop('ID').ne(5)));
                    assert.equal(result,'$filter=ID ne 5');
                });

                it('eq string', function () {
                    let result = QuerySet.get(filter(prop('ID').eq('hakan')));
                    assert.equal(result,"$filter=ID eq 'hakan'");
                });

                it('eq date', function () {
                    let date = new Date();
                    let result = QuerySet.get(filter(prop('ID').eq(date)));
                    assert.equal(result,"$filter=ID eq d'" + date + "'");
                });

                it('eq guid', function () {
                    let guid = Guid.new();
                    let result = QuerySet.get(filter(prop('ID').eq(guid)));
                    assert.equal(result,"$filter=ID eq g'" + guid + "'");
                });

                it('prop must string', function () {
                    try {
                        prop(5);
                    } catch (ex) {
                        assert.ok(ex);
                    }
                });

                it('prop could not null', function () {
                    try {
                        prop();
                    } catch (ex) {
                        assert.ok(ex);
                    }
                });

            
            });

            describe('multi', function () {
                it('eq-or-eq', function () {
                    let result = QuerySet.get(filter(prop('ID').eq(5).or(prop('ID').eq(7))));
                    assert.equal(result,"$filter=ID eq 5 or ID eq 7");
                });

                it('eq-or-ne', function () {
                    let result = QuerySet.get(filter(prop('ID').eq(5).or(prop('ID').ne(4))));
                    assert.equal(result,"$filter=ID eq 5 or ID ne 4");
                });

                it('eq-or-ne-and-eq', function () {
                    let result = QuerySet.get(filter(prop('ID').eq(5).or(prop('ID').ne(4)).and(o('ID', 'eq', 4))));
                    assert.equal(result,"$filter=ID eq 5 or ID ne 4 and ID eq 4");
                });
            });
        });

        describe('properties',function (){
            it('more than one filter are converted one',function (){
               let result = QuerySet.get(filter(prop('ID').eq(5)),filter(prop('NAME').eq('Hakan')));
               assert.equal(result,"$filter=ID eq 5 or NAME eq 'Hakan'");
            });
        });
    });

    describe('find',function (){
        it('single',function (){
            let result = QuerySet.get(find('5'));
            assert.equal(result,"('5')");
        });

        it('multi',function (){
            let result = QuerySet.get(find({id:5,value:'Test'}));
            assert.equal(result,"(id=5,value='Test')");
        });
    })

    describe('order', function () {
        it('single', function () {
            let result = QuerySet.get(order('ID'));
            assert.equal(result,'$orderby=ID');
        });

        it('asc', function () {
            let result = QuerySet.get(order('ID', 'asc'));
            assert.equal(result,'$orderby=ID asc');
        });

        it('desc', function () {
            let result = QuerySet.get(order('ID', 'desc'));
            assert.equal(result,'$orderby=ID desc');
        });

        it('more than one order are converted one',function (){
            let result = QuerySet.get(order('ID'),order('NAME'));
            assert.equal(result,'$orderby=NAME');
        })

        it('argument is not string throw exception', function () {
            try {
                QuerySet.get(order('ID', 5));
            } catch (ex) {
                assert.ok('throwns exception');
            }
        });

        it('argument propery is not string throw exception', function () {
            try {
                QuerySet.get(order(5, 'desc'));
            } catch (ex) {
                assert.ok(JSON.stringify(ex));
            }
        });
    });

    describe('top', function () {
        it('single', function () {
            let result = QuerySet.get(top(5));
            assert.equal(result,'$top=5');
        });

        it('argument not null', function () {
            try {
                QuerySet.get(top());
            } catch (ex) {
                assert.ok(ex);
            }
        });

        it('argument only number', function () {
            try {
                QuerySet.get(top('5'));
            } catch (ex) {
                assert.ok(ex);
            }
        });
    });

    describe('skip', function () {
        it('single', function () {
            let result = QuerySet.get(skip(5));
            assert.equal(result,'$skip=5');
        });

        it('argument could not null', function () {
            try {
                QuerySet.get(skip());
            } catch (ex) {
                assert.ok(ex);
            }
        });

        if ('argument only number', function () {
            try {
                QuerySet.get(skip('5'));
            } catch (ex) {
                assert.ok(ex);
            }
        });
    });

    describe('expand', function () {
        it('single', function () {
            let result = QuerySet.get(expand('Customers'));
            assert.equal(result,'$expand=Customers');
        });

        it('supports two entities',function (){
          let result = QuerySet.get(expand('Customers,Personnels'));
          assert.equal(result,'$expand=Customers,Personnels');
        });

        it('supports nested query : select',function (){
           let result = QuerySet.get(expand('Customers',select('ID')));
           assert.equal(result,'$expand=Customers($select=ID)');
        });

        it('supports nested query: filter',function (){
           let result = QuerySet.get(expand('Customers',filter(prop('ID').eq(5))));
           assert.equal(result,'$expand=Customers($filter=ID eq 5)');
        });

        it('supports nested multi query: filter,select',function (){
           let result = QuerySet.get(expand('Customers',
               filter(prop('ID').eq(5)),
               select('ID','NAME')));
            assert.equal(result,'$expand=Customers($filter=ID eq 5;$select=ID,NAME)');
        });

        it('supports nested multi query: filter,select,top',function (){
            let result = QuerySet.get(expand('Customers',
            filter(prop('ID').eq(5)),
            select('ID','NAME'),
            top(5)));
         assert.equal(result,'$expand=Customers($filter=ID eq 5;$select=ID,NAME;$top=5)');
        });

        it('more than one expand are converted one',function (){
          let result = QuerySet.get(
              expand('Customers',select('ID','NAME')),
              expand('Products',select('ID','VALUE'))
            );
          assert.equal(result,'$expand=Customers($select=ID,NAME),Products($select=ID,VALUE)');
        });

        it('when argument is null throwns exception', function () {
            try {
                QuerySet.get(expand());
            } catch (ex) {
                assert.ok(ex);
            }
        });
    });

    describe('it',function (){
       it('single',function (){
            let result = QuerySet.get($it.selectMany('Orders/Addres').count().eq(5));
            assert.equal(result,'$it/Orders/Addres/$count eq 5');
       });
    });

    describe('inlineCount',function (){
        it('it works',function (){
           let result = QuerySet.get(inlineCount());
           assert.equal(result,'$inlineCount');
        });
    });

    describe('selectMany',function (){
        it('single',function (){
            let result = QuerySet.get(selectMany('Orders'));
            assert.equal(result,'/Orders');
        });
        it('nested support',function (){
          let result = QuerySet.get(selectMany('Orders/Address'));
          assert.equal(result,'/Orders/Address');
        });
        it('with property owner method',function (){
            let result = QuerySet.get(prop('Orders').selectMany('Address'));
            assert.equal(result,'Orders/Address');
          });

        it('with root',function (){
          let result = QuerySet.get($root.selectMany('Orders'));
          assert.equal(result,'$root/Orders');
        });

        it('more than selectMany support',function (){
            let result0 = $root.selectMany('Orders/Address').eq($it.selectMany('Personnel/Address'));
            let result = QuerySet.get(result0);
            assert.equal(result,'$root/Orders/Address eq $it/Personnel/Address');
        });
    });

    describe('count',function (){
       it('single',function (){
         let result = QuerySet.get(selectMany('Names').count());
         assert.equal(result,'/Names/$count');
       });

       it('eq',function (){
         let result = QuerySet.get(selectMany('Names').count().eq(5));
         assert.equal(result,'/Names/$count eq 5');
       });
    });

    describe('expression examples',function (){
        it('example 1',function (){
          let result = entity('Categories')
                      .get(find(1),selectMany('Products'),top(2),order('Name')).asQuery();
          assert.equal(result,'Categories(1)/Products?$top=2&$orderby=Name');
        });

        it('key single',function (){
           let result = entity('Employees').get(find({ID:'A1245'})).asQuery();
           assert.equal(result,"Employees(ID='A1245')");
        });

        it('keys multi',function (){
          let result = entity('Orders').get(find(1).selectMany('Items').find({OrderID:1,ItemNo:2})).asQuery();
          assert.equal(result,'Orders(1)/Items(OrderID=1,ItemNo=2)');
        });

        it('key multi 2',function (){
           let result = entity('Orders').get(find(1).selectMany('Items').find(2)).asQuery();
           assert.equal(result,'Orders(1)/Items(2)');
        });

        it('filter entity count',function (){
            let result = entity('Categories').get(filter(selectMany('Products').count().eq(5))).asQuery();
            assert.equal(result,'Categories?$filter=Products/$count eq 5');
        });
    });
});