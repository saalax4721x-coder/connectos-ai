import type {AgentDefinition} from './agent';
import type {AgentContext} from './context';

export type RuntimeAgent = AgentDefinition & {
  capabilities:string[];
  execute(ctx:AgentContext,input:unknown):Promise<unknown>;
};

export class RuntimeAgentRegistry {
  private agents=new Map<string,RuntimeAgent>();
  register(agent:RuntimeAgent){
    if(this.agents.has(agent.id)) throw new Error(`agent already registered: ${agent.id}`);
    this.agents.set(agent.id,agent);
    return this;
  }
  resolve(id:string){const agent=this.agents.get(id);if(!agent) throw new Error(`agent not found: ${id}`);return agent;}
  list(){return [...this.agents.values()];}
}
