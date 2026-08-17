import type {Command} from './command'; export const matchCommand=(input:string,commands:Command[])=>commands.find(c=>input.toLowerCase().startsWith(c.label.toLowerCase()));
