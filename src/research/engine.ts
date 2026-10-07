import type {ResearchProvider,ResearchRequest,ResearchResult,ResearchEvidence,ResearchFinding,ResearchConflict} from './schema';

const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const validEvidence=(e:ResearchEvidence,minConfidence:number,minFreshness:number)=>{
  if(!e.id||!e.entityId||!e.claim||!e.value)throw new Error('research evidence requires id, entityId, claim and value');
  if(!Number.isFinite(e.confidence)||e.confidence<0||e.confidence>1)throw new Error('research evidence confidence must be between 0 and 1');
  if(!Number.isFinite(e.freshness)||e.freshness<0||e.freshness>1)throw new Error('research evidence freshness must be between 0 and 1');
  if(!e.sourceIds.length)throw new Error('research evidence requires at least one source');
  return e.confidence>=minConfidence&&e.freshness>=minFreshness;
};

export const research=async(request:ResearchRequest,provider:ResearchProvider):Promise<ResearchResult>=>{
  const limit=Math.min(100,Math.max(1,request.maxResults??20));
  const minimumConfidence=clamp(request.minimumConfidence??0);
  const minimumFreshness=clamp(request.minimumFreshness??0);
  const results=await provider.search(request.query,limit);
  const evidence=(await Promise.all(results.map(result=>provider.evidence(result)))).flat();
  const unique=[...new Map(evidence.map(item=>[item.id,item])).values()];
  const usable=unique.filter(item=>validEvidence(item,minimumConfidence,minimumFreshness));
  const gaps:string[]=[];
  if(results.length===0)gaps.push('no search results returned');
  if(unique.length===0)gaps.push('no source-backed evidence returned');
  const grouped=new Map<string,ResearchEvidence[]>();
  for(const item of usable){const key=`${item.entityId}::${item.claim}`;const group=grouped.get(key)??[];group.push(item);grouped.set(key,group);}
  const conflicts:ResearchConflict[]=[];
  const findings:ResearchFinding[]=[];
  for(const [key,items] of grouped){
    const values=[...new Set(items.map(item=>item.value))];
    if(values.length>1){
      conflicts.push({entityId:items[0].entityId,claim:items[0].claim,evidenceIds:items.map(item=>item.id),values,reason:'source-backed evidence contains competing values'});
      continue;
    }
    const confidence=clamp(items.reduce((sum,item)=>sum+item.confidence*item.freshness,0)/items.length);
    findings.push({entityId:items[0].entityId,claim:items[0].claim,value:items[0].value,confidence,evidenceIds:items.map(item=>item.id),sourceIds:[...new Set(items.flatMap(item=>item.sourceIds))],staleEvidenceIds:unique.filter(item=>item.entityId===items[0].entityId&&item.claim===items[0].claim&&item.freshness<minimumFreshness).map(item=>item.id)});
  }
  if(conflicts.length)gaps.push(...conflicts.map(c=>`conflicting evidence for ${c.entityId}: ${c.claim}`));
  return {findings:findings.sort((a,b)=>b.confidence-a.confidence),evidence:unique,conflicts,gaps:[...new Set(gaps)],ready:gaps.length===0};
};
