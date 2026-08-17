import type {Intent} from './intent'; export interface IntentRevision{version:number;intent:Intent;changedAt:string;reason:string;}
export class IntentHistory{private revisions:IntentRevision[]=[];append(intent:Intent,reason:string){const r={version:this.revisions.length+1,intent,changedAt:new Date().toISOString(),reason};this.revisions.push(r);return r;}list(){return [...this.revisions];}}
