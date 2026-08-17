export const planNeedsApproval=(actions:string[])=>actions.some(a=>['send-message','send-email','create-deal','financial-action','share-private-data'].includes(a));
