"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OData_1 = require("./OData");
const Operations_1 = require("./Operations");
class Context {
    constructor() {
        this.customers = new OData_1.ODataDataSet('url');
    }
    test() {
        this.customers.get(Operations_1.select('ID', 'Name'), Operations_1.filter(Operations_1.prop('ID').lt(5)), Operations_1.order('ID'), Operations_1.expand('Orders', Operations_1.select('ID')))
            .then((response) => {
        });
        this.customers.add({}).then(() => {
        });
    }
}
//# sourceMappingURL=Test.js.map