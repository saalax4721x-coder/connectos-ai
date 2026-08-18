export type EntityType = 'person'|'company'|'location'|'industry'|'skill'|'unknown';

export interface IntentEntity { value:string; type:EntityType; confidence:number; }

export function createEntity(value:string,type:EntityType,confidence:number):IntentEntity{
 return {value,type,confidence};
}
