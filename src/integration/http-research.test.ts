import {describe,it,expect,vi} from 'vitest';
import {createHttpResearchProvider} from './http-research';
const result={entityId:'p1',entityType:'person',score:1,reason:'match',sourceIds:['s1'],freshness:1};
const evidence={id:'e1',entityId:'p1',claim:'need',value:'partner',sourceIds:['s1'],observedAt:new Date().toISOString(),confidence:1,freshness:1};
const query={raw:'partners',entities:['p1'],filters:{}};

describe('HTTP research contract',()=>{
  it('posts typed requests with authentication and an abort deadline',async()=>{
    const fetch=vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response(JSON.stringify([result])));
    const provider=createHttpResearchProvider({baseUrl:'https://research.example/api',headers:async()=>({Authorization:'Bearer test-only'}),fetch});
    expect(await provider.search(query,5)).toEqual([result]);
    const [url,init]=fetch.mock.calls[0];
    expect(String(url)).toBe('https://research.example/api/search');
    expect(init).toMatchObject({method:'POST',redirect:'error',headers:{Authorization:'Bearer test-only'}});
    expect(JSON.parse(init!.body as string)).toEqual({query,limit:5});
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });
  it.each([{},[{...result,score:NaN}],[{...result,sourceIds:[]}],[{...result,entityId:''}]])('rejects invalid search payload %j',async payload=>{
    const provider=createHttpResearchProvider({baseUrl:'https://research.example',fetch:vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(payload)))});
    await expect(provider.search(query,5)).rejects.toThrow();
  });
  it.each([{...evidence,entityId:'other'},{...evidence,sourceIds:['unrelated']},{...evidence,observedAt:'invalid'}])('rejects invalid evidence lineage %j',async payload=>{
    const provider=createHttpResearchProvider({baseUrl:'https://research.example',fetch:vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify([payload])))});
    await expect(provider.evidence(result)).rejects.toThrow('Invalid research evidence');
  });
  it('surfaces provider failure without returning empty success',async()=>{
    const provider=createHttpResearchProvider({baseUrl:'https://research.example',fetch:vi.fn<typeof fetch>().mockResolvedValue(new Response('failure',{status:503}))});
    await expect(provider.search(query,5)).rejects.toThrow('HTTP 503');
  });
  it('keeps endpoint configuration secure',()=>{
    expect(()=>createHttpResearchProvider({baseUrl:'http://remote.example'})).toThrow('HTTPS');
    expect(()=>createHttpResearchProvider({baseUrl:'https://user:password@remote.example'})).toThrow('credentials');
    expect(()=>createHttpResearchProvider({baseUrl:'https://remote.example',timeoutMs:0})).toThrow('positive');
  });
});
