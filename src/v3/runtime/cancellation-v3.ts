export interface CancellationTokenV3 { cancelled:boolean; reason?:string; }
export const isCancelled=(t:CancellationTokenV3)=>t.cancelled;
