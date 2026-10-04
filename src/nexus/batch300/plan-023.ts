export interface PlanNode {
  id:string;
  [key:string]:unknown;
}

export interface PlanEdge {
  from:string;
  to:string;
  [key:string]:unknown;
}

export interface PlanGraph { nodes:PlanNode[]; edges:PlanEdge[]; }
