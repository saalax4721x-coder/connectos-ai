export interface Correlation{traceId:string;spanId:string;parentSpanId?:string}
export const childCorrelation=(p:Correlation,spanId:string):Correlation=>({traceId:p.traceId,spanId,parentSpanId:p.spanId});
