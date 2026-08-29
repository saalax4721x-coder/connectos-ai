import { assertConfidence, type Provenance } from '../core/provenance';

export interface CompanyNode {
  id:string;
  name:string;
  industryIds:string[];
  locationIds:string[];
  employeeCount?:number;
  fundingStage?:string;
  source:string;
  observedAt:string;
  lastVerifiedAt?:string;
  confidence:number;
  provenance:Provenance[];
}

export function validateCompany(node:CompanyNode):CompanyNode {
  if(!node.id||!node.name.trim()) throw new Error('company node requires id and name');
  if(!node.source) throw new Error('company node requires a source');
  assertConfidence(node.confidence);
  if(node.employeeCount!==undefined&&(!Number.isInteger(node.employeeCount)||node.employeeCount<0)) throw new Error('employeeCount must be a non-negative integer');
  if(Number.isNaN(Date.parse(node.observedAt))) throw new Error('company observedAt must be an ISO timestamp');
  return node;
}
