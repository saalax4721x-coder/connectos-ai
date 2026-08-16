import type {MatchCandidate} from './match';
export const rankMatches=(items:MatchCandidate[])=>items.slice().sort((a,b)=>(b.fit+b.access+b.timing+b.confidence)-(a.fit+a.access+a.timing+a.confidence));
