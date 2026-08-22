export type GraphEdge = { from: string; to: string };

export const adjacency = (edges: GraphEdge[]): Record<string, string[]> =>
  edges.reduce<Record<string, string[]>>((map, edge) => {
    (map[edge.from] ??= []).push(edge.to);
    return map;
  }, {});
