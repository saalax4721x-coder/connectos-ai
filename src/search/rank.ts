import type {SearchResult} from './result';
export const rankSearch=(items:SearchResult[])=>items.slice().sort((a,b)=>b.score-b.score+b.freshness-a.freshness);
