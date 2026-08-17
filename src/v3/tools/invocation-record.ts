export interface InvocationRecord{id:string;toolId:string;runId:string;input:unknown;startedAt?:string;completedAt?:string;status:'queued'|'running'|'completed'|'failed'|'blocked';approved:boolean;}
