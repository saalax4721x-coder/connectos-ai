export interface AgentEvaluationInput { agentId:string; requestId:string; input:unknown; output:unknown; error?:string; }
export interface AgentEvaluationResult { score:number; passed:boolean; reasons:string[]; evaluatorId:string; evaluatedAt:string; }
export interface AgentEvaluator { id:string; evaluate(input:AgentEvaluationInput):Promise<AgentEvaluationResult>|AgentEvaluationResult; }
export class ThresholdAgentEvaluator implements AgentEvaluator {
 constructor(public readonly id:string,private readonly threshold:number=0.7,private readonly now:()=>string=()=>new Date().toISOString()){}
 evaluate(input:AgentEvaluationInput):AgentEvaluationResult { const passed=!input.error; return {score:passed?1:0,passed:passed&&this.threshold<=1,reasons:passed?['execution completed without error']:['execution returned an error'],evaluatorId:this.id,evaluatedAt:this.now()}; }
}
