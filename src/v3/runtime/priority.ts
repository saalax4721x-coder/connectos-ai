export type ExecutionPriority='background'|'normal'|'high'|'urgent';
export const priorityRank=(p:ExecutionPriority)=>({background:1,normal:2,high:3,urgent:4}[p]);
