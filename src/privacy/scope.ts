export type PrivacyScope='public'|'network'|'team'|'private';
export interface PrivacyPolicy{ownerId:string;field:string;scope:PrivacyScope;shareWithAgents:boolean;}
