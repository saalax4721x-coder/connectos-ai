export type SourceQuality = 'verified' | 'public' | 'selfReported' | 'community' | 'inferred' | 'unknown';
export const sourceQualityWeight: Record<SourceQuality, number> = {verified:1,'public':0.9,selfReported:0.7,community:0.6,inferred:0.4,unknown:0};
