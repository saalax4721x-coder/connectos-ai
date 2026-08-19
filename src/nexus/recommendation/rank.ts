import type {Recommendation} from './recommendation-contract';
export const rankRecommendations=(items:Recommendation[])=>[...items].sort((a,b)=>b.confidence-a.confidence);
