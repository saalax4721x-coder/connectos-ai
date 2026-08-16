export type FollowupPriority='low'|'normal'|'high'|'critical';
export interface Followup{id:string;personId:string;dueAt:string;priority:FollowupPriority;summary:string;status:'open'|'done'|'snoozed';}
