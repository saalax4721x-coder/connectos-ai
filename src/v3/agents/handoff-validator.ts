import type {AgentHandoff} from './handoff-envelope'; export const validHandoff=(h:AgentHandoff)=>Boolean(h.runId&&h.fromAgent&&h.toAgent&&h.reason&&h.fromAgent!==h.toAgent);
