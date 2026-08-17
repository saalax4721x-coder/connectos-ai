import type {OpportunityStatus} from './opportunity-status';
const graph:Record<OpportunityStatus,OpportunityStatus[]>={discovered:['researched','saved'],researched:['saved','qualified'],saved:['qualified'],qualified:['contacted','conversation'],contacted:['conversation'],conversation:['meeting'],meeting:['proposal','collaboration'],proposal:['negotiation'],negotiation:['collaboration','deal'],collaboration:['deal','completed'],deal:['completed'],completed:['outcome'],outcome:[]};
export const canTransitionOpportunity=(from:OpportunityStatus,to:OpportunityStatus)=>graph[from].includes(to);
