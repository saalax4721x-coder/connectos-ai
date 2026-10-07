import {describe,expect,it} from 'vitest';
import {research} from './engine';
import type {ResearchProvider} from './schema';

const provider=(evidenceSets:Record<string,any[]>):ResearchProvider=>({
  search:async()=>Object.keys(evidenceSets).map((entityId,i)=>({entityId,entityType:'company',score:1-i*.1,reason:'match',sourceIds:evidenceSets[entityId].flatMap((e:any)=>e.sourceIds),freshness:1})),
  evidence:async(result)=>evidenceSets[result.entityId]??[]
});

const query={raw:'Find AI startups',entities:['startup'],filters:{}} as const;

describe('research intelligence',()=>{
  it('synthesizes source-backed evidence deterministically',async()=>{
    const result=await research({query},provider({acme:[{id:'e1',entityId:'acme',claim:'fundingStage',value:'seed',sourceIds:['s1'],observedAt:'2026-10-06T00:00:00.000Z',confidence:.9,freshness:.95}]}));
    expect(result.ready).toBe(true);
    expect(result.findings[0].value).toBe('seed');
    expect(result.findings[0].confidence).toBeGreaterThan(.8);
  });
  it('does not silently choose between competing claims',async()=>{
    const result=await research({query},provider({acme:[
      {id:'e1',entityId:'acme',claim:'fundingStage',value:'seed',sourceIds:['s1'],observedAt:'2026-10-06T00:00:00.000Z',confidence:.9,freshness:.9},
      {id:'e2',entityId:'acme',claim:'fundingStage',value:'seriesA',sourceIds:['s2'],observedAt:'2026-10-06T00:00:00.000Z',confidence:.9,freshness:.9}
    ]}));
    expect(result.findings).toHaveLength(0);
    expect(result.conflicts).toHaveLength(1);
    expect(result.ready).toBe(false);
  });
  it('surfaces empty research instead of fabricating findings',async()=>{
    const result=await research({query},provider({}));
    expect(result.findings).toHaveLength(0);
    expect(result.gaps).toContain('no search results returned');
    expect(result.ready).toBe(false);
  });
  it('filters evidence below the requested confidence and freshness',async()=>{
    const result=await research({query,minimumConfidence:.8,minimumFreshness:.8},provider({acme:[
      {id:'e1',entityId:'acme',claim:'location',value:'London',sourceIds:['s1'],observedAt:'2026-10-06T00:00:00.000Z',confidence:.7,freshness:.95},
      {id:'e2',entityId:'acme',claim:'industry',value:'AI',sourceIds:['s2'],observedAt:'2026-10-06T00:00:00.000Z',confidence:.9,freshness:.9}
    ]}));
    expect(result.findings.map(f=>f.claim)).toEqual(['industry']);
  });
});
