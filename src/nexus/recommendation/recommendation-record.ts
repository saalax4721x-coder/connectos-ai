import type { NextActionRecommendation } from './next-action';
export interface RecommendationRecord { id:string; targetId:string; whyYou:string; whyThem:string; whyNow:string; nextAction:NextActionRecommendation; createdAt:string; }
