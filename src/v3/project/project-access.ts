import type {Project} from './project'; export const projectMember=(p:Project,userId:string)=>p.ownerId===userId||p.memberIds.includes(userId);
