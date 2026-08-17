export interface Clarification{ id:string; question:string; reason:string; priority:number; resolved?:string; }
export const unresolved=(items:Clarification[])=>items.filter(x=>!x.resolved).sort((a,b)=>b.priority-a.priority);
