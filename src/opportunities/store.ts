import type { OpportunityRecord } from './engine-types';

export interface OpportunityStore {
  list(): Promise<OpportunityRecord[]>;
  get(id:string): Promise<OpportunityRecord|undefined>;
  upsert(record:OpportunityRecord): Promise<void>;
  remove(id:string): Promise<void>;
}

export class MemoryOpportunityStore implements OpportunityStore {
  private records=new Map<string,OpportunityRecord>();
  async list(){return [...this.records.values()].map(record=>structuredClone(record));}
  async get(id:string){const record=this.records.get(id); return record ? structuredClone(record) : undefined;}
  async upsert(record:OpportunityRecord){this.records.set(record.id,structuredClone(record));}
  async remove(id:string){this.records.delete(id);}
}

export class LocalStorageOpportunityStore implements OpportunityStore {
  constructor(private readonly key='connectos.opportunities.v1',private readonly storage:Storage|undefined=typeof localStorage==='undefined'?undefined:localStorage){}
  private read():OpportunityRecord[]{
    if(!this.storage)return [];
    try{const parsed=JSON.parse(this.storage.getItem(this.key) ?? '[]'); return Array.isArray(parsed)?parsed:[];}catch{return [];} 
  }
  private write(records:OpportunityRecord[]){if(this.storage)this.storage.setItem(this.key,JSON.stringify(records));}
  async list(){return this.read();}
  async get(id:string){return this.read().find(record=>record.id===id);}
  async upsert(record:OpportunityRecord){const records=this.read(); const index=records.findIndex(item=>item.id===record.id); if(index===-1)records.push(record); else records[index]=record; this.write(records);}
  async remove(id:string){this.write(this.read().filter(record=>record.id!==id));}
}
