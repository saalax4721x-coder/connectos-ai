import type { MemoryItem, MemoryQuery } from './types';

export interface MemoryStore {
  put(item:MemoryItem):Promise<void>;
  get(id:string):Promise<MemoryItem|undefined>;
  query(query:MemoryQuery):Promise<MemoryItem[]>;
  delete(id:string):Promise<void>;
}

export class InMemoryMemoryStore implements MemoryStore {
  private readonly items=new Map<string,MemoryItem>();

  async put(item:MemoryItem){
    this.items.set(item.id,{...item,tags:[...item.tags]});
  }

  async get(id:string){
    const item=this.items.get(id);
    return item?{...item,tags:[...item.tags]}:undefined;
  }

  async query(q:MemoryQuery){
    const now=q.now?Date.parse(q.now):Date.now();
    return [...this.items.values()]
      .filter(x=>x.scope===q.scope&&x.subjectId===q.subjectId)
      .filter(x=>q.includeSuperseded||x.status!=='superseded')
      .filter(x=>q.includeExpired||x.status!=='expired')
      .filter(x=>!x.expiresAt||q.includeExpired||Date.parse(x.expiresAt)>now)
      .filter(x=>!q.tags||q.tags.every(t=>x.tags.includes(t)))
      .map(x=>({...x,tags:[...x.tags]}))
      .sort((a,b)=>b.importance-a.importance||Date.parse(b.updatedAt)-Date.parse(a.updatedAt))
      .slice(0,q.limit??20);
  }

  async delete(id:string){
    this.items.delete(id);
  }
}
