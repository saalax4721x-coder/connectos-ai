export interface InferenceLabel { state:'aiInference'; confidence:number; basis:string[]; }
export function inferenceLabel(confidence:number, basis:string[]):InferenceLabel { return {state:'aiInference',confidence:Math.max(0,Math.min(1,confidence)),basis}; }
