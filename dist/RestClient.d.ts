import { ILogger } from './logs/ILogger';
export declare class HttpResponse {
    responseText: string;
    headers: {};
    status: number;
    readonly isSuccess: boolean;
    constructor(responseText: string, headers: {}, status: number);
    json(): any;
}
export interface XMLHttpRequestCreator {
    create(): XMLHttpRequest;
}
export declare class RestClient {
    creator?: XMLHttpRequestCreator;
    headers: {};
    private pipes;
    constructor(creator?: XMLHttpRequestCreator);
    /**
     * manipules Response
     */
    pipe(fn: (sender: RestClient, respone: HttpResponse) => void): RestClient;
    get(url: string, headers?: {}): Promise<HttpResponse>;
    post(url: string, data: any, headers?: {}): Promise<HttpResponse>;
    put(url: string, data: any, headers?: {}): Promise<HttpResponse>;
    delete(url: string, headers?: {}): Promise<HttpResponse>;
    private cloneHeaderOrEmpty;
    private invokePipe;
    create(method: string, url: string, data: any, headers: {}): Promise<HttpResponse>;
    private getHeaders;
}
export declare class TrackingClient extends RestClient {
    private restClient;
    private logger;
    constructor(restClient: RestClient, logger: ILogger);
    private calculateTimeString;
    create(method: string, url: string, data: any, headers: any): Promise<any>;
}
