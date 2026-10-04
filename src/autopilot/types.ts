export type AutopilotStatus='draft'|'ready'|'running'|'waiting-approval'|'paused'|'completed'|'failed'|'cancelled';
export type AutopilotStage='clarify'|'research'|'evaluate'|'plan'|'execute'|'follow-up'|'review';
export interface AutopilotGoal{id:string;userId:string;statement:string;targetOutcome:string;deadline?:string;approved:boolean;status:AutopilotStatus;createdAt:string;updatedAt:string;}
export interface AutopilotStep{id:string;stage:AutopilotStage;title:string;description:string;requiresApproval:boolean;permission?:string;completed:boolean;output?:unknown;error?:string;}
export interface AutopilotRun{id:string;goalId:string;status:AutopilotStatus;steps:AutopilotStep[];currentStepId?:string;version:number;startedAt?:string;finishedAt?:string;updatedAt:string;}
export interface AutopilotGuardrails{maxSteps:number;requireApprovalForExternalActions:boolean;allowFinancialCommitments:boolean;allowPrivateDataSharing:boolean;}
export interface AutopilotStore{getGoal(id:string):Promise<AutopilotGoal|undefined>;saveGoal(goal:AutopilotGoal):Promise<void>;getRun(id:string):Promise<AutopilotRun|undefined>;saveRun(run:AutopilotRun):Promise<void>;}