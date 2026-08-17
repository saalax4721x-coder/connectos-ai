export const requiresApproval=(sideEffect:'none'|'read'|'write'|'external')=>sideEffect==='write'||sideEffect==='external';
