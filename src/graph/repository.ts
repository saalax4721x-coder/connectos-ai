import { decayedStrength, validateEdge, type GraphEdge } from './edge';
import { validatePerson, type PersonNode } from './person';
import { validateCompany, type CompanyNode } from './company';
import { validateQuery, type GraphQuery, type GraphResult } from './query';

export type GraphNode=PersonNode|CompanyNode;
export interface GraphRepository {
  getNode(id:string):Promise<GraphNode|undefined>;
  upsertNode(node:GraphNode):Promise<void>;
  getEdges(nodeId:string):Promise<GraphEdge[]>;
  upsertEdge(edge:GraphEdge):Promise<void>;
  findPath(from:string,to:string,maxDepth:number):Promise<GraphEdge[][]>;
  query(query:GraphQuery):Promise<GraphResult>;
}

export class InMemoryGraph implements GraphRepository {
  private nodes=new Map<string,GraphNode>();
  private edges=new Map<string,GraphEdge>();
  addNode(node:GraphNode){this.upsertNodeSync(node);return this;}
  addEdge(edge:GraphEdge){this.upsertEdgeSync(edge);return this;}
  async upsertNode(node:GraphNode){this.upsertNodeSync(node);}
  async upsertEdge(edge:GraphEdge){this.upsertEdgeSync(edge);}
  async getNode(id:string){return this.nodes.get(id);}
  async getEdges(nodeId:string){return [...this.edges.values()].filter(e=>e.active&&(e.from===nodeId||e.to===nodeId));}
  async findPath(from:string,to:string,maxDepth:number){
    if(!Number.isInteger(maxDepth)||maxDepth<0||maxDepth>12) throw new Error('maxDepth must be between 0 and 12');
    const out:GraphEdge[][]=[];
    const walk=(id:string,path:GraphEdge[],seen:Set<string>)=>{if(path.length>maxDepth||out.length>=25)return;if(id===to){out.push(path);return;}for(const e of this.edges.values()){if(!e.active||e.from!==id||seen.has(e.to))continue;walk(e.to,[...path,e],new Set(seen).add(e.to));}};
    if(this.nodes.has(from)&&this.nodes.has(to)) walk(from,[],new Set([from]));
    return out;
  }
  async query(input:GraphQuery):Promise<GraphResult>{
    const q=validateQuery(input), edgeTypes=new Set(q.edgeTypes??[]), minConfidence=q.minConfidence??0, minStrength=q.minStrength??0;
    const eligible=(e:GraphEdge)=>e.active&&e.confidence>=minConfidence&&e.strength>=minStrength&&(edgeTypes.size===0||edgeTypes.has(e.type))&&(q.includeStale||decayedStrength(e)>=minStrength);
    const edges=[...this.edges.values()].filter(eligible), paths:Array<{nodes:string[];edges:GraphEdge[];score:number}>=[];
    const walk=(id:string,nodes:string[],path:GraphEdge[])=>{if(paths.length>=q.limit||path.length>=q.depth)return;for(const e of edges.filter(x=>x.from===id)){if(nodes.includes(e.to))continue;const next=[...path,e],nextNodes=[...nodes,e.to];if(!q.target||e.to===q.target)paths.push({nodes:nextNodes,edges:next,score:next.reduce((s,x)=>s*x.confidence*x.strength,1)});if(!q.target||e.to!==q.target)walk(e.to,nextNodes,next);if(paths.length>=q.limit)return;}};
    if(this.nodes.has(q.start))walk(q.start,[q.start],[]);
    paths.sort((a,b)=>b.score-a.score);
    const chosenEdges=new Map<string,GraphEdge>();for(const path of paths)for(const edge of path.edges)chosenEdges.set(edge.id,edge);
    return {nodes:[...new Set(paths.flatMap(p=>p.nodes))],edges:[...chosenEdges.values()],provenance:[...chosenEdges.values()].flatMap(e=>e.provenance.map(p=>p.sourceId??p.sourceUrl??p.kind)),paths,truncated:paths.length>=q.limit};
  }
  private upsertNodeSync(node:GraphNode){if('displayName' in node)validatePerson(node);else validateCompany(node);this.nodes.set(node.id,node);}
  private upsertEdgeSync(edge:GraphEdge){validateEdge(edge);if(!this.nodes.has(edge.from)||!this.nodes.has(edge.to))throw new Error('graph edge endpoints must exist');this.edges.set(edge.id,edge);}
}
