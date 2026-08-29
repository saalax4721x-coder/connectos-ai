import { assertConfidence } from '../core/provenance';
import type { OpportunityRecord } from './engine-types';

export interface QualificationPolicy { minFit:number; minAccess:number; minTiming:number; minValue:number; maxRisk:number; minConfidence:number; minEvidenceQuality:number; }
export interface QualificationResult { qualified:boolean; gates:Record<string,boolean>; missing:string[]; score:number; }

export const defaultQualificationPolicy:QualificationPolicy={minFit:.55,minAccess:.45,minTiming:.45,minValue:.35,maxRisk:.65,minConfidence:.55,minEvidenceQuality:.5};

export function qualifyOpportunity(record:OpportunityRecord,policy:QualificationPolicy=defaultQualificationPolicy):QualificationResult {
  assertConfidence(record.confidence);
  const evidenceQuality=record.evidence.length===0?0:record.evidence.reduce((sum,item)=>sum+item.quality,0)/record.evidence.length;
  const gates={fit:record.signals.fit>=policy.minFit,access:record.signals.access>=policy.minAccess,timing:record.signals.timing>=policy.minTiming,value:record.signals.value>=policy.minValue,risk:record.signals.risk<=policy.maxRisk,confidence:record.confidence>=policy.minConfidence,evidence:evidenceQuality>=policy.minEvidenceQuality};
  const missing=Object.entries(gates).filter(([,passed])=>!passed).map(([key])=>key);
  return {qualified:missing.length===0,gates,missing,score:Object.values(gates).filter(Boolean).length/Object.keys(gates).length};
}
