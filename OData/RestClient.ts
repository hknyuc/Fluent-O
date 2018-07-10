export class HttpResponse {
    get isSuccess(){
        return this.status >= 200 && this.status< 300;
    }
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
    public headers:{} = {};
    private pipes:Array<Function> = [];
    constructor(public creator?: XMLHttpRequestCreator) {

    }

    /**
     * manipules Response
     */
    pipe(fn:(sender:RestClient,respone:HttpResponse)=>void):RestClient{
       this.pipes.push(fn);
       return this;
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
        if (headers == null) return Object.assign({},this.headers);
        return Object.assign(Object.assign({},this.headers), headers);
    }

    private invokePipe(response:HttpResponse):HttpResponse{
        let result = response;
        this.pipes.forEach((fn)=>{
           result = fn(this,result);
        });
        return result;
    }

    public create(method: string, url: string, data: any, headers: {}): Promise<HttpResponse> {
        let self = this;
        return new Promise((resolve, reject) => {
            let xhttp = '' as any;
            if (this.creator != null)
                xhttp = this.creator.create();
            try {
                xhttp.open(method, url, true);
                let cloneHeader = this.cloneHeaderOrEmpty(headers);
                for (let i in cloneHeader) {
                    xhttp.setRequestHeader(i, cloneHeader[i]);
                }
                xhttp.onreadystatechange = function () {
                    if (this.readyState != 4) return;
                    if (this.status >= 200 && this.status < 300) {
                        resolve(self.invokePipe(new HttpResponse(this.responseText, self.getHeaders(this.getAllResponseHeaders()), this.status)));
                        return;
                    }
                    reject(self.invokePipe(new HttpResponse(this.responseText, self.getHeaders(this.getAllResponseHeaders()), this.status)));
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