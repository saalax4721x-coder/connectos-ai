export interface IntentRevision { version:number; goal:string; changedAt:string; }
export class IntentHistory { private revisions:IntentRevision[]=[]; add(goal:string){this.revisions.push({version:this.revisions.length+1,goal,changedAt:new Date().toISOString()});} list(){return [...this.revisions];} }
