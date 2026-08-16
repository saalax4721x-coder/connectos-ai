import type {Intent} from './intent';
export const baseIntent=(goal:string):Intent=>({goal,peopleTypes:[],companyTypes:[],skills:[],constraints:[],preferences:[],confidence:0});
