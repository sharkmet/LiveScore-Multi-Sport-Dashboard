// ---- Reusable visual primitives ----

function Eyebrow({ children, className='' }) {
  return <span className={`eyebrow ${className}`}>{children}</span>;
}

function LiveTag({ label='Live' }) {
  return (
    <span className="chip live">
      <span className="pulsedot"></span>
      <span>{label}</span>
    </span>
  );
}

function StatusTag({ status, period, startTime }) {
  if (status === 'live')    return <LiveTag label={period?.short || period?.label || 'Live'} />;
  if (status === 'warmup')  return <LiveTag label="Warmup" />;
  if (status === 'delayed') return <span className="chip" style={{background:'var(--amber-soft)', borderColor:'#E3CC9B', color:'var(--amber)', fontWeight:600}}>◐ Delayed</span>;
  if (status === 'final')   return <span className="chip" style={{color:'var(--ink-soft)'}}>{period?.label || 'Final'}</span>;
  return <span className="chip dim">{formatTime(startTime)}</span>;
}

function formatTime(iso) {
  if (!iso) return 'Scheduled';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US',{hour:'numeric', minute:'2-digit'});
}

function LeagueGlyph({ league, size=18 }) {
  const lbl = (league || '').toUpperCase();
  return (
    <span className="inline-flex items-center justify-center rounded-md"
          style={{width:size, height:size, fontSize:size*0.5, fontWeight:700, letterSpacing:'0.02em',
                  color:'var(--muted)', background:'var(--bg-sunken)', border:'1px solid var(--line)'}}>
      {lbl[0] || '·'}
    </span>
  );
}

function TeamDot({ color }) {
  return <span style={{width:8, height:8, borderRadius:2, background:color||'var(--muted-2)', display:'inline-block', flex:'none'}} />;
}

function KbdHint({ children }) { return <span className="kbd">{children}</span>; }

function SectionHeader({ label, count, live }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      {live && <span className="pulsedot" style={{marginRight:2}} />}
      <span className="eyebrow">{label}</span>
      {count !== undefined && <span className="eyebrow" style={{color:'var(--faint)'}}>{count}</span>}
      <div className="flex-1 hairline" />
    </div>
  );
}

window.UI = { Eyebrow, LiveTag, StatusTag, LeagueGlyph, TeamDot, KbdHint, SectionHeader, formatTime };
