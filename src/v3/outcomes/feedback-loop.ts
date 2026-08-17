import type {Outcome} from './outcome'; export const successfulRate=(outcomes:Outcome[])=>outcomes.length?outcomes.filter(o=>o.successful).length/outcomes.length:0;
