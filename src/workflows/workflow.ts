export type WorkflowStepKind='sequential'|'parallel'|'conditional'|'loop'|'approval'|'handoff'|'schedule'|'trigger';
export interface WorkflowStepDefinition {
  id:string; name:string; kind:WorkflowStepKind; dependsOn:string[]; agentId?:string; requiresApproval?:boolean; retryLimit?:number;
}
export interface Workflow { id:string; name:string; steps:WorkflowStepDefinition[]; version:number; }
export function validateWorkflow(workflow:Workflow):Workflow {
  if(!workflow.id.trim()||!workflow.name.trim()) throw new Error('workflow identity is incomplete');
  const ids=new Set<string>();
  for(const step of workflow.steps){
    if(!step.id.trim()||!step.name.trim()) throw new Error('workflow step identity is incomplete');
    if(ids.has(step.id)) throw new Error('duplicate workflow step: '+step.id);
    ids.add(step.id);
    if((step.retryLimit??0)<0||!Number.isInteger(step.retryLimit??0)) throw new Error('workflow retryLimit must be a non-negative integer');
  }
  for(const step of workflow.steps) for(const dep of step.dependsOn){
    if(dep===step.id) throw new Error('workflow cannot depend on itself: '+step.id);
    if(!ids.has(dep)) throw new Error('workflow dependency not found: '+dep);
  }
  const visiting=new Set<string>(),visited=new Set<string>();
  const visit=(id:string)=>{
    if(visiting.has(id)) throw new Error('workflow contains a dependency cycle');
    if(visited.has(id)) return;
    visiting.add(id);
    for(const dep of workflow.steps.find(s=>s.id===id)!.dependsOn) visit(dep);
    visiting.delete(id); visited.add(id);
  };
  for(const step of workflow.steps) visit(step.id);
  return {...workflow,steps:workflow.steps.map(s=>({...s,dependsOn:[...s.dependsOn]}))};
}
export function instantiateRun(workflow:Workflow,goalId:string,runId='run_'+crypto.randomUUID()):import('./types').WorkflowRun {
  const valid=validateWorkflow(workflow);
  return {id:runId,goalId,state:'pending',version:1,steps:valid.steps.map(s=>({id:s.id,name:s.name,state:'pending',dependsOn:[...s.dependsOn],retryLimit:s.retryLimit??0,attempts:0,agentId:s.agentId,requiresApproval:s.requiresApproval}))};
}