import {useMemo, useState} from 'react';
import {createNexusRuntime} from './runtime';

const runtime = createNexusRuntime();

export function NexusCommandCenter() {
  const [goal, setGoal] = useState('');
  const [submitted, setSubmitted] = useState('');
  const result = useMemo(() => submitted ? runtime.execute(submitted) : null, [submitted]);
  const statusLabel = result?.status === 'WAITING_APPROVAL'
    ? 'Waiting for your approval'
    : result?.status === 'NEEDS_CLARIFICATION'
      ? 'More information required'
      : 'Ready to proceed';

  return (
    <main style={{minHeight:'100vh',background:'#0a0d12',color:'#f5f7fa',fontFamily:'Inter,system-ui,sans-serif',padding:'48px 24px'}}>
      <section style={{maxWidth:980,margin:'0 auto'}}>
        <div style={{letterSpacing:'.14em',fontSize:12,opacity:.65}}>CONNECTOS AI / NEXUS</div>
        <h1 style={{fontSize:'clamp(36px,6vw,72px)',lineHeight:1.02,margin:'18px 0 14px'}}>What are you trying to accomplish?</h1>
        <p style={{maxWidth:680,opacity:.7,fontSize:18}}>NEXUS turns a goal into requirements, a grounded plan, guarded actions and a measurable next step.</p>
        <form onSubmit={(event)=>{event.preventDefault();setSubmitted(goal.trim());}} style={{display:'flex',gap:12,marginTop:32,flexWrap:'wrap'}}>
          <input value={goal} onChange={(event)=>setGoal(event.target.value)} placeholder="Find three serious distributors for my perfume brand in Kenya" style={{flex:'1 1 520px',padding:'18px 20px',borderRadius:14,border:'1px solid #2a303a',background:'#11161d',color:'inherit',fontSize:16}} />
          <button disabled={!goal.trim()} style={{padding:'0 24px',minHeight:56,borderRadius:14,border:0,background:'#f5f7fa',color:'#0a0d12',fontWeight:700}}>Plan</button>
        </form>

        {result && <section style={{marginTop:36,display:'grid',gap:16}}>
          <div style={{padding:20,border:'1px solid #252b35',borderRadius:16,background:'#0f141b'}}>
            <div style={{fontSize:12,opacity:.55}}>STATUS</div>
            <strong style={{display:'block',marginTop:8,fontSize:20}}>{statusLabel}</strong>
            <div style={{marginTop:10,opacity:.7}}>Intent confidence: {Math.round(result.plan.intent.confidence * 100)}%</div>
            {result.plan.unresolved.length > 0 && <div style={{marginTop:8,opacity:.65}}>Unresolved: {result.plan.unresolved.join(', ')}</div>}
          </div>
          <div style={{padding:20,border:'1px solid #252b35',borderRadius:16,background:'#0f141b'}}>
            <div style={{fontSize:12,opacity:.55}}>REQUIREMENTS</div>
            {result.plan.requirements.length ? result.plan.requirements.map((item)=><div key={item.key} style={{display:'flex',justifyContent:'space-between',gap:20,padding:'10px 0',borderBottom:'1px solid #1c222b'}}><span>{item.key}</span><span style={{opacity:.65,textAlign:'right'}}>{item.values.join(', ')}</span></div>) : <div style={{marginTop:10,opacity:.65}}>No explicit structured requirements detected.</div>}
          </div>
          <div style={{padding:20,border:'1px solid #252b35',borderRadius:16,background:'#0f141b'}}>
            <div style={{fontSize:12,opacity:.55}}>NEXUS PLAN</div>
            {result.steps.map((step,index)=><div key={step.id} style={{display:'grid',gridTemplateColumns:'36px 1fr auto',gap:12,alignItems:'center',padding:'14px 0',borderBottom:'1px solid #1c222b'}}><span style={{opacity:.45}}>{index+1}</span><span>{step.purpose}</span><span style={{fontSize:12,opacity:.55}}>{step.approval ? 'APPROVAL' : step.agent ?? 'UNASSIGNED'}</span></div>)}
          </div>
        </section>}
      </section>
    </main>
  );
}
