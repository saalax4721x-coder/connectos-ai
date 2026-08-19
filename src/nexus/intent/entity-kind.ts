export type IntentEntityKind = 'person'|'company'|'location'|'industry'|'skill'|'product'|'event'|'capital'|'project';
export interface IntentEntity { kind:IntentEntityKind; value:string; confidence:number; }
