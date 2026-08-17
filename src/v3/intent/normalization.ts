export const normalizePhrase=(input:string)=>input.trim().replace(/\s+/g,' ').toLowerCase();
export const normalizeList=(items:string[])=>[...new Set(items.map(normalizePhrase).filter(Boolean))];
