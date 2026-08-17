export interface DeletionRequest{id:string;userId:string;scopes:string[];status:'requested'|'processing'|'completed'|'blocked';requestedAt:string;completedAt?:string;reason?:string;}
