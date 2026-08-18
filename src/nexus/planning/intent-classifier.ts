export type IntentDomain='business'|'career'|'investment'|'collaboration'|'unknown';

export interface IntentClassification {
 domain: IntentDomain;
 confidence:number;
}

export function classifyIntent(text:string):IntentClassification{
 const value=text.toLowerCase();
 if(value.includes('invest')) return {domain:'investment',confidence:0.6};
 if(value.includes('job')) return {domain:'career',confidence:0.6};
 return {domain:'unknown',confidence:0.2};
}
