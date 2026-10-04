import type {AgentDefinition} from './agent';
export class AgentRegistry {
 private agents=new Map<string,AgentDefinition>();
 register(agent:AgentDefinition){
  if(!agent.id.trim()||!agent.name.trim()||!agent.version.trim()||!agent.domain.trim()) throw new Error('agent identity is incomplete');
  if(this.agents.has(agent.id)) throw new Error('agent already registered: '+agent.id);
  this.agents.set(agent.id,Object.freeze({...agent,skills:[...agent.skills],tools:[...agent.tools],permissions:[...agent.permissions],memory:[...agent.memory]})); return this;
 }
 get(id:string){return this.agents.get(id);}
 list(){return [...this.agents.values()];}
}
