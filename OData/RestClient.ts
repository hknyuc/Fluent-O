export class HttpResponse {
    constructor(public responseText: string, public headers: {}, public status: number) {

    }

    json(): any {
        return JSON.parse(this.responseText);
    }
}

export interface XMLHttpRequestCreator {
    create(): XMLHttpRequest;
}
export class RestClient {

    constructor(public creator?: XMLHttpRequestCreator) {

    }
    get(url: string, headers?: {}): Promise<HttpResponse> {
        return this.create('GET', url, null, headers);
    }

    post(url: string, data: any, headers?: {}): Promise<HttpResponse> {
        return this.create('POST', url, data, headers);
    }

    put(url: string, data: any, headers?: {}): Promise<HttpResponse> {
        return this.create('PUT', url, data, headers);
    }


    delete(url: string, headers?: {}): Promise<HttpResponse> {
        return this.create('DELETE', url, null, headers);
    }

    private cloneHeaderOrEmpty(headers) {
        if (headers == null) return {};
        return Object.assign({}, headers);
    }

    public create(method: string, url: string, data: any, headers: {}): Promise<HttpResponse> {
        return new Promise((resolve, reject) => {
            let xhttp = '' as any;
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
                    if (this.readyState != 4) return;
                    if (this.status >= 200 && this.status < 400) {
                        resolve(new HttpResponse(this.responseText, self.getHeaders(this.getAllResponseHeaders()), this.status));
                        return;
                    }
                    reject(new HttpResponse(this.responseText, self.getHeaders(this.getAllResponseHeaders()), this.status));
                }
                xhttp.send(data);
            } catch (ex) {
                reject(ex);
                return;
            }

        });
    }

    private getHeaders(headers) {
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