import {parseGoalIntent} from './parser';
import {normalizeIntent} from './normalize';
import {clarificationQuestions} from './clarify';
import type {GoalIntent} from './schema';

export interface IntentAnalysis{intent:GoalIntent;clarifications:ReturnType<typeof clarificationQuestions>;ready:boolean;}

export const analyzeIntent=(raw:string,now=Date.now()):IntentAnalysis=>{
 const intent=normalizeIntent(parseGoalIntent(raw,now));
 const clarifications=clarificationQuestions(intent);
 return {intent,clarifications,ready:clarifications.length===0};
};
