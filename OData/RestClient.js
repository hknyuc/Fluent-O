"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HttpResponse {
    constructor(responseText, headers, status) {
        this.responseText = responseText;
        this.headers = headers;
        this.status = status;
    }
    json() {
        return JSON.parse(this.responseText);
    }
}
exports.HttpResponse = HttpResponse;
class RestClient {
    constructor(creator) {
        this.creator = creator;
    }
    get(url, headers) {
        return this.create('GET', url, null, headers);
    }
    post(url, data, headers) {
        return this.create('POST', url, data, headers);
    }
    put(url, data, headers) {
        return this.create('PUT', url, data, headers);
    }
    delete(url, headers) {
        return this.create('DELETE', url, null, headers);
    }
    cloneHeaderOrEmpty(headers) {
        if (headers == null)
            return {};
        return Object.assign({}, headers);
    }
    create(method, url, data, headers) {
        return new Promise((resolve, reject) => {
            let xhttp = '';
            if (this.creator != null)
                xhttp = this.creator.create();
            let self = this;
            let clone = self.cloneHeaderOrEmpty(headers);
            try {
                xhttp.open(method, url, true);
                for (let i in this.cloneHeaderOrEmpty(headers)) {
                    xhttp.setRequestHeader(i, headers[i]);
                }
                xhttp.onreadystatechange = function () {
                    if (this.readyState != 4)
                        return;
                    if (this.status >= 200 && this.status < 400) {
                        resolve(new HttpResponse(this.responseText, self.getHeaders(this.getAllResponseHeaders()), this.status));
                        return;
                    }
                    reject(new HttpResponse(this.responseText, self.getHeaders(this.getAllResponseHeaders()), this.status));
                };
                xhttp.send(data);
            }
            catch (ex) {
                reject(ex);
                return;
            }
        });
    }
    getHeaders(headers) {
        var arr = headers.trim().split(/[\r\n]+/);
        let headerMap = {};
        arr.forEach(function (line) {
            var parts = line.split(': ');
            var header = parts.shift();
            var value = parts.join(': ');
            headerMap[header] = value;
        });
        return headerMap;
    }
}
exports.RestClient = RestClient;
//# sourceMappingURL=RestClient.js.map