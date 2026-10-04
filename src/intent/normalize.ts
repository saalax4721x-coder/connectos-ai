import type {GoalIntent} from './schema';

const clean=(value:string)=>value.trim().replace(/\s+/g,' ');
const unique=(values:string[])=>[...new Set(values.map(clean).filter(Boolean))];

export const normalizeIntent=(intent:GoalIntent):GoalIntent=>({
 ...intent,
 raw:clean(intent.raw),
 goal:clean(intent.goal),
 outcome:intent.outcome?clean(intent.outcome):undefined,
 location:intent.location?clean(intent.location):undefined,
 industry:intent.industry?clean(intent.industry):undefined,
 timeline:intent.timeline?clean(intent.timeline):undefined,
 peopleRequired:unique(intent.peopleRequired),
 companiesRequired:unique(intent.companiesRequired),
 skillsRequired:unique(intent.skillsRequired),
 constraints:unique(intent.constraints),
 preferences:unique(intent.preferences),
 confidence:Math.max(0,Math.min(1,intent.confidence))
});
