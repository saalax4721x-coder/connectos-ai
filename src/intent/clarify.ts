import type {Clarification} from './clarification';
import type {GoalIntent} from './schema';

export const clarificationQuestions=(intent:GoalIntent):Clarification[]=>{
 const questions:Clarification[]=[];
 if(!intent.goal)questions.push({question:'What are you trying to accomplish?',field:'goal',reason:'No actionable goal was identified.',priority:1});
 if(!intent.outcome)questions.push({question:'What outcome would count as success?',field:'outcome',reason:'A target outcome is missing.',priority:1});
 if(intent.confidence<0.65)questions.push({question:'What is the most important constraint or preference?',field:'constraints',reason:'Intent confidence is below the clarification threshold.',priority:2});
 if(intent.timeline===undefined&&(intent.urgency==='high'||intent.urgency==='critical'))questions.push({question:'When does this need to be completed?',field:'timeline',reason:'High urgency without a concrete timeline.',priority:2});
 return questions.sort((a,b)=>a.priority-b.priority);
};
