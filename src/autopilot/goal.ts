export type AutopilotStatus='draft'|'ready'|'running'|'waiting-approval'|'paused'|'completed'|'failed'|'cancelled';
export interface AutopilotGoal{id:string;userId:string;statement:string;targetOutcome:string;deadline?:string;approved:boolean;status:AutopilotStatus;createdAt:string;updatedAt:string;}
const iso=(v:string|Date)=>v instanceof Date?v.toISOString():new Date(v).toISOString();
export const validateGoal=(goal:AutopilotGoal)=>{
 if(!goal.id||!goal.userId||!goal.statement.trim()||!goal.targetOutcome.trim())throw new Error('goal requires id, userId, statement and targetOutcome');
 if(goal.deadline&&Number.isNaN(Date.parse(goal.deadline)))throw new Error('invalid goal deadline');
 return {...goal,createdAt:iso(goal.createdAt),updatedAt:iso(goal.updatedAt)};
};
export const createGoal=(input:Pick<AutopilotGoal,'id'|'userId'|'statement'|'targetOutcome'> & Partial<Pick<AutopilotGoal,'deadline'>>):AutopilotGoal=>{
 const now=new Date().toISOString();
 return validateGoal({id:input.id,userId:input.userId,statement:input.statement,targetOutcome:input.targetOutcome,deadline:input.deadline,approved:false,status:'draft',createdAt:now,updatedAt:now});
};