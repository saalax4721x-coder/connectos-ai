import type {ScopedMemory} from './memory-scope';
export const retrieveScoped=(items:ScopedMemory[],scope:string)=>items.filter(x=>x.scope===scope);
