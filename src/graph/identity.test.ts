import { describe, expect, it } from 'vitest';
import { decideMerge, resolveCompanyIdentity, resolvePersonIdentity } from './identity';
import { scoreRelationship } from './strength';

const provenance=[{kind:'public-source' as const,confidence:.9,observedAt:'2026-08-29T10:00:00.000Z',sourceId:'source-1'}];

describe('Graph identity and relationship intelligence',()=>{
  it('resolves people conservatively with confidence and provenance',()=>{const result=resolvePersonIdentity({displayName:'Jane Doe',profession:'Founder',companyIds:['acme']},[{id:'p1',canonicalId:'Jane Doe',aliases:['Jane Doe','J. Doe','acme'],confidence:.7,provenance}]);expect(result?.canonicalId).toBe('Jane Doe');expect(result?.confidence).toBeGreaterThan(.7);expect(result?.provenance).toEqual(provenance);});
  it('resolves company aliases only from source-backed candidates',()=>{const result=resolveCompanyIdentity({name:'Acme Labs',industryIds:['media']},[{id:'c1',canonicalId:'Acme Labs',aliases:['Acme Labs','Acme'],confidence:.8,provenance}]);expect(result?.canonicalId).toBe('Acme Labs');});
  it('requires review when merge evidence is weak and makes merge reversible',()=>{const decision=decideMerge({id:'a',canonicalId:'Alpha',aliases:['Alpha'],confidence:.8,provenance},{id:'b',canonicalId:'Beta',aliases:['Beta'],confidence:.75,provenance});expect(decision.action).toBe('review');expect(decision.reversible).toBe(true);});
  it('auto-merges only when deterministic alias overlap is strong',()=>{const decision=decideMerge({id:'a',canonicalId:'Alpha',aliases:['Alpha','A Corp'],confidence:.95,provenance},{id:'b',canonicalId:'Beta',aliases:['Beta','A Corp'],confidence:.94,provenance});expect(decision.action).toBe('auto-merge');});
  it('calculates transparent relationship strength and time decay',()=>{const result=scoreRelationship({recentInteractions:.9,sharedProjects:.8,sharedContext:.7,mutualTrust:.8,sourceQuality:.9},'2026-08-29T10:00:00.000Z','2026-08-29T10:00:00.000Z');expect(result.raw).toBeGreaterThan(.8);expect(result.decayed).toBe(result.raw);expect(result.reasons.length).toBe(3);});
});
