import type {Lifecycle} from './lifecycle'; import {canTransition} from './lifecycle';
export class LifecycleMachine{constructor(public state:Lifecycle='created'){} transition(next:Lifecycle){if(!canTransition(this.state,next))throw new Error(`Invalid transition ${this.state}->${next}`);this.state=next;return this.state;}}
