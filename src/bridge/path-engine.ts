import type { GraphEdge } from '../graph/edge';
export interface RankedPath { edges:GraphEdge[]; score:number; reasons:string[]; }
export function rankPaths(paths:GraphEdge[][]):RankedPath[]{return paths.map(edges=>{const confidence=edges.reduce((a,e)=>a*e.confidence,1); const lengthPenalty=1/(1+Math.max(0,edges.length-1)*0.18); const score=confidence*lengthPenalty; return {edges,score,reasons:[`relationship confidence ${(confidence*100).toFixed(0)}%`,`path length ${edges.length}`]};}).sort((a,b)=>b.score-a.score);}
