import type { EdgeType, GraphEdge } from './edge';

export interface GraphQuery {
  start:string;
  target?:string;
  edgeTypes?:EdgeType[];
  depth:number;
  limit:number;
  minConfidence?:number;
  minStrength?:number;
  includeStale?:boolean;
}

export interface GraphResult {
  nodes:string[];
  edges:GraphEdge[];
  provenance:string[];
  paths:Array<{nodes:string[];edges:GraphEdge[];score:number}>;
  truncated:boolean;
}

export function validateQuery(query:GraphQuery):GraphQuery {
  if(!query.start.trim()) throw new Error('graph query requires start');
  if(query.target!==undefined&&!query.target.trim()) throw new Error('target cannot be empty');
  if(!Number.isInteger(query.depth)||query.depth<0||query.depth>12) throw new Error('depth must be an integer between 0 and 12');
  if(!Number.isInteger(query.limit)||query.limit<1||query.limit>500) throw new Error('limit must be between 1 and 500');
  if(query.minConfidence!==undefined&&(query.minConfidence<0||query.minConfidence>1)) throw new Error('minConfidence must be between 0 and 1');
  if(query.minStrength!==undefined&&(query.minStrength<0||query.minStrength>1)) throw new Error('minStrength must be between 0 and 1');
  return query;
}
