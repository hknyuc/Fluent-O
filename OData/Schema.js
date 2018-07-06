"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
class Guid {
    constructor(value) {
        this.value = value;
        if (value == null)
            return;
        if (typeof value != "string")
            throw new Error('value is not guid');
    }
    toString() {
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
}
exports.Guid = Guid;
class Float {
}
exports.Float = Float;
//# sourceMappingURL=Schema.js.map