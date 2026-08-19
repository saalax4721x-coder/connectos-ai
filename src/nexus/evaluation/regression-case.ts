export interface RegressionCase { id: string; baseline: number; current: number; tolerance: number; }
export function regressed(test: RegressionCase): boolean { return test.current < test.baseline - test.tolerance; }
