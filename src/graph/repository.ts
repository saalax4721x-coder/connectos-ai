import type { GraphEdge } from './edge';
import type { PersonNode } from './person';
import type { CompanyNode } from './company';

export type GraphNode=PersonNode|CompanyNode;
export interface GraphRepository { getNode(id:string):Promise<GraphNode|undefined>; getEdges(nodeId:string):Promise<GraphEdge[]>; findPath(from:string,to:string,maxDepth:number):Promise<GraphEdge[][]>; }
export class InMemoryGraph implements GraphRepository { private nodes=new Map<string,GraphNode>(); private edges:GraphEdge[]=[]; addNode(node:GraphNode){this.nodes.set(node.id,node);return this;} addEdge(edge:GraphEdge){this.edges.push(edge);return this;} async getNode(id:string){return this.nodes.get(id);} async getEdges(nodeId:string){return this.edges.filter(e=>e.from===nodeId||e.to===nodeId);} async findPath(from:string,to:string,maxDepth:number){const out:GraphEdge[][]=[]; const walk=(id:string,path:GraphEdge[],seen:Set<string>)=>{if(path.length>maxDepth||out.length>=25)return;if(id===to){out.push(path);return;}for(const e of this.edges.filter(x=>x.from===id&&!seen.has(x.to))){walk(e.to,[...path,e],new Set(seen).add(e.to));}};walk(from,[],new Set([from]));return out;} }
