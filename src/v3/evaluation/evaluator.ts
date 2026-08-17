import type {EvaluationScore} from './score'; export interface Evaluator{evaluate(input:unknown,output:unknown):EvaluationScore[];}
