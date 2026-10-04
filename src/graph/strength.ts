export interface RelationshipSignals { recentInteractions:number; sharedProjects:number; sharedContext:number; mutualTrust:number; sourceQuality:number; }
export interface RelationshipStrength { raw:number; decayed:number; confidence:number; reasons:string[]; evaluatedAt:string; }
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export function scoreRelationship(signals:RelationshipSignals,observedAt:string,at=new Date().toISOString()):RelationshipStrength {
  const values=Object.values(signals); if(values.some(v=>!Number.isFinite(v)||v<0||v>1))throw new Error('relationship signals must be between 0 and 1');
  const raw=clamp(signals.recentInteractions*.3+signals.sharedProjects*.2+signals.sharedContext*.2+signals.mutualTrust*.2+signals.sourceQuality*.1);
  const ageDays=Math.max(0,(Date.parse(at)-Date.parse(observedAt))/86400000);
  const decayed=clamp(raw*Math.pow(.5,ageDays/180));
  return {raw,decayed,confidence:clamp(.5+signals.sourceQuality*.5),reasons:[signals.recentInteractions>=.6?'recent interaction signal':'limited recent interaction',signals.sharedProjects>=.5?'shared project context':'limited shared project context',signals.mutualTrust>=.6?'strong trust signal':'trust signal requires caution'],evaluatedAt:at};
}
