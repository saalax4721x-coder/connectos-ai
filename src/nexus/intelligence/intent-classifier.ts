export type IntentDomain='business'|'career'|'investment'|'collaboration'|'unknown';
export interface Classification { domain:IntentDomain; confidence:number; }
export function classifyIntent(text:string):Classification { const t=text.toLowerCase(); const domain=t.includes('investor')?'investment':t.includes('job')?'career':t.includes('partner')?'collaboration':t.includes('business')?'business':'unknown'; return {domain,confidence:domain==='unknown'?0.2:0.65}; }
