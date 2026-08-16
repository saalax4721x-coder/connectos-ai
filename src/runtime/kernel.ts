export type RuntimeStatus='idle'|'running'|'paused'|'failed'|'completed';
export interface RuntimeKernel { id:string; status:RuntimeStatus; startedAt:string; }
export const createRuntimeKernel=(id:string):RuntimeKernel=>({id,status:'idle',startedAt:new Date().toISOString()});
