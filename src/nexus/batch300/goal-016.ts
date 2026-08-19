export interface GoalOutcome { status:'unknown'|'partial'|'achieved'|'failed'; evidence:string[]; measuredAt?:string; }
