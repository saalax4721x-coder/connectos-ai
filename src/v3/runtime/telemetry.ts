export interface TelemetryEvent{name:string;at:string;durationMs?:number;attributes:Record<string,string|number|boolean>}
export interface TelemetrySink{record(event:TelemetryEvent):void}
