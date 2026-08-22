export type NexusEventType = 'INTENT' | 'PLAN' | 'ROUTE' | 'EXECUTION' | 'APPROVAL' | 'MEMORY' | 'OUTCOME' | 'ERROR';
export interface NexusEvent { id: string; type: NexusEventType; contextId: string; timestamp: string; status: 'STARTED' | 'COMPLETED' | 'FAILED'; metadata: Record<string, unknown>; }

export interface NexusEventSink { emit(event: NexusEvent): void; }
export class InMemoryNexusEventSink implements NexusEventSink {
  readonly events: NexusEvent[] = [];
  emit(event: NexusEvent): void { this.events.push(event); }
}
