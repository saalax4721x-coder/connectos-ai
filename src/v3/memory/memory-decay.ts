import type {Memory} from './memory'; export const decayImportance=(m:Memory,ageDays:number,halfLife=180):Memory=>({...m,importance:m.importance*Math.pow(.5,ageDays/halfLife)});
