import { assertConfidence } from '../core/provenance';
import type { EdgeType, GraphEdge } from './edge';
import type { GraphNode } from './repository';
import { InMemoryGraph, type GraphRepository } from './repository';

export interface BridgePath { from:string; to:string; intermediary:string[]; edges:GraphEdge[]; confidence:number; requiresConsent:boolean; }
export interface IntroductionRequest { id:string; from:string; to:string; path:BridgePath; status:'pending'|'approved'|'declined'|'cancelled'; requestedAt:string; resolvedAt?:string; }

export interface GraphService {
  addNode(node:GraphNode):Promise<void>;
  addRelationship(input:{id:string;from:string;to:string;type:EdgeType;source:string;confidence:number;observedAt:string;provenance:GraphEdge['provenance'];strength:number;consent?:GraphEdge['consent']}):Promise<void>;
  findWarmPaths(from:string,to:string,maxDepth?:number):Promise<BridgePath[]>;
  requestIntroduction(from:string,to:string):Promise<IntroductionRequest|undefined>;
  resolveIntroduction(id:string,status:'approved'|'declined'|'cancelled'):Promise<IntroductionRequest|undefined>;
}

export function createGraphService(repository:GraphRepository=new InMemoryGraph()):GraphService {
  const requests=new Map<string,IntroductionRequest>();
  return {
    async addNode(node){await repository.upsertNode(node);},
    async addRelationship(input){assertConfidence(input.confidence);await repository.upsertEdge({...input,active:true,id:input.id});},
    async findWarmPaths(from,to,maxDepth=4){
      const paths=await repository.findPath(from,to,maxDepth);
      return paths.filter(path=>path.length>0).map(path=>({from,to,intermediary:path.slice(0,-1).map(e=>e.from).slice(1),edges:path,confidence:path.reduce((s,e)=>s*e.confidence*e.strength,1),requiresConsent:path.some(e=>e.type==='can-introduce'&&e.consent!=='granted')})).sort((a,b)=>b.confidence-a.confidence);
    },
    async requestIntroduction(from,to){
      const path=(await this.findWarmPaths(from,to,4)).find(p=>p.requiresConsent||p.edges.length>0);
      if(!path)return undefined;
      const request={id:`intro_${crypto.randomUUID()}`,from,to,path,status:'pending' as const,requestedAt:new Date().toISOString()};requests.set(request.id,request);return request;
    },
    async resolveIntroduction(id,status){const current=requests.get(id);if(!current)return undefined;if(current.status!=='pending')throw new Error('introduction request is already resolved');const updated={...current,status,resolvedAt:new Date().toISOString()};requests.set(id,updated);return updated;}
  };
}
