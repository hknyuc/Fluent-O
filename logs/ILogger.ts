import { ILogger } from './ILogger';
export interface ILogger{
    info(message:any):Promise<any>;
    error(message:any):Promise<any>;
    warn(message:any):Promise<any>;
}


export class ConsoleLogger implements ILogger {

    info(message: any): Promise<any> {
        return Promise.resolve(console.info(message));
    }    
    
    
    error(message: any): Promise<any> {
        return Promise.resolve(console.error(message));
    }
    warn(message: any): Promise<any> {
        return Promise.resolve(console.error(message));
    }


}