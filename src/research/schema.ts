import type {SearchQuery} from '../search/query';
import type {SearchResult} from '../search/result';

export interface ResearchEvidence {
  id:string;
  entityId:string;
  claim:string;
  value:string;
  sourceIds:string[];
  observedAt:string;
  confidence:number;
  freshness:number;
}

export interface ResearchConflict {
  entityId:string;
  claim:string;
  evidenceIds:string[];
  values:string[];
  reason:string;
}

export interface ResearchFinding {
  entityId:string;
  claim:string;
  value:string;
  confidence:number;
  evidenceIds:string[];
  sourceIds:string[];
  staleEvidenceIds:string[];
}

export interface ResearchRequest {
  query:SearchQuery;
  maxResults?:number;
  minimumConfidence?:number;
  minimumFreshness?:number;
}

export interface ResearchProvider {
  search(query:SearchQuery,limit:number):Promise<SearchResult[]>;
  evidence(result:SearchResult):Promise<ResearchEvidence[]>;
}

export interface ResearchResult {
  findings:ResearchFinding[];
  evidence:ResearchEvidence[];
  conflicts:ResearchConflict[];
  gaps:string[];
  ready:boolean;
}
