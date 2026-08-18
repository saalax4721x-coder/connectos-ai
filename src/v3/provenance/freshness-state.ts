export type FreshnessState='fresh'|'aging'|'stale'|'unknown';
export const freshnessState=(score:number):FreshnessState=>score>=.7?'fresh':score>=.35?'aging':score>0?'stale':'unknown';
