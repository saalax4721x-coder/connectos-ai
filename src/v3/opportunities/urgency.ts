export type Urgency='low'|'medium'|'high'|'critical';
export const urgencyRank=(u:Urgency)=>({low:1,medium:2,high:3,critical:4}[u]);
