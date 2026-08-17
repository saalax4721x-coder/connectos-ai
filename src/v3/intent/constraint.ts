export type ConstraintOperator='eq'|'neq'|'gte'|'lte'|'in'|'contains'; export interface Constraint{field:string;operator:ConstraintOperator;value:string|number|boolean|string[];hard:boolean;}
