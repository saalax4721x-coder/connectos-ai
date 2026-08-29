import { assertConfidence, type Provenance } from '../core/provenance';

export type EdgeType='knows'|'works-with'|'worked-with'|'invested-in'|'advised'|'partnered-with'|'collaborated-with'|'can-introduce'|'shared-project';

export interface GraphEdge {
  id:string;
  from:string;
  to:string;
  type:EdgeType;
  source:string;
  confidence:number;
  observedAt:string;
  lastVerifiedAt?:string;
  provenance:Provenance[];
  strength:number;
  consent?:'unknown'|'requested'|'granted'|'declined';
  active:boolean;
}

export function validateEdge(edge:GraphEdge):GraphEdge {
  if(!edge.id||!edge.from||!edge.to) throw new Error('graph edge requires id, from and to');
  if(edge.from===edge.to) throw new Error('self-referential graph edges are not allowed');
  if(!edge.source) throw new Error('graph edge requires a source');
  assertConfidence(edge.confidence);
  if(!Number.isFinite(edge.strength)||edge.strength<0||edge.strength>1) throw new Error('edge strength must be between 0 and 1');
  if(!edge.observedAt||Number.isNaN(Date.parse(edge.observedAt))) throw new Error('edge observedAt must be an ISO timestamp');
  if(edge.lastVerifiedAt&&Number.isNaN(Date.parse(edge.lastVerifiedAt))) throw new Error('edge lastVerifiedAt must be an ISO timestamp');
  return edge;
}

export function decayedStrength(edge:Pick<GraphEdge,'strength'|'observedAt'>,at=new Date().toISOString(),halfLifeDays=180):number {
  if(halfLifeDays<=0) throw new Error('halfLifeDays must be positive');
  const ageDays=Math.max(0,(Date.parse(at)-Date.parse(edge.observedAt))/86400000);
  return Math.max(0,Math.min(1,edge.strength*Math.pow(.5,ageDays/halfLifeDays)));
}
