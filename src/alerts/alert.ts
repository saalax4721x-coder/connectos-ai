export type AlertPriority='low'|'normal'|'high'|'critical';
export interface Alert{id:string;userId:string;type:string;priority:AlertPriority;title:string;reason:string;createdAt:string;read:boolean;}
