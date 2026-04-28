// ---- App shell ----
const { useState, useEffect, useMemo } = React;

function LiveScoreMark({ onClick }) {
  return (
    <button onClick={onClick} aria-label="LiveScore home"
      style={{background:'none', border:0, padding:0, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:10}}>
      <span style={{position:'relative', display:'inline-flex', alignItems:'center', justifyContent:'center',
                    width:30, height:30, borderRadius:8,
                    background:'linear-gradient(135deg, var(--ink) 0%, #2E2A23 100%)',
                    boxShadow:'inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 2px rgba(31,29,26,0.15)'}}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--bg)" strokeWidth="1.8" strokeLinecap="round">
          {/* stadium arcs */}
          <path d="M3 15 Q12 5 21 15" strokeOpacity="0.55"/>
          <path d="M5 17 Q12 9 19 17" strokeOpacity="0.85"/>
          {/* live spark */}
          <circle cx="12" cy="17" r="1.8" fill="var(--live)" stroke="none"/>
        </svg>
        <span style={{position:'absolute', top:4, right:4, width:6, height:6, borderRadius:999,
                      background:'var(--live)', boxShadow:'0 0 0 2px rgba(200,55,45,0.18)'}} />
      </span>
      <span style={{display:'flex', flexDirection:'column', lineHeight:1, alignItems:'flex-start'}}>
        <span style={{fontSize:15, fontWeight:700, letterSpacing:'-0.02em', color:'var(--ink)'}}>
          Live<span style={{color:'var(--live)'}}>·</span>Score
        </span>
        <span className="mono" style={{fontSize:9, letterSpacing:'0.14em', color:'var(--muted-2)', marginTop:3, textTransform:'uppercase'}}>
          v2 · Edition
        </span>
      </span>
    </button>
  );
}

