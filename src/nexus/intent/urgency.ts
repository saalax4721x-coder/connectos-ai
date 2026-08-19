export type Urgency='low'|'normal'|'high'|'critical';
export interface UrgencySignal { level:Urgency; evidence:string[]; confidence:number; }
