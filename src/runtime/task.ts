export interface Task<T=unknown>{id:string;kind:string;input:T;priority:number;status:'queued'|'running'|'done'|'failed';}
export const task=(id:string,kind:string,input:unknown):Task=>({id,kind,input,priority:0,status:'queued'});
