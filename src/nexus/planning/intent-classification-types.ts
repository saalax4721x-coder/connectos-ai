export interface IntentSignal { key:string; value:string; weight:number; }
export interface IntentClassificationResult { domain:string; confidence:number; signals:IntentSignal[]; }