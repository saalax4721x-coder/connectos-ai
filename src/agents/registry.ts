import type {AgentDefinition} from './agent';
export class AgentRegistry{private agents=new Map<string,AgentDefinition>();register(a:AgentDefinition){this.agents.set(a.id,a);}get(id:string){return this.agents.get(id);}list(){return [...this.agents.values()];}}
