import type { GoalIntent } from '../intent/schema';
import { isExpired, revalidateOpportunity } from './engine';
import { qualifyOpportunity, type QualificationPolicy } from './qualification';
import type { OpportunityRecord } from './engine-types';

export interface OpportunityRankingContext { intent?:GoalIntent; qualification?:QualificationPolicy; now?:string; limit?:number; }
export interface RankedOpportunity { opportunity:OpportunityRecord; rank:number; qualification:ReturnType<typeof qualifyOpportunity>; reasons:string[]; }

const match=(expected:string|undefined,actual:string|undefined)=>!expected||!actual?0:expected.toLowerCase()===actual.toLowerCase()?1:0;

export function rankOpportunityRecords(records:OpportunityRecord[],context:OpportunityRankingContext={}):RankedOpportunity[] {
  const now=context.now ?? new Date().toISOString();
  const active=records.filter(record=>!isExpired(record,now)).map(record=>revalidateOpportunity(record,now));
  const ranked=active.map(opportunity=>{
    const qualification=qualifyOpportunity(opportunity,context.qualification);
    const intent=context.intent;
    const intentMatch=intent ? (match(intent.location,opportunity.location)+match(intent.industry,opportunity.industry))/2 : 1;
    const urgency=opportunity.urgency;
    const rank=opportunity.score.total*0.6+qualification.score*0.2+intentMatch*0.15+urgency*0.05;
    const reasons=[...opportunity.score.reasons];
    if(intent?.location)reasons.push(intentMatch===1?'location matches intent':'location differs from intent');
    if(intent?.industry)reasons.push(intentMatch===1?'industry matches intent':'industry differs from intent');
    if(!qualification.qualified)reasons.push(`qualification gaps: ${qualification.missing.join(', ')}`);
    return {opportunity,rank,qualification,reasons};
  }).sort((a,b)=>b.rank-a.rank);
  return typeof context.limit==='number'?ranked.slice(0,Math.max(0,context.limit)):ranked;
}
