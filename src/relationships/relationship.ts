export type RelationshipStage='discovered'|'connected'|'conversation'|'collaboration'|'partnership'|'trusted'|'long-term';
export interface Relationship{id:string;personId:string;stage:RelationshipStage;strength:number;lastContactAt?:string;consent:boolean;}
