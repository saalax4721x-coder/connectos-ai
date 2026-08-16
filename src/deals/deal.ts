export type DealStage='discovery'|'qualification'|'proposal'|'negotiation'|'agreement'|'completed'|'cancelled';
export interface Deal{id:string;title:string;participantIds:string[];stage:DealStage;value?:number;currency?:string;updatedAt:string;}
