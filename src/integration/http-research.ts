import type {ResearchEvidence,ResearchProvider} from '../research/schema';
import type {SearchResult} from '../search/result';

export interface HttpResearchOptions {
  baseUrl:string;
  /** Server-side credential provider. Never put provider secrets in a browser bundle. */
  headers?:()=>Promise<Record<string,string>>;
  fetch?:typeof fetch;
  timeoutMs?:number;
}
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const text=(v:unknown):v is string=>typeof v==='string'&&v.trim().length>0;
const unit=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=1;
const sources=(v:unknown):v is string[]=>Array.isArray(v)&&v.length>0&&v.every(text);

/** POST /search and /evidence bridge an authenticated host research service to ResearchProvider. */
export function createHttpResearchProvider(options:HttpResearchOptions):ResearchProvider {
  const base=new URL(options.baseUrl.endsWith('/')?options.baseUrl:`${options.baseUrl}/`);
  if(base.protocol!=='https:'&&!(base.protocol==='http:'&&['127.0.0.1','localhost','[::1]'].includes(base.hostname)))
    throw new Error('Research endpoint must use HTTPS (HTTP is allowed only for localhost)');
  if(base.username||base.password||base.search||base.hash)throw new Error('Research URL must not contain credentials, query or fragment');
  const timeoutMs=options.timeoutMs??15000;
  if(!Number.isFinite(timeoutMs)||timeoutMs<=0)throw new Error('Research timeout must be positive');
  const post=async(path:string,payload:unknown):Promise<unknown[]>=>{
    const response=await (options.fetch??fetch)(new URL(path,base),{method:'POST',
      headers:{...(await options.headers?.()),'Content-Type':'application/json'},body:JSON.stringify(payload),
      signal:AbortSignal.timeout(timeoutMs),redirect:'error'});
    if(!response.ok)throw new Error(`Research service returned HTTP ${response.status}`);
    const body:unknown=await response.json();
    if(!Array.isArray(body))throw new Error('Research service response must be an array');
    return body;
  };
  return {
    async search(query,limit){
      const rows=await post('search',{query,limit});
      return rows.slice(0,limit).map((row):SearchResult=>{
        if(!object(row)||!text(row.entityId)||!text(row.entityType)||!unit(row.score)||
          !text(row.reason)||!sources(row.sourceIds)||!unit(row.freshness))throw new Error('Invalid research search result');
        return {entityId:row.entityId,entityType:row.entityType,score:row.score,reason:row.reason,
          sourceIds:row.sourceIds,freshness:row.freshness};
      });
    },
    async evidence(result){
      const rows=await post('evidence',{result});
      return rows.map((row):ResearchEvidence=>{
        if(!object(row)||!text(row.id)||row.entityId!==result.entityId||!text(row.claim)||!text(row.value)||
          !sources(row.sourceIds)||!row.sourceIds.every(id=>result.sourceIds.includes(id))||
          !text(row.observedAt)||!Number.isFinite(Date.parse(row.observedAt))||!unit(row.confidence)||!unit(row.freshness))
          throw new Error('Invalid research evidence or source lineage');
        return {id:row.id,entityId:result.entityId,claim:row.claim,value:row.value,sourceIds:row.sourceIds,
          observedAt:row.observedAt,confidence:row.confidence,freshness:row.freshness};
      });
    },
  };
}
