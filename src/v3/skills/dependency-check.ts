import type {SkillDefinition} from './skill'; export const missingDependencies=(s:SkillDefinition,available:Set<string>)=>s.dependencies.filter(d=>!available.has(d));
