export interface IntentStep{id:string;purpose:string;agent?:string;dependsOn:string[];approval?:boolean;}
export interface IntentPlan{intentId:string;steps:IntentStep[];}
