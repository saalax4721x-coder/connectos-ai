import type {SearchResult} from './search-result'; export const rankSearch=(r:SearchResult[])=>[...r].sort((a,b)=>b.score*b.confidence-a.score*a.confidence);
