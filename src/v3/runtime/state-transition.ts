export type RuntimeState='queued'|'running'|'waiting_approval'|'completed'|'failed';

export const canTransition=(from:RuntimeState,to:RuntimeState):boolean=>{
  if(from===to)return true;
  switch(from){
    case 'queued': return to==='running';
    case 'running': return to==='waiting_approval'||to==='completed'||to==='failed';
    case 'waiting_approval': return to==='running'||to==='failed';
    case 'completed':
    case 'failed':
      return false;
  }
};
