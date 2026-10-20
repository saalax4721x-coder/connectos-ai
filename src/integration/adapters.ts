import type {GoalIntent} from '../intent/schema';
import {research} from '../research/engine';
import type {ResearchProvider, ResearchResult} from '../research/schema';
import type {GraphService, BridgePath} from '../graph/service';
import type {OpportunityEngineService} from '../opportunities/service';
import type {OpportunityCandidate} from '../opportunities/engine-types';
import type {OpportunitySignals} from '../opportunities/score';
import type {OpportunityType} from '../opportunities/types';
import type {MemoryService} from '../memory/service';
import type {MemoryRetrieval} from '../memory/types';
import type {NexusIntelligenceProvider} from '../nexus/intelligence/providers';

/** Domain policy supplies fit/value signals; research supplies facts and provenance. */
export interface ResearchTarget {
  entityId:string;
  title:string;
  type:OpportunityType;
  signals:OpportunitySignals;
}

export interface IntegratedIntelligence {
  research:ResearchResult;
  opportunities:Awaited<ReturnType<OpportunityEngineService['discover']>>;
  warmPaths:BridgePath[];
  memories:MemoryRetrieval[];
}

export interface IntelligenceServices {
  research:ResearchProvider;
  graph:GraphService;
  opportunities:OpportunityEngineService;
  memory:MemoryService;
}

export async function collectIntelligence(
  services:IntelligenceServices, intent:GoalIntent, actorId:string, targets:ResearchTarget[],
):Promise<IntegratedIntelligence> {
  const result=await research({query:{raw:intent.goal,entities:targets.map(t=>t.entityId),
    location:intent.location,industry:intent.industry,filters:{}},minimumConfidence:.55,minimumFreshness:.5},services.research);
  if(!result.ready)throw new Error(`Research blocked: ${result.gaps.join('; ')}`);
  const ingested=new Set<string>();
  for(const target of targets){
    const findings=result.findings.filter(f=>f.entityId===target.entityId);
    if(!findings.length)continue;
    for(const value of Object.values(target.signals)){
      if(!Number.isFinite(value)||value<0||value>1)throw new Error('Opportunity signals must be between 0 and 1');
    }
    const ids=new Set(findings.flatMap(f=>f.evidenceIds));
    const evidence=result.evidence.filter(e=>ids.has(e.id));
    const provenance=evidence.flatMap(e=>e.sourceIds.map(sourceId=>({sourceId,observedAt:e.observedAt,
      confidence:e.confidence,kind:'public-source' as const})));
    const candidate:OpportunityCandidate={type:target.type,title:target.title,
      description:findings.map(f=>`${f.claim}: ${f.value}`).join('; '),people:[target.entityId],
      location:intent.location,industry:intent.industry,source:'research',
      confidence:Math.min(...findings.map(f=>f.confidence)),provenance,signals:target.signals,
      evidence:evidence.map(e=>({id:e.id,claim:e.claim,observedAt:e.observedAt,quality:e.confidence*e.freshness,
        provenance:provenance.filter(p=>e.sourceIds.includes(p.sourceId))}))};
    const stored=await services.opportunities.ingest(candidate);
    const id=stored.record?.id??stored.duplicateId;
    if(id)ingested.add(id);
  }
  // Limit discovery to this run's evidenced candidates, not unrelated store contents.
  const opportunities=(await services.opportunities.discover(intent)).filter(r=>ingested.has(r.opportunity.id)&&r.qualification.qualified);
  const warmPaths=(await Promise.all(opportunities.flatMap(r=>r.opportunity.people)
    .map(id=>services.graph.findWarmPaths(actorId,id)))).flat();
  const memories=await services.memory.retrieve({scope:'user',subjectId:actorId},intent.goal);
  return {research:result,opportunities,warmPaths,memories};
}

export function nexusIntelligenceAdapter(snapshot:IntegratedIntelligence):NexusIntelligenceProvider {
  return {
    async discoverOpportunities(){return snapshot.opportunities.map(({opportunity})=>({opportunity,signals:opportunity.signals}));},
    async findWarmPaths(){return snapshot.warmPaths;},
    async research(){return {result:snapshot.research,memories:snapshot.memories};},
  };
}
