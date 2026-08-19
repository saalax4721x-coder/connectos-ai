import type {GoalEvent} from './goal-event';
export class GoalEventLog{private events:GoalEvent[]=[];append(e:GoalEvent){this.events.push(e);}for(goalId:string){return this.events.filter(e=>e.goalId===goalId);}}
