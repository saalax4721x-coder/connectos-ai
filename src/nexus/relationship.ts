import type {GraphRepository} from '../graph/repository';
import type {GraphEdge} from '../graph/edge';

export interface WarmPath {
  edges: GraphEdge[];
  confidence: number;
  source: string[];
  authorized: boolean;
}

export interface IntroductionConsentProvider {
  isAuthorized(connectorId: string, targetId: string): boolean;
}

export async function findWarmPaths(repository: GraphRepository, from: string, to: string, maxDepth = 3, consent?: IntroductionConsentProvider): Promise<WarmPath[]> {
  const paths = await repository.findPath(from, to, maxDepth);
  return paths.map((edges) => ({
    edges,
    confidence: edges.length ? edges.reduce((sum, edge) => sum + edge.confidence, 0) / edges.length : 0,
    source: edges.map((edge) => edge.source),
    authorized: edges.every((edge) => edge.type !== 'can-introduce' || Boolean(consent?.isAuthorized(edge.from, edge.to))),
  })).filter((path) => path.authorized);
}
