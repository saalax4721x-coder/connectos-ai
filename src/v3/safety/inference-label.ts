export const labelInference=(confidence:number)=>confidence>=.85?'high-confidence-inference':confidence>=.6?'inference':'low-confidence-inference';
