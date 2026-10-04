export interface AgentEvaluationPolicy { required:boolean; minScore?:number; evaluatorId?:string; }
export interface AgentFallbackPolicy { agentIds:string[]; maxHops:number; }
export interface AgentLifecycle { createdAt:string; updatedAt:string; owner:string; }
export interface AgentDefinition {
 id:string; name:string; version:string; domain:string; skills:string[]; tools:string[]; permissions:string[]; memory:string[];
 inputSchema:string; outputSchema:string; status:'active'|'disabled'|'experimental';
 evaluation?:AgentEvaluationPolicy; fallback?:AgentFallbackPolicy; lifecycle?:AgentLifecycle;
}
