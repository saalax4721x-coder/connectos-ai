import type {GoalIntent} from '../intent/schema';
import type {MemoryRetrieval} from '../memory/types';
import type {BridgePath,GraphService} from '../graph/service';

export type ContextNeedKind='memory'|'graph';
export type ContextNeedPriority='required'|'important'|'optional';

export interface ContextNeed{
  id:string;
  kind:ContextNeedKind;
  priority:ContextNeedPriority;
  reason:string;
  query:string;
  scope?:'user'|'relationship'|'company'|'opportunity'|'project'|'deal'|'agent'|'workflow';
  subjectId?:string;
  entity?:string;
}

export interface ContextPlan{
  intentId:string;
  needs:ContextNeed[];
  gaps:string[];
}

export interface ContextConflict{
  kind:'memory';
  memoryIds:string[];
  reason:string;
}

export interface ContextBundle{
  plan:ContextPlan;
  memories:MemoryRetrieval[];
  graphPaths:BridgePath[];
  gaps:string[];
  conflicts:ContextConflict[];
  confidence:number;
  ready:boolean;
}

export interface ContextResolverOptions{
  memory:Pick<import('../memory/service').MemoryService,'retrieve'>;
  graph?:GraphService;
  now?:Date;
  entitySeeds?:Record<string,string>;\n  graphTargets?:Record<string,string>;
}

export type ContextGraphResolver=Pick<GraphService,'findWarmPaths'>;
