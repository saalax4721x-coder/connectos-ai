export type SourceKind='public-web'|'professional-profile'|'company-data'|'news'|'event'|'user'|'crm'|'calendar'|'email';
export interface SourceRef{id:string;kind:SourceKind;uri?:string;observedAt:string;retrievedAt:string;}
