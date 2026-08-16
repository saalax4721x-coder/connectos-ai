export interface TraceSpan{id:string;parentId?:string;name:string;startedAt:string;durationMs?:number;status:'ok'|'error';}
