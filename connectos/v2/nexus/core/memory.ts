export interface MemoryRecord { id: string; scope: string; key: string; value: unknown; source: string; confidence: 'LOW' | 'MEDIUM' | 'HIGH'; createdAt: string; lastVerified?: string; expiresAt?: string; }

export function retrieveMemory(records: MemoryRecord[], scopes: string[], key?: string, now = Date.now()): MemoryRecord[] {
  return records.filter((record) => scopes.includes(record.scope) && (!key || record.key === key) && (!record.expiresAt || Date.parse(record.expiresAt) > now));
}

export function upsertMemory(records: MemoryRecord[], record: MemoryRecord): MemoryRecord[] {
  const existing = records.findIndex((item) => item.scope === record.scope && item.key === record.key);
  if (existing < 0) return [...records, record];
  const next = records.slice(); next[existing] = record; return next;
}
