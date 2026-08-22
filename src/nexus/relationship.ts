import type {GraphRepository} from '../graph/repository';
import type {GraphEdge} from '../graph/edge';
import {canIntroduce} from '../bridge/consent';

export interface WarmPath {
  edges: GraphEdge[];
  confidence: number;
  source: string[];
  authorized: boolean;
}

export async function findWarmPaths(repository: GraphRepository, from: string, to: string, maxDepth = 3): Promise<WarmPath[]> {
  const paths = await repository.findPath(from, to, maxDepth);
  return paths.map((edges) => ({
    edges,
    confidence: edges.length ? edges.reduce((sum, edge) => sum + edge.confidence, 0) / edges.length : 0,
    source: edges.map((edge) => edge.source),
    authorized: edges.every((edge) => edge.type !== 'can-introduce' || canIntroduce(edge.from, edge.to)),
  })).filter((path) => path.authorized);
}
