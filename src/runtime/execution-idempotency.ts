export class ExecutionIdempotency { private keys=new Set<string>(); claim(key:string){if(this.keys.has(key))return false;this.keys.add(key);return true;} release(key:string){this.keys.delete(key);} }
