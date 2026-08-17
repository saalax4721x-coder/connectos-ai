import type {EvaluationScore} from './score'; export const evaluationGate=(scores:EvaluationScore[],minimum=.7)=>scores.length>0&&scores.every(s=>s.score>=minimum);
