export type MemoryLayer='user'|'relationship'|'company'|'opportunity'|'project'|'deal'|'agent'|'workflow';
export interface Memory{ id:string;layer:MemoryLayer;subjectId:string;content:string;source:string;confidence:number;createdAt:string;expiresAt?:string;}
