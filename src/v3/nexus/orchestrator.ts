import type {NexusPlan} from './plan'; export interface NexusOrchestrator{plan(input:string,userId:string):Promise<NexusPlan>;execute(plan:NexusPlan):Promise<{runId:string;status:string}>;}
