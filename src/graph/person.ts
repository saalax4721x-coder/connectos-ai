import { assertConfidence, type Provenance } from '../core/provenance';

export interface PersonNode {
  id:string;
  displayName:string;
  profession?:string;
  companyIds:string[];
  skillIds:string[];
  locationId?:string;
  verified:boolean;
  source:string;
  observedAt:string;
  lastVerifiedAt?:string;
  confidence:number;
  provenance:Provenance[];
}

export function validatePerson(node:PersonNode):PersonNode {
  if(!node.id||!node.displayName.trim()) throw new Error('person node requires id and displayName');
  if(!node.source) throw new Error('person node requires a source');
  assertConfidence(node.confidence);
  if(Number.isNaN(Date.parse(node.observedAt))) throw new Error('person observedAt must be an ISO timestamp');
  return node;
}
