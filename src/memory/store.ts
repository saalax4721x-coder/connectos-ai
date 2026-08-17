import type { MemoryItem, MemoryQuery } from './types';
export interface MemoryStore { put(item:MemoryItem):Promise<void>; query(query:MemoryQuery):Promise<MemoryItem[]>; }
export class InMemoryMemoryStore implements MemoryStore { private items=new Map<string,MemoryItem>(); async put(item:MemoryItem){this.items.set(item.id,item);} async query(q:MemoryQuery){return [...this.items.values()].filter(x=>x.scope===q.scope&&x.subjectId===q.subjectId&&(!q.tags||q.tags.every(t=>x.tags.includes(t)))).sort((a,b)=>b.importance-a.importance).slice(0,q.limit??20);} }
