export interface ScheduleStep { taskId:string; runAt:string; timezone:string; }
export function scheduleIsFuture(step:ScheduleStep, now=Date.now()):boolean { return Date.parse(step.runAt) > now; }
