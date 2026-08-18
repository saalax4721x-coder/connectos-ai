export const runId=(prefix='run')=>`${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,10)}`;
