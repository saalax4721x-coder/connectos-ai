import type {HandoffContext} from './handoff-context';
export const validHandoff=(x:HandoffContext)=>Boolean(x.goalId&&x.intentId&&x.completed.every(Boolean)&&x.provenance.every(Boolean));
