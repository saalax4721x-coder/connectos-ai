export interface RuntimeEvent<T=unknown>{type:string;payload:T;at:string;}
export const event=(type:string,payload:unknown):RuntimeEvent=>({type,payload,at:new Date().toISOString()});
