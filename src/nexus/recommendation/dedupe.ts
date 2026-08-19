import type {Recommendation} from './recommendation-contract';
export const dedupeRecommendations=(items:Recommendation[])=>Array.from(new Map(items.map(x=>[x.id,x])).values());
