import type { RequirementPriority } from './requirement-priority';
export function chooseRequirement(left: RequirementPriority, right: RequirementPriority): RequirementPriority { return left.weight >= right.weight ? left : right; }
