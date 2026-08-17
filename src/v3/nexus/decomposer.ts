import type {NexusRequest} from './nexus-request'; export interface GoalDecomposer{decompose(request:NexusRequest):Promise<{goal:string;requirements:string[];agents:string[]}>;}
