export type EdgeType='knows'|'works-with'|'worked-with'|'invested-in'|'advised'|'partnered-with'|'collaborated-with'|'can-introduce'|'shared-project';
export interface GraphEdge{from:string;to:string;type:EdgeType;source:string;confidence:number;}
