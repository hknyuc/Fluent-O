"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RestClient_1 = require("./RestClient");
class Http extends RestClient_1.RestClient {
    constructor() {
        super({
            create: function () {
                if (XMLHttpRequest != null) {
                    return new XMLHttpRequest();
                }
            },
        });
    }
}
exports.Http = Http;
