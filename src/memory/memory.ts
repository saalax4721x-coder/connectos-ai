import type { MemoryScope, MemoryItem } from './types';

export type { MemoryScope, MemoryItem } from './types';

export interface LegacyMemory {
  id:string;
  layer:MemoryScope;
  subjectId:string;
  content:string;
  source:string;
  confidence:number;
  createdAt:string;
  expiresAt?:string;
}

export const toMemoryItem=(memory:LegacyMemory):MemoryItem<string>=>({
  id:memory.id,
  scope:memory.layer,
  subjectId:memory.subjectId,
  value:memory.content,
  createdAt:memory.createdAt,
  updatedAt:memory.createdAt,
  importance:0.5,
  confidence:memory.confidence,
  sensitivity:'private',
  tags:[],
  status:'active',
  provenance:{sourceId:memory.source,observedAt:memory.createdAt,confidence:memory.confidence},
  expiresAt:memory.expiresAt
});
