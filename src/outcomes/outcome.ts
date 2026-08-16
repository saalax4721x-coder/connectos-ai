export type OutcomeType='response'|'meeting'|'hire'|'collaboration'|'partnership'|'deal'|'failed'|'dismissed';
export interface Outcome{id:string;opportunityId:string;type:OutcomeType;at:string;value?:number;notes?:string;}
