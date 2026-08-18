export type RelationshipEventType='message'|'meeting'|'project'|'introduction'|'shared-event';
export interface RelationshipEvent { type:RelationshipEventType; occurredAt:string; source:string; }
