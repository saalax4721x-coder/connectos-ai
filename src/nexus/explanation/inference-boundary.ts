export const inferenceLabel=(confidence:number)=>confidence>=.85?'strong-inference':confidence>=.6?'moderate-inference':'weak-inference';
