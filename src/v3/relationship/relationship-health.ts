export interface RelationshipHealth {entityId:string;score:number;signals:string[];}
export function createRelationshipHealth(entityId:string):RelationshipHealth{return {entityId,score:0,signals:[]};}
