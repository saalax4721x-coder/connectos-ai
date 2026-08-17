export interface ProjectMilestone{id:string;projectId:string;title:string;taskIds:string[];dueAt?:string;status:'planned'|'active'|'completed'|'blocked';}
