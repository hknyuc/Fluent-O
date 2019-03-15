"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("./core");
/*export enum Edm {
    Null,
    Binary,
    Boolean,
    Byte,
    DateTime,
    Decimal,
    Double,
    Single,
    Guid,
    Int16,
    Int32,
    Int64,
    String,
    Time
}
*/
class Guid {
    constructor(value) {
        this.value = value;
        if (value == null)
            return;
        if (typeof value != "string")
            throw new Error('value is not guid. Please check');
    }
    toString() {
        return this.value;
    }
    valueOf() {
        return this.value;
    }
    static new() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return new Guid(s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4());
    }
    static newString() {
        return this.new().toString();
    }
    static parse(value) {
        if (core_1.Utility.instanceof(value, Guid))
            return value;
        let any = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value);
        if (any)
            return new Guid(value);
        throw new Error(value + " is could not parse for guid");
    }
    static tryParse(value) {
        if (core_1.Utility.instanceof(value, Guid))
            return value;
        let any = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value);
        if (any)
            return new Guid(value);
        return null;
    }
}
exports.Guid = Guid;
class Float {
}
exports.Float = Float;
