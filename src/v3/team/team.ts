import type {TeamMember} from './team-role'; export interface Team{id:string;name:string;ownerId:string;members:TeamMember[];sharedNetwork:boolean;sharedOpportunities:boolean;sharedDeals:boolean;}
