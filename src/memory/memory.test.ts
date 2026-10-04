import {describe,expect,it} from 'vitest';
import {InMemoryMemoryStore} from './store';
import {MemoryService} from './service';
import {rankMemories,retrieveMemory} from './retrieval';
import {retentionPolicyFor} from './retention';
import type {MemoryItem} from './types';

const item=(overrides:Partial<MemoryItem>={}):MemoryItem=>({
  id:'m1',scope:'user',subjectId:'u1',value:'prefers concise business plans',
  createdAt:'2026-10-01T00:00:00.000Z',updatedAt:'2026-10-03T00:00:00.000Z',
  importance:0.8,confidence:0.9,sensitivity:'private',tags:['preferences','business'],status:'active',...overrides
});

describe('memory engine',()=>{
  it('stores and queries by scope and subject',async()=>{
    const store=new InMemoryMemoryStore(); await store.put(item()); await store.put(item({id:'m2',subjectId:'u2'}));
    expect((await store.query({scope:'user',subjectId:'u1'})).map(x=>x.id)).toEqual(['m1']);
  });
  it('ranks text relevance with confidence, importance and recency',()=>{
    const result=rankMemories([item(),item({id:'m2',value:'prefers concise plans',importance:0.4,confidence:0.6,updatedAt:'2026-09-01T00:00:00.000Z'})],'business plans',new Date('2026-10-04T00:00:00.000Z'));
    expect(result[0].id).toBe('m1'); expect(result[0].reasons).toContain('text-match');
  });
  it('caps retrieval results',()=>expect(retrieveMemory(Array.from({length:15},(_,i)=>item({id:`m${i}`})),'business',5)).toHaveLength(5));
  it('normalizes tags and validates bounds',async()=>{
    const service=new MemoryService(new InMemoryMemoryStore());
    await expect(service.remember(item({tags:['x','x']}))).resolves.toMatchObject({tags:['x']});
    await expect(service.remember(item({id:'bad',importance:2}))).rejects.toThrow('importance');
  });
  it('supersedes a lower-confidence conflicting memory',async()=>{
    const store=new InMemoryMemoryStore(); const service=new MemoryService(store);
    await service.remember(item({id:'old',tags:['role'],confidence:0.5,updatedAt:'2026-10-01T00:00:00.000Z'}));
    await service.remember(item({id:'new',tags:['role'],confidence:0.9,updatedAt:'2026-10-02T00:00:00.000Z'}));
    expect((await store.get('old'))?.status).toBe('superseded'); expect((await store.get('new'))?.status).toBe('active');
  });
  it('keeps the stronger existing memory',async()=>{
    const store=new InMemoryMemoryStore(); const service=new MemoryService(store);
    await service.remember(item({id:'old',tags:['role'],confidence:0.95}));
    expect((await service.remember(item({id:'new',tags:['role'],confidence:0.4}))).id).toBe('old');
    expect(await store.get('new')).toBeUndefined();
  });
  it('supports user deletion as a tombstone',async()=>{
    const store=new InMemoryMemoryStore(); const service=new MemoryService(store); await service.remember(item()); await service.forget('m1');
    expect((await store.get('m1'))?.status).toBe('deleted');
  });
  it('expires stale workflow memories',async()=>{
    const store=new InMemoryMemoryStore(); const service=new MemoryService(store);
    await service.remember(item({scope:'workflow',subjectId:'w1',updatedAt:'2026-08-01T00:00:00.000Z'}));
    await service.expire('workflow','w1',new Date('2026-10-04T00:00:00.000Z'));
    expect((await store.get('m1'))?.status).toBe('expired');
  });
  it('hides superseded memories by default',async()=>{
    const store=new InMemoryMemoryStore(); await store.put(item({status:'superseded'})); await store.put(item({id:'active'}));
    expect((await store.query({scope:'user',subjectId:'u1'})).map(x=>x.id)).toEqual(['active']);
  });
  it('defines retention policy for every canonical scope',()=>{
    for(const scope of ['user','relationship','company','opportunity','project','deal','agent','workflow'] as const)expect(retentionPolicyFor(scope).maxItemsPerSubject).toBeGreaterThan(0);
  });
});
