import type {GoalIntent} from '../intent/schema';
import type {ContextBundle,ContextResolverOptions,ContextConflict} from './schema';
import {planContext} from './planner';

const clamp=(n:number)=>Math.max(0,Math.min(1,n));

export const resolveContext=async(intent:GoalIntent,options:ContextResolverOptions):Promise<ContextBundle>=>{
  const plan=planContext(intent,options.subjectId);
  const memories=[];
  const graphPaths=[];
  const gaps=[...plan.gaps];
  const conflicts:ContextConflict[]=[];
  for(const need of plan.needs){
    if(need.kind==='memory'&&need.scope&&need.subjectId){
      const found=await options.memory.retrieve({scope:need.scope,subjectId:need.subjectId,limit:10,now:(options.now??new Date()).toISOString()},need.query);
      memories.push(...found);
      const grouped=new Map<string,typeof found>();
      for(const item of found)for(const tag of item.tags){const group=grouped.get(tag)??[];group.push(item);grouped.set(tag,group);}
      for(const [tag,items] of grouped)if(new Set(items.map(item=>JSON.stringify(item.value))).size>1&&items.length>1)conflicts.push({kind:'memory',memoryIds:[...new Set(items.map(item=>item.id))],reason:`competing values for tag ${tag}`});
    }
    if(need.kind==='graph'&&need.entity){
      const seed=options.entitySeeds?.[need.entity];
      const target=options.graphTargets?.[need.entity];
      if(options.graph&&seed&&target){
        const paths=await options.graph.findWarmPaths(seed,target,4);
        if(paths.length===0)gaps.push(`no relationship path found for ${need.entity}`); else graphPaths.push(...paths);
      }else gaps.push(`graph identity or target for ${need.entity} is unresolved`);
    }
  }
  const uniqueMemories=[...new Map(memories.map(item=>[item.id,item])).values()].sort((a,b)=>b.score-a.score);
  const uniquePaths=[...new Map(graphPaths.map(path=>[path.edges.map(edge=>edge.id).join('>'),path])).values()];
  const missingRequired=plan.needs.some(need=>need.priority==='required'&&((need.kind==='memory'&&!need.subjectId)||(need.kind==='graph'&&(!options.entitySeeds?.[need.entity??'']||!options.graphTargets?.[need.entity??'']))));
  const coverage=plan.needs.length?Math.min(1,(uniqueMemories.length>0?0.45:0)+(uniquePaths.length>0?0.25:0)+(gaps.length===0?0.3:0)):1;
  return {plan,memories:uniqueMemories,graphPaths:uniquePaths,gaps:[...new Set(gaps)],conflicts,confidence:clamp(coverage),ready:!missingRequired&&gaps.length===0};
};