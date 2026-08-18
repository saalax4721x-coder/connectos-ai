export interface Requirement {
  id: string;
  category: string;
  value: unknown;
  confidence: number;
}

export interface RequirementSet {
  requirements: Requirement[];
}

export function addRequirement(set: RequirementSet, requirement: Requirement): RequirementSet {
  return { requirements: [...set.requirements, requirement] };
}
