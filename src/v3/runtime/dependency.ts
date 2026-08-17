export interface DependencyToken<T>{readonly key:string;readonly defaultValue?:T}
export const token=<T>(key:string,defaultValue?:T):DependencyToken<T>=>({key,defaultValue});
