"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let easyAssert = {
   use(assert){
    assert.true = function(value){
       return assert.equal(true,value);
    }

    assert.notEmpty = function (value){
        if(value == null)
          return assert.equal(true,value != null);
        if(typeof value === "string")
          return assert.equal(true,value != "" && value != null);
        if(Array.isArray(value))
          return assert.equal(true,value.length !== 0);
        throw new Error("notEmpty :value is not valid for notEmpty function");
    }
   }
}

exports.EasyAssert = easyAssert;