import type {AgentContext} from './context';
import type {AgentDefinition} from './agent';

export interface AgentPolicyDecision {allowed:boolean;requiresApproval:boolean;reason:string;}

const consequentialTools = new Set(['send-message','send-email','create-deal','publish','delete','transfer']);

export function authorizeAgentAction(agent: AgentDefinition, ctx: AgentContext, tool?: string): AgentPolicyDecision {
  if (agent.status !== 'active') return {allowed:false,requiresApproval:false,reason:'agent is not active'};
  if (tool && !agent.tools.includes(tool)) return {allowed:false,requiresApproval:false,reason:`tool not declared by agent: ${tool}`};
  if (tool && consequentialTools.has(tool)) {
    const approved = ctx.approvals.includes(tool) || ctx.approvals.includes('*');
    return approved
      ? {allowed:true,requiresApproval:false,reason:'consequential action explicitly approved'}
      : {allowed:false,requiresApproval:true,reason:'consequential action requires explicit approval'};
  }
  return {allowed:true,requiresApproval:false,reason:'policy checks passed'};
}
