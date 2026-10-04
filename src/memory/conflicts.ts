import type { MemoryConflict, MemoryItem } from './types';

const cluster=(item:MemoryItem)=>new Set(item.tags);
const overlap=(a:Set<string>,b:Set<string>)=>{let n=0;for(const x of a)if(b.has(x))n++;return n;};

export const detectMemoryConflicts=(existing:MemoryItem[],incoming:MemoryItem):MemoryConflict[]=>{
  return existing
    .filter(x=>x.id!==incoming.id&&x.status==='active'&&x.scope===incoming.scope&&x.subjectId===incoming.subjectId)
    .filter(x=>overlap(cluster(x),cluster(incoming))>0)
    .map(x=>({existingId:x.id,incomingId:incoming.id,reason:'same-tag-cluster' as const,resolution:'newer' as const}));
};

export const chooseConflictWinner=(a:MemoryItem,b:MemoryItem):MemoryItem=>{
  if(a.confidence!==b.confidence)return a.confidence>b.confidence?a:b;
  return Date.parse(a.updatedAt)>=Date.parse(b.updatedAt)?a:b;
};
