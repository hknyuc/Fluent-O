"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const restclient_1 = require("./restclient");
class Http extends restclient_1.RestClient {
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
