// ---- Alerts sidebar + toast ----

const SEVERITY = {
  critical: { bar:'var(--live)',  soft:'var(--live-soft)',  text:'var(--live)' },
  warning:  { bar:'var(--amber)', soft:'var(--amber-soft)', text:'var(--amber)' },
  info:     { bar:'var(--muted)', soft:'var(--bg-sunken)',  text:'var(--ink-soft)' },
};

function AlertItem({ alert, onSelect, fresh }) {
  const s = SEVERITY[alert.severity] || SEVERITY.info;
  return (
    <button onClick={()=>onSelect?.(alert)}
      className={`card hoverable ${fresh?'flash':''}`}
      style={{padding:0, display:'flex', width:'100%', textAlign:'left', overflow:'hidden'}}>
      <div style={{width:2, background:s.bar, flex:'none'}} />
      <div style={{padding:'10px 12px', flex:1, minWidth:0}}>
        <div className="flex items-center gap-2 mb-0.5">
          <span className="eyebrow" style={{fontSize:9.5, color:s.text, background:s.soft, padding:'1px 6px', borderRadius:4, border:`1px solid ${s.bar}22`}}>
            {alert.type.replace('_',' ')}
          </span>
          <span className="mono" style={{fontSize:10, color:'var(--faint)', marginLeft:'auto'}}>{alert.timestamp}</span>
        </div>
        <div style={{fontSize:12.5, fontWeight:600, color:'var(--ink)', lineHeight:1.35}}>{alert.title}</div>
        <div style={{fontSize:11.5, color:'var(--muted)', lineHeight:1.4, marginTop:2}}>{alert.message}</div>
      </div>
    </button>
  );
}

function AlertsPanel({ alerts, onSelect, freshId }) {
  return (
    <aside className="flex flex-col shrink-0"
      style={{width:304, borderLeft:'1px solid var(--line)', background:'var(--bg)', height:'100%'}}>
      <div className="flex items-center justify-between" style={{padding:'14px 16px', borderBottom:'1px solid var(--line)'}}>
        <span className="eyebrow">Alerts</span>
        {alerts.length > 0 && (
          <span className="chip" style={{background:'var(--live-soft)', color:'var(--live)', borderColor:'var(--live-line)', fontWeight:600, height:20, padding:'0 8px'}}>
            {alerts.length} new
          </span>
        )}
      </div>
      <div style={{flex:1, overflowY:'auto', padding:12, display:'flex', flexDirection:'column', gap:8}}>
        {alerts.map(a => <AlertItem key={a.id} alert={a} onSelect={onSelect} fresh={freshId===a.id} />)}
      </div>
      <div style={{padding:'10px 16px', borderTop:'1px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'space-between', color:'var(--muted)', fontSize:11}}>
        <span>Push: <span style={{color:'var(--ink-soft)', fontWeight:500}}>Scoring + Finals</span></span>
        <button style={{color:'var(--ink-soft)', fontSize:11, textDecoration:'underline', textDecorationColor:'var(--line-2)', textUnderlineOffset:3}}>Settings</button>
      </div>
    </aside>
  );
}

function Toast({ alert, onClose }) {
  if (!alert) return null;
  const s = SEVERITY[alert.severity] || SEVERITY.info;
  return (
    <div className="toast"
      style={{position:'fixed', right:320, bottom:20, zIndex:50, minWidth:320, maxWidth:380,
              background:'var(--bg-elev)', border:'1px solid var(--line-2)', borderRadius:10,
              boxShadow:'0 8px 32px rgba(31,29,26,0.10), 0 2px 4px rgba(31,29,26,0.06)',
              overflow:'hidden', display:'flex'}}>
      <div style={{width:3, background:s.bar, flex:'none'}} />
      <div style={{padding:'12px 14px', flex:1}}>
        <div className="flex items-center gap-2 mb-1">
          <span className="pulsedot" />
          <span className="eyebrow" style={{color:s.text, fontSize:10}}>{alert.type.replace('_',' ')}</span>
          <span className="mono" style={{fontSize:10, color:'var(--faint)', marginLeft:'auto'}}>just now</span>
        </div>
        <div style={{fontSize:13, fontWeight:600, color:'var(--ink)'}}>{alert.title}</div>
        <div style={{fontSize:12, color:'var(--muted)', marginTop:2}}>{alert.message}</div>
      </div>
      <button onClick={onClose} aria-label="Dismiss" style={{padding:'10px 12px', color:'var(--muted)', fontSize:14, alignSelf:'flex-start'}}>×</button>
    </div>
  );
}

window.AlertsPanel = AlertsPanel;
window.Toast = Toast;
