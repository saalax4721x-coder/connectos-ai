export interface Ambiguity { field:string; reason:string; severity:'low'|'medium'|'high'; }
export function detectAmbiguity(text:string):Ambiguity[] { const result:Ambiguity[]=[]; if(!text.trim()) result.push({field:'goal',reason:'No goal supplied',severity:'high'}); return result; }
