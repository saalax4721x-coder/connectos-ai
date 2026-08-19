export interface TimeWindow { start?:string; end?:string; timezone?:string; flexible:boolean; }
export function hasDeadline(window:TimeWindow):boolean { return !!window.end; }
