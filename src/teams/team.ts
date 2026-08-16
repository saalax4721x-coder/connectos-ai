export type TeamRole='owner'|'admin'|'member'|'viewer';
export interface TeamMember{userId:string;role:TeamRole;joinedAt:string;}
export interface Team{id:string;name:string;members:TeamMember[];sharedNetwork:boolean;sharedCRM:boolean;}
