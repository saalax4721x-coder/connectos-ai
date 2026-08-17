export interface AuditEvent{id:string;actorId:string;action:string;resourceType:string;resourceId:string;at:string;allowed:boolean;reason?:string;metadata?:Record<string,unknown>;}
