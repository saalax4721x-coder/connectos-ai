import type {Workflow} from './workflow'; export const readySteps=(w:Workflow,done:Set<string>)=>w.steps.filter(s=>!done.has(s.id)&&s.dependsOn.every(d=>done.has(d)));
