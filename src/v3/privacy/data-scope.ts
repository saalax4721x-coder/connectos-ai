export type DataScope='public'|'user'|'team'|'private'|'sensitive';
export const canShare=(scope:DataScope,target:DataScope)=>scope==='public'||scope===target;
