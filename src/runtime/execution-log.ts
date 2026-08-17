import type { ExecutionEvent } from './execution-event';
export class ExecutionLog { private events:ExecutionEvent[]=[]; append(event:ExecutionEvent){this.events.push(event);return event;} list(runId:string){return this.events.filter(e=>e.runId===runId);} }
