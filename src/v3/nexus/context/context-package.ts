export interface ContextPackage {
  goal:string;
  entities:string[];
  constraints:string[];
  provenance:string[];
}

export function createContextPackage(goal:string):ContextPackage{return {goal,entities:[],constraints:[],provenance:[]};}
