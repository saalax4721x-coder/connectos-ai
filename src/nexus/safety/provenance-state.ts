export type ProvenanceState = 'verified' | 'publicSource' | 'selfReported' | 'communitySignal' | 'aiInference' | 'unknown';
export function isVerified(state:ProvenanceState):boolean { return state === 'verified'; }
