export const adjacency=(edges:{from:string;to:string}[]):Record<string,string[]> =>
  edges.reduce<Record<string,string[]>>((m,e)=>{
    (m[e.from]??=[]).push(e.to);
    return m;
  },{});
