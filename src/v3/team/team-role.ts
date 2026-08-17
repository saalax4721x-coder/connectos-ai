export type TeamRole='owner'|'admin'|'member'|'viewer'; export interface TeamMember{userId:string;role:TeamRole;joinedAt:string;}
