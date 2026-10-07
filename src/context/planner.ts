import type {GoalIntent} from '../intent/schema';
import type {ContextNeed,ContextPlan} from './schema';

const scopes=['user','relationship','company','opportunity','project','deal'] as const;

export const planContext=(intent:GoalIntent,subjectId?:string):ContextPlan=>{
  const needs:ContextNeed[]=[];
  const query=[intent.goal,intent.outcome,intent.location,intent.industry,intent.timeline,...intent.skillsRequired,...intent.preferences].filter(Boolean).join(' ');
  for(const scope of scopes){
    if(scope==='user'&&subjectId) needs.push({id:'memory:user',kind:'memory',priority:'important',reason:'Personal preferences and prior decisions can change the correct plan.',query,scope,subjectId});
    else if(scope!=='user'&&(intent.companiesRequired.length||intent.peopleRequired.length||intent.industry||intent.goal)) needs.push({id:`memory:${scope}`,kind:'memory',priority:scope==='opportunity'||scope==='deal'?'important':'optional',reason:`Existing ${scope} context may constrain or accelerate execution.`,query,scope,subjectId});
  }
  for(const entity of [...intent.peopleRequired,...intent.companiesRequired]){
    needs.push({id:`graph:${entity}`,kind:'graph',priority:'important',reason:`Relationship paths may reveal relevant connections for ${entity}.`,query:intent.raw,entity});
  }
  const gaps:string[]=[];
  if(!intent.outcome) gaps.push('success outcome is not explicit');
  if(intent.confidence<0.65) gaps.push('intent confidence is below the context threshold');
  return {intentId:intent.id,needs,gaps:[...new Set(gaps)]};
};
