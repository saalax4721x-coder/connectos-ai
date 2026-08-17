export class ConnectOSError extends Error{constructor(message:string,readonly code:string,readonly retryable=false){super(message);this.name='ConnectOSError';}}
export const retryable=(message:string,code:string)=>new ConnectOSError(message,code,true);
