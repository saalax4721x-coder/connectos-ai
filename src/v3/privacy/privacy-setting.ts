import type {PrivacyScope} from './privacy-scope'; export interface PrivacySetting{userId:string;scope:PrivacyScope;visibility:'private'|'team'|'connections'|'public';updatedAt:string;}
