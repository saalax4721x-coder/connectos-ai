import type {AgentContext} from './context';
import type {RuntimeAgent, RuntimeAgentRegistry} from './runtime-registry';
import {authorizeAgentAction} from './policy';

export type AgentExecutionStatus = 'queued'|'running'|'waiting-approval'|'completed'|'failed';

export interface AgentExecutionRecord {
  id:string;
  agentId:string;
  requestId:string;
  status:AgentExecutionStatus;
  attempt:number;
  startedAt?:string;
  completedAt?:string;
  error?:string;
  output?:unknown;
}

export interface AgentExecutionStore { get(id:string):AgentExecutionRecord|undefined; save(record:AgentExecutionRecord):void; }

export class InMemoryAgentExecutionStore implements AgentExecutionStore {
  private records=new Map<string,AgentExecutionRecord>();
  get(id:string){return this.records.get(id);}
  save(record:AgentExecutionRecord){this.records.set(record.id,record);}
}

export interface AgentExecutorOptions { maxAttempts?:number; idFactory?:()=>string; now?:()=>string; }

export class AgentExecutor {
  constructor(private readonly registry:RuntimeAgentRegistry, private readonly store:AgentExecutionStore, private readonly options:AgentExecutorOptions={}) {}

  async execute(id:string, agentId:string, ctx:AgentContext, input:unknown, tool?:string):Promise<AgentExecutionRecord> {
    const existing=this.store.get(id);
    if(existing?.status==='completed') return existing;
    const agent=this.registry.resolve(agentId);
    const policy=authorizeAgentAction(agent,ctx,tool);
    const now=this.options.now ?? (()=>new Date().toISOString());
    if(!policy.allowed) {
      const record:AgentExecutionRecord={id,agentId,requestId:ctx.requestId,status:policy.requiresApproval?'waiting-approval':'failed',attempt:existing?.attempt??0,error:policy.reason};
      this.store.save(record); return record;
    }
    const maxAttempts=this.options.maxAttempts ?? 2;
    let attempt=existing?.attempt ?? 0;
    let lastError='execution failed';
    while(attempt<maxAttempts) {
      attempt += 1;
      const running:AgentExecutionRecord={id,agentId,requestId:ctx.requestId,status:'running',attempt,startedAt:existing?.startedAt ?? now()};
      this.store.save(running);
      try {
        const output=await agent.execute(ctx,input);
        const completed={...running,status:'completed' as const,completedAt:now(),output};
        this.store.save(completed); return completed;
      } catch(error) {
        lastError=error instanceof Error ? error.message : String(error);
        this.store.save({...running,status:'failed',error:lastError});
      }
    }
    const failed={id,agentId,requestId:ctx.requestId,status:'failed' as const,attempt,error:lastError};
    this.store.save(failed); return failed;
  }
}
