export interface ErrorEvent { operation:string; code:string; retryable:boolean; timestamp:string; metadata?:Record<string,unknown>; }
