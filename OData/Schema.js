"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Edm;
(function (Edm) {
    Edm[Edm["Null"] = 0] = "Null";
    Edm[Edm["Binary"] = 1] = "Binary";
    Edm[Edm["Boolean"] = 2] = "Boolean";
    Edm[Edm["Byte"] = 3] = "Byte";
    Edm[Edm["DateTime"] = 4] = "DateTime";
    Edm[Edm["Decimal"] = 5] = "Decimal";
    Edm[Edm["Double"] = 6] = "Double";
    Edm[Edm["Single"] = 7] = "Single";
    Edm[Edm["Guid"] = 8] = "Guid";
    Edm[Edm["Int16"] = 9] = "Int16";
    Edm[Edm["Int32"] = 10] = "Int32";
    Edm[Edm["Int64"] = 11] = "Int64";
    Edm[Edm["String"] = 12] = "String";
    Edm[Edm["Time"] = 13] = "Time";
})(Edm = exports.Edm || (exports.Edm = {}));
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
//# sourceMappingURL=Schema.js.map