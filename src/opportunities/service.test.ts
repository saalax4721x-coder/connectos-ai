import { describe, expect, it } from 'vitest';
import { createOpportunityEngineService } from './service';
import { MemoryOpportunityStore } from './store';

const candidate={type:'job' as const,title:'Senior creator strategy role',description:'Verified role',people:['p'],companies:['c'],source:'public:role-board',confidence:.9,provenance:[{observedAt:'2026-08-29T12:00:00.000Z',kind:'public-source' as const,confidence:.9}],evidence:[{id:'e',claim:'Role is published',observedAt:'2026-08-29T12:00:00.000Z',quality:.9,provenance:[{observedAt:'2026-08-29T12:00:00.000Z',kind:'public-source' as const,confidence:.9}]}],signals:{relevance:.9,fit:.9,timing:.8,access:.7,value:.8,urgency:.7,competition:.2,effort:.2,risk:.2,confidence:.9}};

describe('Opportunity Engine service',()=>{
  it('persists ingestion and returns ranked discovery results',async()=>{
    const service=createOpportunityEngineService(new MemoryOpportunityStore());
    const first=await service.ingest(candidate);
    expect(first.record).toBeDefined();
    const duplicate=await service.ingest(candidate);
    expect(duplicate.duplicateId).toBe(first.record?.id);
    const results=await service.discover(undefined,10);
    expect(results).toHaveLength(1);
    expect(results[0].opportunity.id).toBe(first.record?.id);
  });
});
