import type {SkillDefinition} from './skill';
export class SkillRegistry{private skills=new Map<string,SkillDefinition>();register(s:SkillDefinition){this.skills.set(s.id,s);}get(id:string){return this.skills.get(id);}list(){return [...this.skills.values()];}}
