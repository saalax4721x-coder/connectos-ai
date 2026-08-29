import { opportunityKey, normalizeOpportunityTitle } from './dedup';
import type { OpportunityRecord } from './engine-types';

export interface DuplicateMatch { candidateId: string; existingId: string; similarity: number; reason: 'exact-key' | 'semantic-title' | 'entity-overlap'; }

const tokens=(value:string)=>new Set(normalizeOpportunityTitle(value).split(/[^a-z0-9]+/).filter(token=>token.length>2));
const jaccard=(a:Set<string>,b:Set<string>)=>{ const union=new Set([...a,...b]); if(!union.size)return 1; let intersection=0; for(const token of a)if(b.has(token))intersection++; return intersection/union.size; };

export function findDuplicate(candidate: OpportunityRecord, existing: OpportunityRecord[]): DuplicateMatch | undefined {
  const exact=existing.find(item=>opportunityKey(item.title,item.source ?? '')===opportunityKey(candidate.title,candidate.source ?? ''));
  if(exact)return {candidateId:candidate.id,existingId:exact.id,similarity:1,reason:'exact-key'};
  const candidateTokens=tokens(candidate.title);
  let best: DuplicateMatch|undefined;
  for(const item of existing){
    const similarity=jaccard(candidateTokens,tokens(item.title));
    const entities=[...candidate.people,...candidate.companies].filter(Boolean);
    const overlap=entities.length>0 && entities.some(entity=>[...item.people,...item.companies].includes(entity));
    const adjusted=overlap ? Math.max(similarity,0.72) : similarity;
    if(adjusted>=0.72 && (!best || adjusted>best.similarity))best={candidateId:candidate.id,existingId:item.id,similarity:adjusted,reason:overlap?'entity-overlap':'semantic-title'};
  }
  return best;
}
