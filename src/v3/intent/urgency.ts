export type Urgency='low'|'normal'|'high'|'critical'; export const urgencyWeight=(u:Urgency)=>({low:.25,normal:.5,high:.8,critical:1}[u]);