function TickerStrip() {
  const items = [
    { a:'TOR', b:'LAD', sa:4, sb:3, st:'T7', live:true },
    { a:'BOS', b:'NYY', sa:2, sb:5, st:'B5', live:true },
    { a:'TBL', b:'TOR', sa:2, sb:3, st:'P2', live:true },
    { a:'OKC', b:'DEN', sa:78, sb:82, st:'Q3', live:true },
    { a:'ATL', b:'BOS', sa:6, sb:3, st:'F',  live:false },
    { a:'LAD', b:'TOR', sa:5, sb:2, st:'F',  live:false },
  ];
  const loop = [...items, ...items];
  return (
    <div style={{flex:1, minWidth:0, overflow:'hidden', maskImage:'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
                 WebkitMaskImage:'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)'}}>
      <div style={{display:'inline-flex', gap:22, animation:'tickermove 36s linear infinite', whiteSpace:'nowrap', paddingLeft:8}}>
        {loop.map((t,i)=>(
          <span key={i} style={{display:'inline-flex', alignItems:'center', gap:7, fontSize:11.5, color:'var(--ink-soft)'}}>
            {t.live && <span className="pulsedot" style={{width:5, height:5}} />}
            <span style={{fontWeight:600, color: t.sa>t.sb ? 'var(--ink)':'var(--muted)'}}>{t.a}</span>
            <span className="mono tabular" style={{fontWeight:700, color:'var(--ink)'}}>{t.sa}</span>
            <span style={{color:'var(--faint)'}}>·</span>
            <span className="mono tabular" style={{fontWeight:700, color:'var(--ink)'}}>{t.sb}</span>
            <span style={{fontWeight:600, color: t.sb>t.sa ? 'var(--ink)':'var(--muted)'}}>{t.b}</span>
            <span className="mono" style={{fontSize:10, color: t.live?'var(--live)':'var(--faint)', fontWeight:600, marginLeft:2}}>{t.st}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function TopBar({ league, onLeague, view, onView, connStatus, onHome }) {
  return (
    <header style={{background:'linear-gradient(180deg, var(--bg) 0%, var(--bg-sunken) 100%)', borderBottom:'1px solid var(--line)', position:'sticky', top:0, zIndex:20}}>
      <style>{`@keyframes tickermove { from{transform:translateX(0)} to{transform:translateX(-50%)} }`}</style>

      {/* Row 1 — logo, date, live tag */}
      <div className="flex items-center gap-5" style={{padding:'10px 24px 8px'}}>
        <LiveScoreMark onClick={onHome} />
        <div style={{width:1, height:20, background:'var(--line-2)'}} />
        <div style={{display:'flex', flexDirection:'column', lineHeight:1.1}}>
          <span style={{fontSize:12, fontWeight:600, color:'var(--ink)'}}>Sat, Apr 18</span>
          <span className="mono" style={{fontSize:9.5, letterSpacing:'0.1em', color:'var(--muted-2)', textTransform:'uppercase', marginTop:2}}>
            Week 3 · MLB Reg
          </span>
        </div>
        <TickerStrip />
        <div className="flex items-center gap-1.5" style={{fontSize:11, color:'var(--muted)', background:'var(--bg-elev)',
             padding:'5px 10px', borderRadius:999, border:'1px solid var(--line)'}}>
          <span className="pulsedot" style={{width:6, height:6}} />
          <span style={{fontWeight:500}}>Live · WS</span>
          <span className="mono" style={{color:'var(--faint)', fontSize:10}}>42ms</span>
        </div>
      </div>

      {/* Row 2 — league selector */}
      <div className="flex items-center justify-between gap-6" style={{padding:'4px 24px 10px'}}>
        <window.LeagueTabs value={league} onChange={onLeague} />
        <div className="flex items-center gap-3" style={{fontSize:11, color:'var(--muted)'}}>
          <span className="flex items-center gap-1.5"><span className="dot" style={{background:'var(--live)'}} /> 4 live</span>
          <span className="flex items-center gap-1.5"><span className="dot" style={{background:'var(--amber)'}} /> 1 delayed</span>
          <span className="flex items-center gap-1.5"><span className="dot" style={{background:'var(--muted-2)'}} /> 2 upcoming</span>
        </div>
      </div>

      {/* sub-nav */}
      <div className="flex items-center gap-6" style={{padding:'0 24px'}}>
        {[['scores','Scores'],['standings','Standings'],['playoffs','Playoffs'],['teams','Teams'],['feed','My feed']].map(([v,l])=>(
          <button key={v} onClick={()=>onView(v)} className={`navlink ${view===v?'on':''}`}>{l}</button>
        ))}
      </div>
    </header>
  );
}

function ScoreboardPage({ league, flashMap, onSim, onSelectGame }) {
  const [day, setDay] = useState('today');
  return (
    <div>
      <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
        <div>
          <h2 style={{fontSize:24, fontWeight:700, letterSpacing:'-0.02em'}}>Today's Games</h2>
          <div style={{fontSize:12, color:'var(--muted)', marginTop:2}}>Live, upcoming and final. Pull to refresh updates in real-time.</div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onSim} className="chip" style={{height:30, background:'var(--bg-elev)', color:'var(--ink-soft)', cursor:'pointer'}}>
            <span>↯</span> Simulate update
          </button>
          <window.DayTabs value={day} onChange={setDay} />
        </div>
      </div>
      <window.Scoreboard league={league} day={day} flashMap={flashMap} onSelect={onSelectGame} />
    </div>
  );
}

function App() {
  const [view, setView] = useState('scores');
  const [league, setLeague] = useState('mlb');
  const [selectedGame, setSelectedGame] = useState(null);
  const [accent, setAccent] = useState('red');
  const [density, setDensity] = useState('balanced');
  const [motion, setMotion] = useState('high');
  const [tweaksOpen, setTweaksOpen] = useState(true);

  // Live simulation
  const [flashMap, setFlashMap] = useState({});
  const [toast, setToast] = useState(null);
  const [freshAlertId, setFreshAlertId] = useState(null);
  const [alerts, setAlerts] = useState(window.LS_DATA.ALERTS);

  useEffect(()=>{
    document.documentElement.setAttribute('data-accent', accent);
    document.documentElement.setAttribute('data-density', density);
    document.documentElement.setAttribute('data-motion', motion);
  }, [accent, density, motion]);

  function simulateUpdate() {
    // Blue Jays tack on a run in the 7th
    const g = window.LS_DATA.GAMES.find(x=>x.gameId==='g1');
    g.score = { ...g.score, away: g.score.away + 1 };
    setFlashMap({ g1:'away' });
    const newAlert = {
      id:'a_new_' + Date.now(), severity:'critical', type:'score_change',
      title:`TOR ${g.score.away} — ${g.score.home} LAD`,
      message:`Bo Bichette RBI single, top 7th.`, timestamp:'just now', gameId:'g1'
    };
    setAlerts(prev => [newAlert, ...prev]);
    setFreshAlertId(newAlert.id);
    setToast(newAlert);
    setTimeout(()=>setFlashMap({}), 1400);
    setTimeout(()=>setToast(null), 4500);
    setTimeout(()=>setFreshAlertId(null), 1600);
  }

  const body = selectedGame ? <window.GameDetail game={selectedGame} onBack={()=>setSelectedGame(null)} />
             : view === 'standings' ? <window.Standings />
             : view === 'playoffs'  ? <window.Playoffs />
             : <ScoreboardPage league={league} flashMap={flashMap} onSim={simulateUpdate} onSelectGame={setSelectedGame} />;

  return (
    <div style={{minHeight:'100vh', background:'var(--bg-sunken)'}}>
      <div style={{maxWidth:1440, margin:'0 auto', padding:'24px'}}>
        <window.DesignNotes />

        {/* The product mockup — framed like a window so design notes read as a wrapper */}
        <div className="screenframe">
          <div className="windowbar">
            <div className="flex items-center gap-2" style={{paddingLeft:6}}>
              <span style={{width:14, height:14, borderRadius:3, background:'var(--ink)', color:'var(--bg)',
                            display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700}}>L</span>
              <span style={{fontSize:11.5, color:'var(--ink-soft)', fontWeight:500}}>LiveScore</span>
            </div>
            <div className="mono" style={{fontSize:11, color:'var(--muted)', marginLeft:10}}>livescore.app/{view==='scores'?'':view}</div>
            <div style={{flex:1}} />
            <div className="mono" style={{fontSize:10.5, color:'var(--faint)', marginRight:8}}>1440 × viewport</div>
            <div className="wincontrols">
              <button aria-label="Minimize" title="Minimize">
                <svg viewBox="0 0 10 10"><rect x="0" y="5" width="10" height="1" fill="currentColor"/></svg>
              </button>
              <button aria-label="Maximize" title="Maximize">
                <svg viewBox="0 0 10 10" fill="none"><rect x="0.5" y="0.5" width="9" height="9" stroke="currentColor"/></svg>
              </button>
              <button className="close" aria-label="Close" title="Close">
                <svg viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1"><line x1="0" y1="0" x2="10" y2="10"/><line x1="10" y1="0" x2="0" y2="10"/></svg>
              </button>
            </div>
          </div>

          <TopBar league={league} onLeague={setLeague} view={view} onView={(v)=>{setView(v); setSelectedGame(null);}} onHome={()=>{setView('scores'); setSelectedGame(null);}} />

          <div style={{display:'flex', minHeight:720}}>
            <main style={{flex:1, padding:24, overflow:'auto', background:'var(--bg)'}}>
              {body}
            </main>
            <window.AlertsPanel alerts={alerts} freshId={freshAlertId} onSelect={()=>{}} />
          </div>
        </div>

        {/* Footer */}
        <footer style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'24px 4px', fontSize:11.5, color:'var(--muted)'}}>
          <span>No reducer / adapter / WebSocket changes. Restyle-only. Tokens live in <span className="mono">tailwind.config.js</span> theme extensions.</span>
          <button onClick={()=>setTweaksOpen(o=>!o)} className="chip" style={{cursor:'pointer', background:'var(--bg-elev)'}}>
            {tweaksOpen?'Hide':'Show'} Tweaks
          </button>
        </footer>
      </div>

      <window.Toast alert={toast} onClose={()=>setToast(null)} />
      <window.TweaksPanel open={tweaksOpen} onClose={()=>setTweaksOpen(false)}
        state={{accent, density, motion, onSimulate: simulateUpdate}}
        setState={(s)=>{ if(s.accent!==undefined)setAccent(s.accent);
                        if(s.density!==undefined)setDensity(s.density);
                        if(s.motion!==undefined)setMotion(s.motion); }} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
