export type MemoryScope='user'|'relationship'|'company'|'opportunity'|'project'|'deal'|'agent'|'workflow';
export type MemorySensitivity='public'|'private'|'restricted';
export type MemoryStatus='active'|'superseded'|'expired'|'deleted';
export type MemoryConflictResolution='newer'|'higher-confidence'|'manual';

export interface MemoryProvenance {
  sourceId:string;
  observedAt:string;
  confidence:number;
}

export interface MemoryItem<T=unknown> {
  id:string;
  scope:MemoryScope;
  subjectId:string;
  value:T;
  createdAt:string;
  updatedAt:string;
  importance:number;
  confidence:number;
  sensitivity:MemorySensitivity;
  tags:string[];
  status:MemoryStatus;
  provenance?:MemoryProvenance;
  expiresAt?:string;
  supersedesId?:string;
}

export interface MemoryQuery {
  scope:MemoryScope;
  subjectId:string;
  tags?:string[];
  text?:string;
  includeExpired?:boolean;
  includeSuperseded?:boolean;
  limit?:number;
  now?:string;
}

export interface MemoryRetrieval<T=unknown> extends MemoryItem<T> {
  score:number;
  reasons:string[];
}

export interface MemoryRetentionPolicy {
  scope:MemoryScope;
  ttlMs?:number;
  userDeletable:boolean;
  maxItemsPerSubject:number;
}

export interface MemoryConflict {
  existingId:string;
  incomingId:string;
  reason:'same-subject'|'same-tag-cluster';
  resolution:MemoryConflictResolution;
}
