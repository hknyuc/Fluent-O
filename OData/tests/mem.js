var assert = require('assert');
var memset = require('../memArray').MemSet;
var schema = require('../Schema');
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

describe("memArray",function(){
    let self = this;
    describe("select",function (){
        it("single",function(){
            let result =  memset.get(self.createArray(),select("id"));
            assert.equal(Array.isArray(result),true);
            assert.notEqual(result.lenght,0);
            assert.equal(result.every((elem)=>elem.name == null),true);
            assert.equal(result.every((elem)=>elem.id != null),true);
        });

        it("it works with object",function (){
            let result = memset.get(self.createArray()[1],select("id"));
            assert.equal(result != null,true);
            assert.equal(result.id != null,true);
            assert.equal(result.id,1);
            assert.equal(result.name,null);
        });

        it("select more property",function (){
            let result =  memset.get(self.createArray(),select("id","name"));
            assert.equal(Array.isArray(result),true);
            assert.notEqual(result.length,0);
            assert.equal(result.every((item)=>item.id != null && item.name != null),true);
        });

        it("select nested property single",function (){
            let result = memset.get(self.createArray(),select("location.id"));
            assert.equal(Array.isArray(result),true);
            assert.notEqual(result.length,0);
            assert.equal(result.every((item)=>item.location != null),true);
            assert.equal(result.every((item)=>item.location.id != null),true);
        });

        it("select nested property more than",function (){
            let result = memset.get(self.createArray(),select("location.id","location.code"));
            assert.equal(Array.isArray(result),true);
            assert.notEqual(result.length,0);
            assert.equal(result.every((item)=>item.location != null),true);
            assert.equal(result.every((item)=>item.location.id != null && item.location.code != null),true);
        });
        it("select nested property and root property",function (){
            let result = memset.get(self.createArray(),select("location.id","location.code","id"));
            assert.equal(Array.isArray(result),true);
            assert.notEqual(result.length,0);
            assert.equal(result.every((item)=>item.location != null),true);
            assert.equal(result.every((item)=>item.location.id != null && item.location.code != null && item.location.id != null),true);
        });
        it("select nested 3th property and root property",function (){
            let result = memset.get(self.createArray(),select("location.id","location.code","location.route.id","id"));
            assert.equal(Array.isArray(result),true);
            assert.notEqual(result.length,0);
            assert.equal(result.every((item)=>item.location != null),true);
            assert.equal(result.every((item)=>item.location.id != null &&
             item.location.code != null && 
             item.location.id != null && 
             item.location.route != null && 
             item.location.route.id != null),true);
        });
        it("select nested -n property and root property",function (){
            let result = memset.get(self.createArray(),select("location.id","location.code","location.route.id","id","location.route.option","location.route.option.enable"));
            assert.equal(Array.isArray(result),true);
            assert.notEqual(result.length,0);
            assert.equal(result.every((item)=>item.location != null),true);
            assert.equal(result.every((item)=>item.location.id != null &&
             item.location.code != null && 
             item.location.id != null && 
             item.location.route != null && 
             item.location.route.id != null &&
            item.location.route.option != null &&
            item.location.route.option.enable != null),true);
        });
    });

    describe("top",function (){
         it("single",function (){
            let result  = memset.get(self.createArray(),top(1));
            assert.equal(Array.isArray(result),true);
            assert.equal(result.length,1);
         });

         it("parameter is string",function (){
            let result  = memset.get(self.createArray(),top("1"));
            assert.equal(Array.isArray(result),true);
            assert.equal(result.length,1);
         });
    });

    describe("skip",function (){
         it("single",function (){
            let result  = memset.get(self.createArray(),skip(1));
            assert.equal(Array.isArray(result),true);
            assert.equal(self.createArray().length,result.length +1);
         });
         it("more than skip",function (){
            let result  = memset.get(self.createArray(),skip(1),skip(2));
            assert.equal(Array.isArray(result),true);
            assert.equal(self.createArray().length,result.length + 3);
         });
    });

    describe("find",function (){
      it("single",function(){
         let result = memset.get(self.createArray(),find(1));
         assert.equal(result != null,true);
         assert.equal(result.id != null,true);
         assert.equal(result.id,1);
      });

      it("single with expression",function (){
        let result = memset.get(self.createArray(),find(1),select("id"));
        assert.equal(result != null,true);
        assert.equal(result.id != null,true);
        assert.equal(result.id,1);
        assert.equal(result.name,null);
      });
    });

    describe("order",function(){
        it("single desc",function (){
          let result = memset.get(self.createArray(),order("id","desc"));
          let reversed = self.createArray().reverse();
          assert.equal(result.length,reversed.length);
          assert.equal(result.every((elem,index)=>{
             if(elem.id != reversed[index].id) return false;
             return true;
          }),true);
        });

        it("single asc",function (){
            let result = memset.get(self.createArray().reverse(),order("id","asc"));
            let reversed = self.createArray();
            assert.equal(result.length,reversed.length);
            assert.equal(result.every((elem,index)=>{
               if(elem.id != reversed[index].id) return false;
               return true;
            }),true);
        });

        it("single not type is default asc",function (){
            let result = memset.get(self.createArray().reverse(),order("id","asc"));
            let reversed = self.createArray();
            assert.equal(result.length,reversed.length);
            assert.equal(result.every((elem,index)=>{
               if(elem.id != reversed[index].id) return false;
               return true;
            }),true);
        });

        it("more than order support",function (){
            let result = memset.get(self.createArray().reverse(),order("id","asc"),order("id","desc"));
            let reversed = self.createArray().reverse();
            assert.equal(result.length,reversed.length);
            assert.equal(result.every((elem,index)=>{
               if(elem.id != reversed[index].id) return false;
               return true;
            }),true);
        });

        it("support nested property in order",function (){
            let result = memset.get(self.createArray(),order("location.id","desc"));
            let reversed = self.createArray().reverse();
            assert.equal(result.length,reversed.length);
            assert.equal(result.every((elem,index)=>{
               if(elem.location.id != reversed[index].location.id) return false;
               return true;
            }),true);
        });

        it("order support only array",function(){
            try{
            memset.get(self.createArray()[0],order("location.id","desc"));
            assert.fail("only array"); 
            }catch(ex){
                assert.ok(ex.message);
            }
        });
    });

    describe("selectMany",function(){
       it("single in filter",function(){
         let result = memset.get(self.createArray(),filter($it.selectMany("users").count().eq(3)));
          assert.equal(Array.isArray(result),true);
          assert.equal(result.length,1);
       });

       it("nested array-object",function(){
         let result = memset.get(self.createArray(),find(2),selectMany("users/age"));
         assert.equal(Array.isArray(result),true);
         assert.equal(result.length,2);
       });
       

       it("nested all array in filter",function (){
        let result = memset.get(self.createArray(),filter($it.selectMany("users/numbers").count().eq(4)));
        assert.equal(Array.isArray(result),true);
        assert.equal(result.length,1);
       });

       it("with property in filter",function (){
           let result = memset.get(self.createArray(),filter(prop("company").selectMany("phones").count().eq(2)));
           assert.equal(Array.isArray(result),true);
           assert.equal(result.length,1);
           let result2 = memset.get(self.createArray(),filter(prop("company").selectMany("phones").count().eq(1)));
           assert.equal(result2,0);
       });

       it("complex example 1",function (){
          let result = memset.get(self.createArray(),filter(prop("company").selectMany("phones").count().eq(prop("users").count())));
          assert.equal(Array.isArray(result),true);
          assert.equal(result.length,1);
       });
       it("complex example 2",function (){
        let result = memset.get(self.createArray(),filter(prop("company").selectMany("phones").count().gt(prop("users").count())));
        assert.equal(Array.isArray(result),true);
        assert.equal(result.length,3);
       });

       it("complex example 3",function (){
        let result = memset.get(self.createArray(),filter(prop("company").selectMany("phones").count().eq($root.count())));
        assert.equal(Array.isArray(result),true);
        assert.equal(result.length,1);
       });

       it("complex example 4",function (){
        let result = memset.get(self.createArray(),find(3),selectMany("fields"),filter($it.contains("2")));
        assert.equal(Array.isArray(result),true);
        assert.equal(result.length,1);
       });

    });


    describe("filter",function(){
        it("single",function (){
            let result = memset.get(self.createArray(),filter(prop("id").eq(1)));
            assert.equal(Array.isArray(result),true);
            assert.equal(result.length,1);
        });

        it("two binary",function (){
            let result = memset.get(self.createArray(),filter(prop("id").ge(2).and(prop("state").eq("even"))));
            assert.equal(Array.isArray(result),true);
            assert.equal(result.length,3);
        });
    })

    this.timesMap = function(number,fn){
        let result = [];
        for(let i=0;i<number;i++){
             result.push(fn(i));
        }
        return result;
    }

    this.getRandom = function (number){
        return Math.floor(Math.random()* number);
    }

   this.createArray = function(){
       return  self.timesMap(4,i=>{return{
              id:i,
              name:"test"+i,
              state:i % 2 == 0?"even":"odd",
              fields:self.timesMap(i,(f)=>"fields_"+f),
              company:{
                  phones: self.timesMap(i*2,(p)=>p)
              },
              users:self.timesMap(i,(x)=>{
                  return {
                      id:x,
                      name:"user_"+x,
                      age:100-i*x,
                      numbers:self.timesMap(i,(y)=>y)
                  }
              }),
              location:{
                  id:i,
                  code:"code_"+i,
                  route:{
                      id:i,
                      option:{
                          enable:true
                      }
                  }
              }
          }});
   }
});