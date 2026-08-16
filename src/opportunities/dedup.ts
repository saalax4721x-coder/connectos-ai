export const normalizeOpportunityTitle=(title:string)=>title.trim().toLowerCase().replace(/\s+/g,' ');
export const opportunityKey=(title:string,source:string)=>`${source}:${normalizeOpportunityTitle(title)}`;
