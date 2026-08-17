export type MemoryScope='user'|'relationship'|'company'|'opportunity'|'project'|'deal'|'agent'|'workflow';
export interface MemoryItem<T=unknown> { id:string; scope:MemoryScope; subjectId:string; value:T; createdAt:string; updatedAt:string; importance:number; sensitivity:'public'|'private'|'restricted'; tags:string[]; }
export interface MemoryQuery { scope:MemoryScope; subjectId:string; tags?:string[]; limit?:number; }
