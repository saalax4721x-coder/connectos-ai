export interface SearchResult<T=unknown>{id:string;entity:T;score:number;matchedTerms:string[];sourceIds:string[];confidence:number;explanation:string;}
