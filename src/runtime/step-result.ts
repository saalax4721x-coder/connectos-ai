export interface StepResult<T=unknown>{status:'ok'|'retry'|'failed'|'blocked'; value?:T; error?:string; next?:string; metadata?:Record<string,unknown>;}
export const ok=<T>(value:T,metadata?:Record<string,unknown>):StepResult<T>=>({status:'ok',value,metadata});
