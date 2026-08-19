import type { IntentSnapshot } from './intent-snapshot';
export interface IntentDiff { added:string[]; removed:string[]; changed:string[]; }
export function diffIntent(previous:IntentSnapshot, current:IntentSnapshot):IntentDiff { return {added: current.domain !== previous.domain ? [current.domain] : [], removed: current.domain !== previous.domain ? [previous.domain] : [], changed: current.text !== previous.text ? ['text'] : []}; }
