export type IntentDomain = 'business'|'career'|'investment'|'collaboration'|'unknown';

export interface IntentTaxonomyEntry { domain: IntentDomain; keywords: string[]; }

export const intentTaxonomy: IntentTaxonomyEntry[] = [
 {domain:'business',keywords:['client','partner','supplier']},
 {domain:'investment',keywords:['investor','funding','capital']},
 {domain:'career',keywords:['job','role','career']}
];
