export type Lifecycle='created'|'running'|'paused'|'completed'|'failed'|'cancelled';
export const canTransition=(from:Lifecycle,to:Lifecycle)=>({created:['running','cancelled'],running:['paused','completed','failed','cancelled'],paused:['running','cancelled'],completed:[],failed:['running'],cancelled:[]}[from] as Lifecycle[]).includes(to);
