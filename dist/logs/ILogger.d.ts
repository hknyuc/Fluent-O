import { ILogger } from './ILogger';
export interface ILogger {
    info(message: any): Promise<any>;
    error(message: any): Promise<any>;
    warn(message: any): Promise<any>;
}
export declare class ConsoleLogger implements ILogger {
    info(message: any): Promise<any>;
    error(message: any): Promise<any>;
    warn(message: any): Promise<any>;
}
