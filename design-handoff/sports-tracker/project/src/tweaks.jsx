// ---- Tweaks panel + design notes ----
const { useState } = React;

function TweakGroup({ label, children }) {
  return (
    <div style={{marginBottom:14}}>
      <div className="eyebrow" style={{marginBottom:6}}>{label}</div>
      {children}
    </div>
  );
}

function SegRow({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map(o=>(
        <button key={o.v} onClick={()=>onChange(o.v)}
          className="chip" style={{
            background: value===o.v ? 'var(--ink)' : 'var(--bg-elev)',
            color: value===o.v ? 'var(--bg)' : 'var(--ink-soft)',
            borderColor: value===o.v ? 'var(--ink)' : 'var(--line)',
            fontWeight:500, cursor:'pointer',
          }}>
          {o.swatch && <span className="swatch" style={{background:o.swatch}} />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

function TweaksPanel({ open, onClose, state, setState }) {
  if (!open) return null;
  return (
    <div style={{position:'fixed', right:16, bottom:16, zIndex:60, width:280,
                 background:'var(--bg-elev)', border:'1px solid var(--line-2)', borderRadius:12,
                 boxShadow:'0 12px 40px rgba(31,29,26,0.12)', padding:16}}>
      <div className="flex items-center justify-between mb-3">
        <span style={{fontSize:13, fontWeight:600}}>Tweaks</span>
        <button onClick={onClose} style={{fontSize:16, color:'var(--muted)'}}>×</button>
      </div>

      <TweakGroup label="Live accent">
        <SegRow value={state.accent} onChange={v=>setState({...state, accent:v})}
          options={[
            {v:'red',    label:'Red',    swatch:'#C8372D'},
            {v:'amber',  label:'Amber',  swatch:'#B47A1A'},
            {v:'emerald',label:'Emerald',swatch:'#2F7D4E'},
            {v:'cobalt', label:'Cobalt', swatch:'#2A5AA3'},
          ]} />
      </TweakGroup>

      <TweakGroup label="Density">
        <SegRow value={state.density} onChange={v=>setState({...state, density:v})}
          options={[{v:'dense',label:'Dense'},{v:'balanced',label:'Balanced'},{v:'airy',label:'Airy'}]} />
      </TweakGroup>

      <TweakGroup label="Motion">
        <SegRow value={state.motion} onChange={v=>setState({...state, motion:v})}
          options={[{v:'low',label:'Subtle'},{v:'high',label:'Moderate'}]} />
      </TweakGroup>

      <TweakGroup label="Simulate">
        <button onClick={state.onSimulate}
          className="chip" style={{background:'var(--ink)', color:'var(--bg)', borderColor:'var(--ink)', fontWeight:500, height:28, cursor:'pointer'}}>
          ↯ Trigger live score update
        </button>
      </TweakGroup>

      <div className="hairline" style={{margin:'10px 0'}} />
      <p style={{fontSize:10.5, color:'var(--muted)', lineHeight:1.5}}>
        All tokens are CSS vars — no hardcoded hex in components. Flip accent live.
      </p>
    </div>
  );
}

window.TweaksPanel = TweaksPanel;
