import { assertConfidence, type Provenance } from '../core/provenance';
import type { CompanyNode } from './company';
import type { PersonNode } from './person';

export type IdentityCandidate={id:string;canonicalId:string;aliases:string[];confidence:number;provenance:Provenance[]};
export type IdentityResolution={canonicalId:string;confidence:number;matchedOn:string[];needsReview:boolean;provenance:Provenance[]};

const normalize=(v:string)=>v.trim().toLocaleLowerCase().normalize('NFKC').replace(/[^a-z0-9]+/g,' ');

export function resolvePersonIdentity(input:Pick<PersonNode,'displayName'|'profession'|'companyIds'>, candidates:IdentityCandidate[]):IdentityResolution|undefined {
  const name=normalize(input.displayName); if(!name)return undefined;
  let best:IdentityResolution|undefined;
  for(const candidate of candidates){
    const aliases=[candidate.canonicalId,...candidate.aliases].map(normalize);
    const nameMatch=aliases.includes(name);
    const companyMatch=input.companyIds.length>0&&input.companyIds.some(id=>candidate.aliases.includes(id));
    if(!nameMatch&&!companyMatch)continue;
    const confidence=Math.min(1,candidate.confidence+(nameMatch?.35:0)+(companyMatch?.15:0));
    assertConfidence(confidence);
    const result={canonicalId:candidate.canonicalId,confidence,matchedOn:[...(nameMatch?['name']:[]),...(companyMatch?['company']:[])],needsReview:confidence<.85,provenance:candidate.provenance};
    if(!best||result.confidence>best.confidence)best=result;
  }
  return best;
}

export function resolveCompanyIdentity(input:Pick<CompanyNode,'name'|'industryIds'>, candidates:IdentityCandidate[]):IdentityResolution|undefined {
  const name=normalize(input.name); let best:IdentityResolution|undefined;
  for(const candidate of candidates){
    const aliases=[candidate.canonicalId,...candidate.aliases].map(normalize);
    const nameMatch=aliases.includes(name); if(!nameMatch)continue;
    const confidence=Math.min(1,candidate.confidence+.35);
    const result={canonicalId:candidate.canonicalId,confidence,matchedOn:['name'],needsReview:confidence<.85,provenance:candidate.provenance};
    if(!best||result.confidence>best.confidence)best=result;
  }
  return best;
}

export interface MergeDecision { winnerId:string; loserId:string; action:'auto-merge'|'review'; confidence:number; reversible:true; reasons:string[]; }
export function decideMerge(a:IdentityCandidate,b:IdentityCandidate):MergeDecision {
  if(a.id===b.id)throw new Error('cannot merge an identity with itself');
  const overlap=a.aliases.map(normalize).filter(x=>b.aliases.map(normalize).includes(x));
  const confidence=Math.min(a.confidence,b.confidence)+(overlap.length?.2:0);
  const winner=a.confidence>=b.confidence?a:b, loser=winner===a?b:a;
  return {winnerId:winner.id,loserId:loser.id,action:confidence>=.92&&overlap.length>0?'auto-merge':'review',confidence:Math.min(1,confidence),reversible:true,reasons:overlap.length?[`shared aliases: ${overlap.join(', ')}`]:['insufficient deterministic identity overlap']};
}
