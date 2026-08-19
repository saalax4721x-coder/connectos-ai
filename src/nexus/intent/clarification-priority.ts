export interface ClarificationPriority { question:string; impact:number; blocking:boolean; }
export function rankClarifications(items:ClarificationPriority[]):ClarificationPriority[] { return [...items].sort((a,b)=>Number(b.blocking)-Number(a.blocking) || b.impact-a.impact); }
