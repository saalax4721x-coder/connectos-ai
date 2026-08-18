export const capabilityCoverage=(required:string[],available:string[])=>required.length?required.filter(x=>available.includes(x)).length/required.length:0;
