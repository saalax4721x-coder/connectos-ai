export const canPublishRisk=(assessment:{level:string;confidence:number},min=.8)=>assessment.level!=='low-concern'&&assessment.confidence>=min;
