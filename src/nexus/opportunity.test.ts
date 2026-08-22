import {describe, expect, it} from 'vitest';
import {rankOpportunities} from './opportunity';
import {findWarmPaths} from './relationship';
import {InMemoryGraph} from '../graph/repository';

describe('NEXUS opportunity and relationship integration', () => {
  it('ranks opportunities using the canonical scoring engine', () => {
    const ranked = rankOpportunities({id:'i',raw:'',goal:'',peopleRequired:[],companiesRequired:[],skillsRequired:[],constraints:[],preferences:[],confidence:1}, [
      {
        opportunity: {id:'o1',type:'client',title:'A',description:'',people:[],companies:[],location:'Kenya',industry:'AI',urgency:1,timestamp:'2026-01-01',confidence:1,whyYou:[],whyThem:[],whyNow:[],nextAction:'connect',provenance:[]},
        signals: {relevance:1,fit:1,timing:1,access:.8,value:.8,urgency:.8,competition:.2,effort:.2,risk:.1,confidence:.9},
      },
    ]);
    expect(ranked[0].score.total).toBeGreaterThan(0.7);
  });

  it('does not expose can-introduce paths without explicit consent', async () => {
    const graph = new InMemoryGraph()
      .addNode({id:'a',type:'person',name:'A',location:'Kenya',skills:[]})
      .addNode({id:'b',type:'person',name:'B',location:'Kenya',skills:[]})
      .addEdge({from:'a',to:'b',type:'can-introduce',source:'user-network',confidence:1});
    const paths = await findWarmPaths(graph, 'a', 'b');
    expect(paths).toHaveLength(0);
  });
});
