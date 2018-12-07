"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HttpResponse {
    constructor(responseText, headers, status) {
        this.responseText = responseText;
        this.headers = headers;
        this.status = status;
    }
    get isSuccess() {
        return this.status >= 200 && this.status < 300;
    }
    json() {
        if (this.responseText === null || this.responseText === "")
            return this.responseText;
        return JSON.parse(this.responseText);
    }
}
exports.HttpResponse = HttpResponse;
class RestClient {
    constructor(creator) {
        this.creator = creator;
        this.headers = {};
        this.pipes = [];
    }
    /**
     * manipules Response
     */
    pipe(fn) {
        this.pipes.push(fn);
        return this;
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
            return Object.assign({}, this.headers);
        return Object.assign(Object.assign({}, this.headers), headers);
    }
    invokePipe(response) {
        let result = response;
        this.pipes.forEach((fn) => {
            result = fn(this, result);
        });
        return result;
    }
    create(method, url, data, headers) {
        let self = this;
        return new Promise((resolve, reject) => {
            let xhttp = '';
            if (this.creator != null)
                xhttp = this.creator.create();
            try {
                xhttp.open(method, url, true);
                let cloneHeader = this.cloneHeaderOrEmpty(headers);
                for (let i in cloneHeader) {
                    xhttp.setRequestHeader(i, cloneHeader[i]);
                }
                xhttp.timeout = 240000; // 4dk
                xhttp.ontimeout = function (e) {
                    // XMLHttpRequest timed out. Do something here.
                    reject(self.invokePipe(new HttpResponse("Request Timeout", self.getHeaders(this.getAllResponseHeaders()), this.status)));
                };
                xhttp.onreadystatechange = function () {
                    if (this.readyState != 4)
                        return;
                    if (this.status >= 200 && this.status < 300) {
                        resolve(self.invokePipe(new HttpResponse(this.responseText, self.getHeaders(this.getAllResponseHeaders()), this.status)));
                        return;
                    }
                    reject(self.invokePipe(new HttpResponse(this.responseText, self.getHeaders(this.getAllResponseHeaders()), this.status)));
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
class TrackingClient extends RestClient {
    constructor(restClient, logger) {
        super(restClient.creator);
        this.restClient = restClient;
        this.logger = logger;
    }
    calculateTimeString(interval) {
        let minutes = Math.floor(interval / 60000);
        let seconds = parseInt(((interval % 60000) / 1000).toFixed(0));
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    }
    create(method, url, data, headers) {
        let now = Date.now();
        return this.logger.info({
            "id": now,
            "type": "request",
            [method]: {
                url,
                data,
                headers
            }
        }).then(() => {
            return this.restClient.create(method, url, data, headers).then((response) => {
                return this.logger.info({
                    "id": now,
                    "type": "response",
                    time: this.calculateTimeString(Date.now() - now),
                    [method]: {
                        url,
                        data,
                        headers,
                        response
                    }
                }).then(() => {
                    return response;
                });
            }, (errors) => {
                return this.logger.error({
                    "id": now,
                    "type": "error",
                    time: this.calculateTimeString(Date.now() - now),
                    [method]: {
                        url,
                        data,
                        headers,
                        errors
                    }
                }).then(() => {
                    return errors;
                });
            });
        });
    }
}
exports.TrackingClient = TrackingClient;
//# sourceMappingURL=RestClient.js.map