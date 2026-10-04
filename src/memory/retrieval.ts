import type { MemoryItem, MemoryQuery, MemoryRetrieval } from './types';

const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const tokenize=(value:string)=>value.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

const textOf=(value:unknown)=>{
  if(typeof value==='string') return value;
  try{return JSON.stringify(value);}catch{return '';}
};

export const rankMemories=(items:MemoryItem[],query:string,now=new Date()):MemoryRetrieval[]=>{
  const terms=new Set(tokenize(query));
  return items.map(item=>{
    const tokens=tokenize(textOf(item.value));
    const matches=[...terms].filter(term=>tokens.includes(term)).length;
    const relevance=terms.size?matches/terms.size:0;
    const ageMs=Math.max(0,now.getTime()-Date.parse(item.updatedAt));
    const recency=1/(1+ageMs/(1000*60*60*24*30));
    const score=clamp(relevance*0.45+item.importance*0.25+item.confidence*0.2+recency*0.1);
    const reasons:string[]=[];
    if(relevance>0) reasons.push('text-match');
    if(item.importance>=0.8) reasons.push('high-importance');
    if(item.confidence>=0.8) reasons.push('high-confidence');
    if(recency>=0.8) reasons.push('recent');
    return {...item,score,reasons};
  }).sort((a,b)=>b.score-a.score||Date.parse(b.updatedAt)-Date.parse(a.updatedAt));
};

export const retrieveMemory=(
  items:MemoryItem[],
  query:string,
  limit=10,
  now=new Date()
)=>rankMemories(items,query,now).slice(0,limit);

export const queryForRetrieval=(query:MemoryQuery):MemoryQuery=>({
  ...query,
  limit:Math.max(1,Math.min(query.limit??20,100))
});
