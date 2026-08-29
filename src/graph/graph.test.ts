import { describe, expect, it } from 'vitest';
import { InMemoryGraph } from './repository';
import { createGraphService } from './service';

const provenance=[{kind:'verified' as const,confidence:.95,observedAt:'2026-08-29T10:00:00.000Z',sourceId:'crm'}];
const person=(id:string)=>({id,displayName:id,companyIds:[],skillIds:[],verified:true,source:'crm',observedAt:'2026-08-29T10:00:00.000Z',confidence:.95,provenance});
const edge=(id:string,from:string,to:string,type:'knows'|'can-introduce')=>({id,from,to,type,source:'crm',confidence:.9,observedAt:'2026-08-29T10:00:00.000Z',provenance,strength:.9,consent:type==='can-introduce'?'unknown' as const:undefined,active:true});

describe('ConnectOS relationship graph',()=>{
  it('validates endpoints and finds scored paths with provenance',async()=>{
    const graph=new InMemoryGraph(); graph.addNode(person('a')).addNode(person('b')).addNode(person('c')).addEdge(edge('ab','a','b','knows')).addEdge(edge('bc','b','c','knows'));
    const result=await graph.query({start:'a',target:'c',depth:4,limit:10});
    expect(result.paths).toHaveLength(1); expect(result.paths[0].nodes).toEqual(['a','b','c']); expect(result.paths[0].score).toBeGreaterThan(.5); expect(result.provenance).toContain('crm');
  });
  it('rejects relationship edges with missing endpoints',async()=>{const graph=new InMemoryGraph();graph.addNode(person('a'));await expect(graph.upsertEdge(edge('bad','a','missing','knows'))).rejects.toThrow('endpoints');});
  it('supports warm-path discovery without fabricating direct relationships',async()=>{const graph=new InMemoryGraph();graph.addNode(person('a')).addNode(person('b')).addNode(person('c')).addEdge(edge('ab','a','b','knows')).addEdge(edge('bc','b','c','can-introduce'));const service=createGraphService(graph);const paths=await service.findWarmPaths('a','c');expect(paths).toHaveLength(1);expect(paths[0].edges).toHaveLength(2);expect(paths[0].requiresConsent).toBe(true);});
  it('keeps introduction consent pending until explicitly resolved',async()=>{const graph=new InMemoryGraph();graph.addNode(person('a')).addNode(person('b')).addEdge(edge('ab','a','b','can-introduce'));const service=createGraphService(graph);const request=await service.requestIntroduction('a','b');expect(request?.status).toBe('pending');const approved=await service.resolveIntroduction(request!.id,'approved');expect(approved?.status).toBe('approved');});
  it('decays stale relationship strength',async()=>{const graph=new InMemoryGraph();graph.addNode(person('a')).addNode(person('b')).addEdge({...edge('ab','a','b','knows'),observedAt:'2020-01-01T00:00:00.000Z'});const result=await graph.query({start:'a',target:'b',depth:2,limit:5,minStrength:.5});expect(result.paths).toHaveLength(0);});
});
