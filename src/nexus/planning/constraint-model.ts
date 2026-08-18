export type ConstraintKind = 'time' | 'budget' | 'location' | 'risk' | 'requirement';

export interface NexusConstraint {
  kind: ConstraintKind;
  value: string;
  blocking: boolean;
}

export function blockingConstraints(items: NexusConstraint[]): NexusConstraint[] {
  return items.filter(item => item.blocking);
}
