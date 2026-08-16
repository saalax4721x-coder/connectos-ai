export interface RelationshipEvent{type:string;at:string;summary:string;source:string;}
export const recentEvents=(events:RelationshipEvent[],limit=10)=>events.slice().sort((a,b)=>Date.parse(b.at)-Date.parse(a.at)).slice(0,limit);
