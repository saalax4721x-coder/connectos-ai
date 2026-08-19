export type RequirementKind = 'must' | 'should' | 'preference' | 'exclusion';
export function isBlockingRequirement(kind: RequirementKind): boolean { return kind === 'must' || kind === 'exclusion'; }
