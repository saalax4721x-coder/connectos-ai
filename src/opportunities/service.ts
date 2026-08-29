import type { GoalIntent } from '../intent/schema';
import { buildOpportunity, ingestOpportunity, revalidateOpportunity } from './engine';
import { rankOpportunityRecords, type RankedOpportunity } from './ranking';
import { qualifyOpportunity } from './qualification';
import type { OpportunityCandidate, OpportunityRecord } from './engine-types';
import type { OpportunityStore } from './store';

export interface OpportunityEngineService {
  ingest(candidate:OpportunityCandidate):Promise<{record?:OpportunityRecord;duplicateId?:string}>;
  discover(intent?:GoalIntent,limit?:number):Promise<RankedOpportunity[]>;
  revalidate(id:string):Promise<OpportunityRecord|undefined>;
  qualify(id:string):Promise<ReturnType<typeof qualifyOpportunity>|undefined>;
}

export function createOpportunityEngineService(store:OpportunityStore):OpportunityEngineService {
  return {
    async ingest(candidate){
      const existing=await store.list();
      const result=ingestOpportunity(candidate,existing);
      if(result.duplicate){return {duplicateId:result.duplicate.existingId};}
      if(!result.record)throw new Error('opportunity ingestion produced no record');
      await store.upsert(result.record);
      return {record:result.record};
    },
    async discover(intent,limit){return rankOpportunityRecords(await store.list(),{intent,limit});},
    async revalidate(id){const current=await store.get(id); if(!current)return undefined; const updated=revalidateOpportunity(current); await store.upsert(updated); return updated;},
    async qualify(id){const current=await store.get(id); return current ? qualifyOpportunity(current) : undefined;}
  };
}

export function createOpportunityFromCandidate(candidate:OpportunityCandidate,id?:string){return buildOpportunity(candidate,id);}
