import {describe,expect,it} from 'vitest';
import {planContext} from './planner';
import {resolveContext} from './resolver';
import {InMemoryMemoryStore} from '../memory/store';
import {MemoryService} from '../memory/service';
import {baseIntent} from '../intent/parser';

describe('context intelligence',()=>{
  it('plans context from canonical intent without inventing records',()=>{
    const intent=baseIntent('Find investors for an AI startup');
    intent.peopleRequired=['investor']; intent.companiesRequired=['startups'];
    const plan=planContext(intent,'u1');
    expect(plan.needs.some(n=>n.id==='memory:user')).toBe(true);
    expect(plan.needs.some(n=>n.id==='graph:investor')).toBe(true);
    expect(plan.gaps).toContain('success outcome is not explicit');
  });
  it('retrieves only from the supplied memory subject',async()=>{
    const store=new InMemoryMemoryStore();
    const service=new MemoryService(store);
    await service.remember({id:'m1',scope:'user',subjectId:'u1',value:'prefers London opportunities',createdAt:'2026-10-05T00:00:00.000Z',updatedAt:'2026-10-05T00:00:00.000Z',importance:.8,confidence:.9,sensitivity:'private',tags:['location'],status:'active'});
    await service.remember({id:'m2',scope:'user',subjectId:'u2',value:'prefers Nairobi opportunities',createdAt:'2026-10-05T00:00:00.000Z',updatedAt:'2026-10-05T00:00:00.000Z',importance:.9,confidence:.9,sensitivity:'private',tags:['location'],status:'active'});
    const intent=baseIntent('Find opportunities');
    intent.outcome='qualified matches';
    const bundle=await resolveContext(intent,{memory:service,entitySeeds:{},now:new Date('2026-10-05T00:00:00.000Z')});
    expect(bundle.memories.map(m=>m.id)).toContain('m1');
    expect(bundle.memories.map(m=>m.id)).not.toContain('m2');
  });
  it('reports unresolved graph identities instead of fabricating paths',async()=>{
    const intent=baseIntent('Find founders');
    intent.outcome='qualified founders'; intent.peopleRequired=['founder'];
    const bundle=await resolveContext(intent,{memory:new MemoryService(new InMemoryMemoryStore())});
    expect(bundle.gaps).toContain('graph identity for founder is unresolved');
    expect(bundle.graphPaths).toHaveLength(0);
  });
  it('surfaces competing memory values for the same tag',async()=>{
    const store=new InMemoryMemoryStore(); const service=new MemoryService(store);
    const make=(id:string,value:string)=>service.remember({id,scope:'user',subjectId:'u1',value,createdAt:'2026-10-05T00:00:00.000Z',updatedAt:'2026-10-05T00:00:00.000Z',importance:.8,confidence:.8,sensitivity:'private',tags:['location'],status:'active'});
    await make('m1','London'); await make('m2','Nairobi');
    const intent=baseIntent('Find opportunities'); intent.outcome='qualified matches';
    const bundle=await resolveContext(intent,{memory:service,entitySeeds:{x:'u1'},now:new Date('2026-10-05T00:00:00.000Z')});
    expect(bundle.conflicts.length).toBeGreaterThan(0);
  });
});
