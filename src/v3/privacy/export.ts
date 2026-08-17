export interface ExportRequest{id:string;userId:string;scopes:string[];status:'queued'|'processing'|'ready'|'failed';createdAt:string;completedAt?:string;}
