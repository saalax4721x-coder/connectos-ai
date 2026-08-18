export type RuntimeState='queued'|'running'|'waiting_approval'|'completed'|'failed';
export const canTransition=(from:RuntimeState,to:RuntimeState)=>from===to||({queued:['running'],running:['waiting_approval','completed','failed'],waiting_approval:['running','failed'],completed:[],failed:[]}[from]||[]).includes(to);
