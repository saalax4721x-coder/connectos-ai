export interface IntentSignalDefinition { id:string; label:string; weight:number; source:string; }
export const intentSignals:IntentSignalDefinition[]=[];
export function registerIntentSignal(signal:IntentSignalDefinition){intentSignals.push(signal);}