import type { GoalIntent, IntentRequirement } from './schema';

export function buildRequirements(intent:GoalIntent):IntentRequirement[]{
 const req:IntentRequirement[]=[];
 if(intent.location) req.push({key:'location',required:true,values:[intent.location],rationale:'requested geography'});
 if(intent.industry) req.push({key:'industry',required:true,values:[intent.industry],rationale:'requested domain'});
 if(intent.skillsRequired.length) req.push({key:'skills',required:true,values:intent.skillsRequired,rationale:'required capabilities'});
 if(intent.peopleRequired.length) req.push({key:'people',required:false,values:intent.peopleRequired,rationale:'desired people types'});
 if(intent.companiesRequired.length) req.push({key:'companies',required:false,values:intent.companiesRequired,rationale:'desired organization types'});
 if(intent.budget!==undefined) req.push({key:'budget',required:false,values:[String(intent.budget)],rationale:'user budget constraint'});
 return req;
}
