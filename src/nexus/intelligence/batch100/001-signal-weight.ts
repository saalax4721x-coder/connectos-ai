export const signalWeight = (confidence:number, relevance:number) => Math.max(0, Math.min(1, confidence * relevance));
