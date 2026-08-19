import type { Ambiguity } from './ambiguity';
export interface ClarificationQuestion { field:string; question:string; priority:number; }
export function buildClarifications(items:Ambiguity[]):ClarificationQuestion[]{ return items.map((a,i)=>({field:a.field,question:`What should ConnectOS know about ${a.field}?`,priority:items.length-i})); }
