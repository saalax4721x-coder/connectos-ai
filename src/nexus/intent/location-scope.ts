export interface LocationScope { country?:string; city?:string; radiusKm?:number; remoteAllowed:boolean; }
export function locationSpecified(scope:LocationScope):boolean { return !!scope.country || !!scope.city; }
