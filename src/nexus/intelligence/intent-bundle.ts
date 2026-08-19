import type { IntentSignal } from './intent-signals';
import type { IntentEvidence } from './intent-evidence';
export interface IntentBundle { id:string; signals:IntentSignal[]; evidence:IntentEvidence[]; version:number; }
export const emptyIntentBundle=(id:string):IntentBundle=>({id,signals:[],evidence:[],version:1});
