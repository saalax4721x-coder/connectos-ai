export const isDormant=(lastInteractionAt?:string,days=180,now=Date.now())=>!lastInteractionAt||now-new Date(lastInteractionAt).getTime()>days*86400000;
