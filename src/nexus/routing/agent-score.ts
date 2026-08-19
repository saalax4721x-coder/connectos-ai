export const agentScore=(capability:number,latency:number,cost:number,reliability:number)=>capability*.45+reliability*.3+(1-latency)*.15+(1-cost)*.1;
