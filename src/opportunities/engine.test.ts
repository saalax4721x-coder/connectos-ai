import { describe, expect, it } from 'vitest';
import { buildOpportunity, advanceOpportunity } from './engine';
import { findDuplicate } from './dedup-engine';
import { qualifyOpportunity } from './qualification';
import { rankOpportunityRecords } from './ranking';

const provenance=[{observedAt:'2026-08-29T10:00:00.000Z',kind:'public-source' as const,confidence:.9}];
const signals={relevance:.9,fit:.85,timing:.8,access:.7,value:.8,urgency:.7,competition:.2,effort:.3,risk:.2,confidence:.9};
const candidate={type:'client' as const,title:'Enterprise creator partnership',description:'A verified partnership opportunity',people:['p1'],companies:['c1'],location:'Mogadishu',industry:'media',source:'public:example',confidence:.9,provenance,evidence:[{id:'e1',claim:'Company published a partnership brief',observedAt:'2026-08-29T10:00:00.000Z',quality:.9,provenance}],signals,rationale:{whyYou:['Matches stated creator goal'],whyThem:['Relevant creator capability'],whyNow:['Brief is current']}};

describe('Opportunity Engine',()=>{
  it('builds a canonical record with evidence, expiry, score and next action',()=>{
    const record=buildOpportunity(candidate,'opp_1');
    expect(record.stage).toBe('discovered');
    expect(record.status).toBe('active');
    expect(record.evidence).toHaveLength(1);
    expect(record.expiresAt).toBeTruthy();
    expect(record.score.total).toBeGreaterThan(.5);
    expect(record.nextBestAction?.title).toBeTruthy();
  });
  it('rejects backwards lifecycle transitions',()=>{
    const record=advanceOpportunity(buildOpportunity(candidate,'opp_2'),'qualified');
    expect(()=>advanceOpportunity(record,'researched')).toThrow();
  });
  it('detects duplicate opportunities by source key and entity-aware title similarity',()=>{
    const a=buildOpportunity(candidate,'opp_a');
    const b=buildOpportunity({...candidate,title:'Enterprise creator partnership',source:'public:example'},'opp_b');
    expect(findDuplicate(b,[a])?.reason).toBe('exact-key');
  });
  it('enforces qualification gates',()=>{
    const result=qualifyOpportunity(buildOpportunity(candidate,'opp_3'));
    expect(result.qualified).toBe(true);
    expect(result.missing).toEqual([]);
  });
  it('ranks by opportunity score, qualification, intent fit and urgency',()=>{
    const record=buildOpportunity(candidate,'opp_4');
    const ranked=rankOpportunityRecords([record],{limit:1,intent:{id:'i',raw:'find media client',goal:'find client',peopleRequired:[],companiesRequired:[],skillsRequired:[],constraints:[],preferences:[],confidence:.9,location:'Mogadishu',industry:'media'}});
    expect(ranked).toHaveLength(1);
    expect(ranked[0].rank).toBeGreaterThan(0);
    expect(ranked[0].reasons.length).toBeGreaterThan(0);
  });
});
