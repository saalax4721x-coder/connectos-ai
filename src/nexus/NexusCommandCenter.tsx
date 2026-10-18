import {useEffect,useRef,useState} from 'react';
import {createWorkspaceClient,type WorkspaceClient,type WorkspaceTarget} from '../integration/client';
import type {SliceView} from '../integration/slice';
import './command-center.css';

const client=createWorkspaceClient({csrfToken:()=>document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content});
const labels:Record<string,string>={pending:'Not started',running:'In progress','waiting-approval':'Waiting for your decision',
  succeeded:'Completed',failed:'Stopped',cancelled:'Cancelled'};
const runFromLocation=()=>new URLSearchParams(window.location.search).get('run');
const rememberRun=(id?:string)=>{
  const url=new URL(window.location.href);if(id)url.searchParams.set('run',id);else url.searchParams.delete('run');
  window.history.replaceState(null,'',url);
};

export function NexusCommandCenter({workspace=client}:{workspace?:WorkspaceClient}){
  const [targets,setTargets]=useState<WorkspaceTarget[]>([]);
  const [selected,setSelected]=useState<string[]>([]);
  const [goal,setGoal]=useState('');
  const [body,setBody]=useState('');
  const [view,setView]=useState<SliceView>();
  const [connected,setConnected]=useState(false);
  const [busy,setBusy]=useState(true);
  const [error,setError]=useState('');
  const [requiresRefresh,setRequiresRefresh]=useState(false);
  const locked=useRef(false);
  const statusHeading=useRef<HTMLHeadingElement>(null);

  useEffect(()=>{
    let active=true;
    const id=runFromLocation();
    Promise.all([workspace.targets(),id?workspace.get(id):Promise.resolve(undefined)])
      .then(([available,run])=>{if(active){setTargets(available);setConnected(true);setView(run);}})
      .catch(e=>{if(active)setError(e instanceof Error?e.message:'Your workspace is unavailable.');})
      .finally(()=>{if(active)setBusy(false);});
    return ()=>{active=false;};
  },[workspace]);

  async function perform(operation:()=>Promise<void>){
    if(locked.current)return;
    locked.current=true;setBusy(true);setError('');
    try{await operation();}
    catch(e){setError(e instanceof Error?e.message:'The request could not be completed.');setRequiresRefresh(true);}
    finally{locked.current=false;setBusy(false);}
  }
  const terminal=view&&['succeeded','failed','cancelled'].includes(view.run.state);
  const canDecide=view?.run.state==='waiting-approval'&&!!view.action&&!requiresRefresh&&!busy;
  const recipient=targets.find(t=>t.id===view?.action?.recipientId);

  return <main className="command-center">
    <div className="command-shell">
      <p className="eyebrow">CONNECTOS AI / NEXUS</p>
      <h1>What are you trying to accomplish?</h1>
      <p className="intro">Research the people who matter, review the evidence, and choose your next move.</p>
      <p className="workspace-state" role="status">{busy?'Working on your request…':connected?'Workspace connected':'Workspace not connected'}</p>
      {error&&<div className="notice" role="alert"><p>{error}</p></div>}

      {!connected&&<button type="button" disabled={busy} onClick={()=>void perform(async()=>{
        const available=await workspace.targets();const id=runFromLocation();
        if(id)setView(await workspace.get(id));setTargets(available);setConnected(true);setRequiresRefresh(false);
      })}>Connect again</button>}

      {connected&&!view&&<form aria-label="Research and outreach" aria-busy={busy} onSubmit={e=>{
        e.preventDefault();if(!goal.trim()||!body.trim()||!selected.length)return;
        void perform(async()=>{const run=await workspace.start({goal:goal.trim(),body:body.trim(),targetIds:selected});
          setView(run);rememberRun(run.run.id);setRequiresRefresh(false);requestAnimationFrame(()=>statusHeading.current?.focus());});
      }}>
        <fieldset disabled={busy} className="panel form-fields">
          <legend>Your next move</legend>
          <label htmlFor="goal">What do you want to achieve?</label>
          <textarea id="goal" required maxLength={4000} rows={2} value={goal} onChange={e=>setGoal(e.target.value)}
            placeholder="Find a distribution partner in Kenya"/>
          <fieldset className="contact-list" aria-describedby="contact-help">
            <legend>Who should we research?</legend>
            <p id="contact-help" className="secondary">Choose contacts available to your workspace.</p>
            {!targets.length&&<p>No contacts are available yet. Ask your workspace administrator to add authorized contacts.</p>}
            {targets.map(target=><label className="contact-choice" key={target.id}>
              <input type="checkbox" checked={selected.includes(target.id)} onChange={e=>setSelected(current=>e.target.checked?
                [...current,target.id]:current.filter(id=>id!==target.id))}/><span>{target.title}</span>
            </label>)}
          </fieldset>
          <label htmlFor="outreach">Message to review</label>
          <textarea id="outreach" required maxLength={20000} rows={5} value={body} onChange={e=>setBody(e.target.value)}
            aria-describedby="message-help" placeholder="Write the message you would like to send."/>
          <p id="message-help" className="secondary">Research runs first. You will review the recipient, evidence and exact message before anything is sent.</p>
          <button type="submit" disabled={busy||!selected.length||!goal.trim()||!body.trim()} aria-describedby="start-help">Research and prepare</button>
          <p id="start-help" className="secondary">Select at least one contact and complete both fields to begin.</p>
        </fieldset>
      </form>}

      {view&&<section aria-label="Run review" aria-busy={busy} className="run-review">
        <div className="panel">
          <div className="panel-heading"><h2 ref={statusHeading} tabIndex={-1}>{labels[view.run.state]}</h2>
            <button type="button" className="secondary-button" disabled={busy} onClick={()=>void perform(async()=>{
              setView(await workspace.get(view.run.id));setRequiresRefresh(false);
            })}>Refresh status</button></div>
          {view.run.state==='waiting-approval'&&<p>Research is complete. Review the action below before deciding.</p>}
          {view.run.state==='succeeded'&&<p role="status">Your message was sent. The outcome is saved in Memory.</p>}
          {view.run.state==='cancelled'&&<p role="status">You rejected this action. No message was sent.</p>}
          {view.run.state==='failed'&&<p role="status">This run stopped. Review the step below before starting another run. If delivery was attempted, check its status with your workspace before sending again.</p>}
          {requiresRefresh&&<p>Refresh the run status before making another decision.</p>}
          <ol className="steps">{view.run.steps.map(step=><li key={step.id}>
            <span>{step.name}</span><span className="secondary">{labels[step.state]}</span>
            {step.error&&<p className="step-error">{step.error}</p>}
          </li>)}</ol>
        </div>

        {view.intelligence&&<div className="panel">
          <h2>Evidence behind the action</h2>
          {view.intelligence.research.findings.length?<ul className="findings">{view.intelligence.research.findings.map((finding,index)=><li key={`${finding.entityId}:${finding.claim}:${index}`}>
            <strong>{finding.claim}: {finding.value}</strong>
            <p className="secondary">Confidence {Math.round(finding.confidence*100)}% · Sources: {finding.sourceIds.join(', ')}</p>
          </li>)}</ul>:<p>No usable findings were returned.</p>}
          {view.action&&<p className="secondary">Access path: {view.intelligence.warmPaths.some(p=>p.to===view.action?.recipientId&&!p.requiresConsent)?
            'An eligible path was found. Consent will be checked again before sending.':'No eligible path is available.'}</p>}
        </div>}

        {view.action&&<div className="panel action-review">
          <h2>Review the exact message</h2>
          <dl><dt>Recipient</dt><dd>{recipient?.title??view.action.recipientId}</dd></dl>
          <p className="message-body">{view.action.body}</p>
          {view.run.state==='waiting-approval'&&<>
            <p>Approving sends this message to this recipient. Research and access are checked again before sending.</p>
            <div className="actions">
              <button type="button" disabled={!canDecide} onClick={()=>void perform(async()=>{
                setView(await workspace.decide(view.run.id,'approve'));setRequiresRefresh(false);
              })}>Approve and send</button>
              <button type="button" className="secondary-button" disabled={!canDecide} onClick={()=>void perform(async()=>{
                setView(await workspace.decide(view.run.id,'reject'));setRequiresRefresh(false);
              })}>Reject action</button>
            </div>
          </>}
        </div>}
        {terminal&&<button type="button" className="secondary-button" disabled={busy} onClick={()=>{
          setView(undefined);setError('');setRequiresRefresh(false);rememberRun();
        }}>Start another goal</button>}
      </section>}
    </div>
  </main>;
}
