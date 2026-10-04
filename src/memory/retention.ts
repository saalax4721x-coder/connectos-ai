import type { MemoryItem, MemoryRetentionPolicy, MemoryScope } from './types';

const DAY=24*60*60*1000;

export const DEFAULT_RETENTION_POLICIES:MemoryRetentionPolicy[]=[
  {scope:'user',userDeletable:true,maxItemsPerSubject:500},
  {scope:'relationship',ttlMs:365*DAY,userDeletable:true,maxItemsPerSubject:300},
  {scope:'company',ttlMs:365*DAY,userDeletable:true,maxItemsPerSubject:300},
  {scope:'opportunity',ttlMs:180*DAY,userDeletable:true,maxItemsPerSubject:200},
  {scope:'project',ttlMs:365*DAY,userDeletable:true,maxItemsPerSubject:300},
  {scope:'deal',ttlMs:365*DAY,userDeletable:true,maxItemsPerSubject:300},
  {scope:'agent',ttlMs:90*DAY,userDeletable:true,maxItemsPerSubject:200},
  {scope:'workflow',ttlMs:30*DAY,userDeletable:true,maxItemsPerSubject:100}
];

export const retentionPolicyFor=(scope:MemoryScope,policies=DEFAULT_RETENTION_POLICIES)=>{
  const policy=policies.find(x=>x.scope===scope);
  if(!policy) throw new Error(`No retention policy for scope: ${scope}`);
  return policy;
};

export const applyRetention=(items:MemoryItem[],policy:MemoryRetentionPolicy,now=new Date())=>{
  const cutoff=policy.ttlMs===undefined?undefined:now.getTime()-policy.ttlMs;
  return items
    .filter(x=>x.status==='active')
    .sort((a,b)=>b.importance-a.importance||Date.parse(b.updatedAt)-Date.parse(a.updatedAt))
    .map(x=>{
      const expired=cutoff!==undefined&&Date.parse(x.updatedAt)<cutoff;
      return expired?{...x,status:'expired' as const}:{...x};
    })
    .slice(0,policy.maxItemsPerSubject);
};
