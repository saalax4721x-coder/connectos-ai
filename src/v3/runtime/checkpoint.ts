export interface Checkpoint<T=unknown>{runId:string;stepId:string;createdAt:string;state:T;version:number}
export const nextCheckpoint=<T>(c:Checkpoint<T>,state:T):Checkpoint<T>=>({...c,state,version:c.version+1,createdAt:new Date().toISOString()});
