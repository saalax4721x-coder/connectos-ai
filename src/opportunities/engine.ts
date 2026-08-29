import { assertConfidence } from '../core/provenance';
import type { Opportunity } from './types';
import type { OpportunityStage } from './lifecycle';
import { scoreOpportunity, type OpportunitySignals } from './score';
import { findDuplicate } from './dedup-engine';
import type { OpportunityCandidate, OpportunityRecord, OpportunityNextAction } from './engine-types';

const now=()=>new Date().toISOString();
const clamp=(n:number)=>Math.max(0,Math.min(1,n));

const freshnessDays=(type:Opportunity['type'])=>({
  event:7,job:21,client:30,contract:30,project:30,creator:45,media:45,partnership:60,collaboration:60,investment:14,funding:21,property:14,introduction:30,talent:30,'market-entry':90,buyer:30,supplier:30,distributor:30,acquisition:30
}[type] ?? 30);

export function expiryFor(candidate: Pick<OpportunityCandidate,'type'>, observedAt:string):string {
  const date=new Date(observedAt); date.setUTCDate(date.getUTCDate()+freshnessDays(candidate.type)); return date.toISOString();
}

export function isExpired(record: Pick<OpportunityRecord,'expiresAt'|'status'>, at=now()):boolean {
  return record.status==='expired' || (!!record.expiresAt && new Date(record.expiresAt).getTime()<=new Date(at).getTime());
}

function normalizeSignals(signals: OpportunitySignals): OpportunitySignals {
  return Object.fromEntries(Object.entries(signals).map(([key,value])=>[key,clamp(value)])) as OpportunitySignals;
}

function makeAction(record: OpportunityRecord): OpportunityNextAction {
  const access=record.signals.access;
  const consequential=access<0.6 || record.stage==='qualified';
  const title=access>=0.6 ? 'Start the recommended outreach' : 'Verify access path before outreach';
  return { id:`nba_${record.id}`,title,rationale:record.score.reasons.join('; '),prerequisites:access>=0.6?['Confirm current contact context']:['Identify a legitimate introduction or public contact path'],requiredPermission:consequential?'external_communication':'opportunity.read',confidence:clamp(record.confidence*record.score.total),fallbackActions:['Save and monitor for a fresher signal','Research an alternative access path'],consequential };
}

export function buildOpportunity(candidate: OpportunityCandidate, id=`opp_${crypto.randomUUID()}`): OpportunityRecord {
  const observedAt=candidate.evidence.map(e=>e.observedAt).sort().at(-1) ?? now();
  assertConfidence(candidate.confidence);
  const signals=normalizeSignals(candidate.signals);
  const base: OpportunityRecord={
    id,type:candidate.type,title:candidate.title.trim(),description:candidate.description.trim(),people:[...(candidate.people??[])],companies:[...(candidate.companies??[])],location:candidate.location,industry:candidate.industry,value:candidate.value,currency:candidate.currency,urgency:clamp(candidate.urgency ?? signals.urgency),timestamp:observedAt,source:candidate.source,confidence:candidate.confidence,whyYou:candidate.rationale?.whyYou ?? [],whyThem:candidate.rationale?.whyThem ?? [],whyNow:candidate.rationale?.whyNow ?? [],nextAction:'',provenance:candidate.provenance,stage:'discovered',status:'active',evidence:candidate.evidence,signals,score:scoreOpportunity(signals),lastEvaluatedAt:now(),expiresAt:expiryFor(candidate,observedAt),version:1
  };
  base.nextBestAction=makeAction(base);
  base.nextAction=base.nextBestAction.title;
  return base;
}

export function ingestOpportunity(candidate: OpportunityCandidate, existing: OpportunityRecord[]): {record?:OpportunityRecord;duplicate?:ReturnType<typeof findDuplicate>} {
  const record=buildOpportunity(candidate);
  const duplicate=findDuplicate(record,existing);
  if(duplicate)return {duplicate};
  return {record};
}

export function revalidateOpportunity(record: OpportunityRecord, at=now()): OpportunityRecord {
  if(isExpired(record,at))return {...record,status:'expired',lastEvaluatedAt:at,version:record.version+1};
  return {...record,status:'active',lastEvaluatedAt:at,score:scoreOpportunity(record.signals),nextBestAction:makeAction(record),nextAction:makeAction(record).title,version:record.version+1};
}

export function advanceOpportunity(record: OpportunityRecord,next: OpportunityStage): OpportunityRecord {
  const order: OpportunityStage[]=['discovered','researched','saved','qualified','contacted','conversation','meeting','proposal','negotiation','collaboration','deal','completed','outcome'];
  if(order.indexOf(next)<order.indexOf(record.stage))throw new Error(`cannot move opportunity backwards from ${record.stage} to ${next}`);
  return {...record,stage:next,lastEvaluatedAt:now(),version:record.version+1};
}
