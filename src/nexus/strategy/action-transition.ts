import type {ActionState} from './action-state';
const transitions:Record<ActionState,ActionState[]>={proposed:['approved','rejected'],approved:['running','rejected'],running:['succeeded','failed'],succeeded:[],failed:['running'],rejected:[]};
export const canActionTransition=(a:ActionState,b:ActionState)=>transitions[a].includes(b);
