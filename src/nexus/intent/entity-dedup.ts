import type { IntentEntity } from './entity-kind';
export function deduplicateEntities(entities:IntentEntity[]):IntentEntity[] { const seen=new Set<string>(); return entities.filter(e=>{const key=`${e.kind}:${e.value.toLowerCase().trim()}`; if(seen.has(key)) return false; seen.add(key); return true;}); }
