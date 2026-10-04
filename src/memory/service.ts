import type { MemoryItem, MemoryQuery, MemoryRetrieval } from './types';
import {detectMemoryConflicts,chooseConflictWinner} from './conflicts';
import {rankMemories} from './retrieval';
import {retentionPolicyFor,applyRetention} from './retention';
import type {MemoryStore} from './store';

const iso=(value:string|Date)=>value instanceof Date?value.toISOString():new Date(value).toISOString();
const assertUnit=(name:string,value:number)=>{if(!Number.isFinite(value)||value<0||value>1)throw new Error(`${name} must be between 0 and 1`);};

export class MemoryService {
  constructor(private readonly store:MemoryStore){}

  async remember<T>(item:MemoryItem<T>):Promise<MemoryItem<T>>{
    if(!item.id||!item.subjectId)throw new Error('Memory id and subjectId are required');
    assertUnit('importance',item.importance); assertUnit('confidence',item.confidence);
    const normalized={...item,createdAt:iso(item.createdAt),updatedAt:iso(item.updatedAt),tags:[...new Set(item.tags)]};
    const existing=await this.store.query({scope:item.scope,subjectId:item.subjectId,includeSuperseded:true,includeExpired:true,limit:100});
    const conflicts=detectMemoryConflicts(existing,normalized);
    for(const conflict of conflicts){
      const prior=existing.find(x=>x.id===conflict.existingId);
      if(prior&&chooseConflictWinner(prior,normalized).id===normalized.id){
        await this.store.put({...prior,status:'superseded',updatedAt:normalized.updatedAt});
      }else if(prior){
        return {...prior,tags:[...prior.tags]} as MemoryItem<T>;
      }
    }
    await this.store.put(normalized);
    return normalized;
  }

  async retrieve<T=unknown>(query:MemoryQuery,searchText=''):Promise<MemoryRetrieval<T>[]>{
    const items=await this.store.query(query);
    return rankMemories(items,searchText,query.now?new Date(query.now):new Date()).slice(0,query.limit??10) as MemoryRetrieval<T>[];
  }

  async forget(id:string){
    const item=await this.store.get(id); if(!item)return;
    await this.store.put({...item,status:'deleted',updatedAt:new Date().toISOString()});
  }

  async expire(scope:MemoryItem['scope'],subjectId:string,now=new Date()){
    const items=await this.store.query({scope,subjectId,includeSuperseded:true,includeExpired:true,limit:1000,now:now.toISOString()});
    const policy=retentionPolicyFor(scope);
    for(const item of applyRetention(items,policy,now))if(item.status==='expired')await this.store.put(item);
  }
}
