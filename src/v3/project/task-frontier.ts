import type {ProjectTask} from './task'; export const readyTasks=(tasks:ProjectTask[])=>tasks.filter(t=>t.status==='todo'&&t.dependsOn.every(id=>tasks.some(d=>d.id===id&&d.status==='done')));
