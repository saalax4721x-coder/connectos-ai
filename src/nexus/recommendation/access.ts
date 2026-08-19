export const access=(direct:number,warm:number,publicRoute:number)=>Math.max(direct,warm*.8,publicRoute*.5);
