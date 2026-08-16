export type SignalType='funding'|'hiring'|'expansion'|'leadership'|'launch'|'acquisition'|'partnership'|'investment'|'event'|'market-entry'|'creator-growth';
export interface Signal{id:string;type:SignalType;entityId:string;source:string;observedAt:string;confidence:number;}
