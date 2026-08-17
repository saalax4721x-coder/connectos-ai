export interface CancellationToken{cancelled:boolean;reason?:string}
export const throwIfCancelled=(t:CancellationToken)=>{if(t.cancelled)throw new Error(t.reason??'Execution cancelled');};
