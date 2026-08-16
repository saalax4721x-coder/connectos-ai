export const redact=(value:string,secrets:string[])=>secrets.reduce((v,s)=>v.split(s).join('[REDACTED]'),value);
