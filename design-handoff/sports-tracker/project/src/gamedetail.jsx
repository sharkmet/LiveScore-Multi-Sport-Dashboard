// ---- Game Detail view ----
const { StatusTag: _S, LiveTag: _L, TeamDot: _TD } = window.UI;

// --- Sport-specific live situation panels (shared visuals, bigger scale) ---
function _BaseDiamondLg({ bases = {}, outs = 0, balls = 0, strikes = 0 }) {
  const on = (b) => bases[b] ? 'var(--live)' : 'transparent';
  const stroke = (b) => bases[b] ? 'var(--live)' : 'var(--line-2)';
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 60 60" width="72" height="72" style={{display:'block'}}>
        <rect x="23" y="5" width="14" height="14" transform="rotate(45 30 12)"
              fill={on('second')} stroke={stroke('second')} strokeWidth="1.6" />
        <rect x="5" y="23" width="14" height="14" transform="rotate(45 12 30)"
              fill={on('third')} stroke={stroke('third')} strokeWidth="1.6" />
        <rect x="41" y="23" width="14" height="14" transform="rotate(45 48 30)"
              fill={on('first')} stroke={stroke('first')} strokeWidth="1.6" />
        <rect x="23" y="41" width="14" height="14" transform="rotate(45 30 48)"
              fill="var(--bg-elev)" stroke="var(--line-2)" strokeWidth="1.6" />
      </svg>
      <div style={{display:'flex', flexDirection:'column', gap:6}}>
        <div className="flex items-center gap-2">
          <span className="eyebrow" style={{width:48}}>Count</span>
          <span className="tabular mono" style={{fontSize:15, fontWeight:700, color:'var(--ink)'}}>{balls}–{strikes}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="eyebrow" style={{width:48}}>Outs</span>
          <div style={{display:'flex', gap:4}}>
            {[0,1,2].map(i=>(
              <span key={i} style={{width:9, height:9, borderRadius:999,
                background: i < outs ? 'var(--ink)' : 'transparent',
                border: i < outs ? '0' : '1px solid var(--line-2)'}} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function _FootballDriveLg({ down, distance, yardLine, redZone, possessionTeam }) {
  return (
    <div style={{width:'100%'}}>
      <div className="flex items-center gap-3 mb-2">
        <span style={{fontSize:20, fontWeight:700, letterSpacing:'-0.02em', color: redZone?'var(--live)':'var(--ink)'}}>
          {down}{down===1?'st':down===2?'nd':down===3?'rd':'th'} &amp; {distance}
        </span>
        <span style={{color:'var(--faint)'}}>·</span>
        <span className="mono" style={{fontSize:12, color:'var(--muted)'}}>Ball at {yardLine}</span>
        <span style={{color:'var(--faint)'}}>·</span>
        <span style={{fontSize:12, color:'var(--ink-soft)'}}>{possessionTeam} possession</span>
        {redZone && <span className="chip" style={{height:20, padding:'0 8px', fontSize:10, fontWeight:700,
          background:'var(--live-soft)', color:'var(--live)', borderColor:'var(--live-line)', marginLeft:'auto'}}>RED ZONE</span>}
      </div>
      <div style={{position:'relative', height:18, background:
        'repeating-linear-gradient(90deg, var(--bg-sunken) 0 9.99%, var(--line) 10% 10.01%)',
        border:'1px solid var(--line)', borderRadius:4}}>
        <span style={{position:'absolute', top:-14, left:`${yardLine}%`, transform:'translateX(-50%)',
                      fontSize:12, color: redZone?'var(--live)':'var(--ink)'}}>▾</span>
        <span style={{position:'absolute', top:0, bottom:0, left:`${yardLine}%`, width:2,
                      background: redZone?'var(--live)':'var(--ink)'}} />
      </div>
      <div className="flex justify-between mt-1 mono" style={{fontSize:10, color:'var(--faint)'}}>
        <span>Own</span><span>25</span><span>50</span><span>25</span><span>Opp</span>
      </div>
    </div>
  );
}

function _HockeyStripLg({ shots, powerPlay, awayAbbr, homeAbbr }) {
  return (
    <div className="flex items-center gap-6" style={{width:'100%'}}>
      <div>
        <div className="eyebrow mb-1">Shots on goal</div>
        <div className="flex items-center gap-3">
          <span className="tabular mono" style={{fontSize:18, fontWeight:700, color:'var(--ink)'}}>{shots.away}</span>
          <span style={{color:'var(--faint)'}}>–</span>
          <span className="tabular mono" style={{fontSize:18, fontWeight:700, color:'var(--ink)'}}>{shots.home}</span>
        </div>
      </div>
      {powerPlay && (
        <div style={{marginLeft:'auto'}}>
          <div className="eyebrow mb-1">Power play</div>
          <div className="flex items-center gap-2">
            <span className="chip" style={{height:22, padding:'0 10px', fontWeight:700, fontSize:11,
              background:'var(--live-soft)', color:'var(--live)', borderColor:'var(--live-line)'}}>
              {powerPlay.team} · PP
            </span>
            <span className="tabular mono" style={{fontSize:13, color:'var(--ink-soft)', fontWeight:600}}>{powerPlay.time}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function _BasketballStripLg({ possession, fouls, bonus, awayAbbr, homeAbbr }) {
  return (
    <div className="flex items-center gap-6" style={{width:'100%'}}>
      <div>
        <div className="eyebrow mb-1">Possession</div>
        <div style={{fontSize:16, fontWeight:700, color:'var(--ink)'}}>{possession}</div>
      </div>
      <div>
        <div className="eyebrow mb-1">Team fouls</div>
        <div className="tabular mono" style={{fontSize:14, fontWeight:600, color:'var(--ink-soft)'}}>{fouls.away} – {fouls.home}</div>
      </div>
      {bonus && (
        <div style={{marginLeft:'auto'}}>
          <span className="chip" style={{height:22, padding:'0 10px', fontWeight:700, fontSize:11,
            background:'var(--amber-soft)', color:'var(--amber)', borderColor:'#E3CC9B'}}>
            BONUS · {bonus}
          </span>
        </div>
      )}
    </div>
  );
}

function LiveSituationPanel({ game }) {
  const isLive = game.status==='live' || game.status==='warmup';
  if (!isLive) return null;
  let inner = null;
  if (game.league==='mlb' && game.bases) {
    const [b,s] = (game.count||'0-0 count').split(' ')[0].split('-').map(Number);
    inner = <_BaseDiamondLg bases={game.bases} outs={game.outs||0} balls={b||0} strikes={s||0} />;
  } else if (game.league==='nfl' && game.drive) {
    const posTeam = game.possession==='home' ? game.homeTeam.abbreviation : game.awayTeam.abbreviation;
    inner = <_FootballDriveLg {...game.drive} possessionTeam={posTeam} />;
  } else if (game.league==='nhl' && game.hockeyInfo) {
    inner = <_HockeyStripLg {...game.hockeyInfo}
              awayAbbr={game.awayTeam.abbreviation} homeAbbr={game.homeTeam.abbreviation} />;
  } else if (game.league==='nba' && game.bballInfo) {
    inner = <_BasketballStripLg {...game.bballInfo}
              awayAbbr={game.awayTeam.abbreviation} homeAbbr={game.homeTeam.abbreviation} />;
  }
  if (!inner) return null;
  return (
    <div className="card live" style={{padding:16, marginBottom:16}}>
      <div className="flex items-center gap-2 mb-3">
        <span className="pulsedot" style={{width:7, height:7}} />
        <span className="eyebrow">Live situation</span>
        {game.period?.label && <span className="mono" style={{fontSize:11, color:'var(--muted)', marginLeft:6}}>
          {game.period.label}
        </span>}
      </div>
      <div className="flex items-center" style={{gap:24}}>{inner}</div>
    </div>
  );
}

function _Num({ value, big, winner }) {
  return <span className="tabular" style={{
    fontSize: big?52:14, fontWeight: big?700:600, lineHeight:1,
    color: winner ? 'var(--ink)' : 'var(--ink-soft)',
    letterSpacing: big?'-0.03em':'0'
  }}>{value ?? '—'}</span>;
}

function MatchupHero({ game, onBack }) {
  const isLive = game.status==='live' || game.status==='warmup';
  const awayWins = game.status==='final' && game.score.away > game.score.home;
  const homeWins = game.status==='final' && game.score.home > game.score.away;

  return (
    <div className={`card ${isLive?'live':''}`} style={{padding:24, marginBottom:16}}>
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="chip" style={{cursor:'pointer', background:'var(--bg-elev)'}}>
          <span style={{fontSize:13}}>‹</span> Back to scores
        </button>
        <div className="flex items-center gap-3">
          <window.UI.StatusTag status={game.status} period={game.period} startTime={game.startTime} />
          <span className="eyebrow">{(game.league||'').toUpperCase()}</span>
        </div>
      </div>

      <div className="grid" style={{gridTemplateColumns:'1fr auto 1fr', alignItems:'center', gap:24}}>
        {/* Away */}
        <div className="flex items-center gap-4" style={{opacity: homeWins?0.55:1}}>
          <div style={{width:56, height:56, borderRadius:12, background: game.awayTeam.color+'20',
                       border:'1px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'center',
                       fontSize:18, fontWeight:700, color:game.awayTeam.color}}>
            {game.awayTeam.abbreviation}
          </div>
          <div>
            <div style={{fontSize:20, fontWeight:700, letterSpacing:'-0.015em'}}>{game.awayTeam.name}</div>
            <div style={{fontSize:12, color:'var(--muted)'}} className="mono">{game.awayTeam.record}</div>
          </div>
          <div style={{marginLeft:'auto'}}>
            <_Num value={game.status==='scheduled'?'—':game.score.away} big winner={awayWins} />
          </div>
        </div>

        {/* Separator */}
        <div style={{textAlign:'center', color:'var(--faint)', fontSize:11}} className="eyebrow">
          {game.period?.short || game.period?.label || 'at'}
        </div>

        {/* Home */}
        <div className="flex items-center gap-4" style={{opacity: awayWins?0.55:1}}>
          <div style={{marginRight:'auto'}}>
            <_Num value={game.status==='scheduled'?'—':game.score.home} big winner={homeWins} />
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:20, fontWeight:700, letterSpacing:'-0.015em'}}>{game.homeTeam.name}</div>
            <div style={{fontSize:12, color:'var(--muted)'}} className="mono">{game.homeTeam.record}</div>
          </div>
          <div style={{width:56, height:56, borderRadius:12, background: game.homeTeam.color+'20',
                       border:'1px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'center',
                       fontSize:18, fontWeight:700, color:game.homeTeam.color}}>
            {game.homeTeam.abbreviation}
          </div>
        </div>
      </div>

      {(game.situation || game.venue) && (
        <div className="mt-5 pt-4" style={{borderTop:'1px solid var(--line)', display:'flex', gap:24, flexWrap:'wrap'}}>
          {game.situation && (
            <div>
              <div className="eyebrow" style={{marginBottom:2}}>Situation</div>
              <div style={{fontSize:13, color:'var(--ink)', fontWeight:500}}>{game.situation}</div>
            </div>
          )}
          {game.venue && (
            <div>
              <div className="eyebrow" style={{marginBottom:2}}>Venue</div>
              <div style={{fontSize:13, color:'var(--ink)'}}>{game.venue}</div>
            </div>
          )}
          <div>
            <div className="eyebrow" style={{marginBottom:2}}>First pitch</div>
            <div style={{fontSize:13, color:'var(--ink)'}} className="mono">7:10 PM PT</div>
          </div>
          <div>
            <div className="eyebrow" style={{marginBottom:2}}>Broadcast</div>
            <div style={{fontSize:13, color:'var(--ink)'}}>SNET · SportsNet LA</div>
          </div>
        </div>
      )}
    </div>
  );
}

function Linescore({ game }) {
  // Synthetic 9-inning linescore
  const innings = Array.from({length:9}, (_,i)=>i+1);
  const away = [0,0,2,0,1,0,1,null,null];
  const home = [0,1,0,0,2,0,null,null,null];
  const sumA = away.reduce((a,b)=>a+(b||0),0);
  const sumH = home.reduce((a,b)=>a+(b||0),0);
  return (
    <div className="card" style={{padding:0, overflow:'hidden'}}>
      <div style={{padding:'10px 16px', borderBottom:'1px solid var(--line)'}}>
        <span className="eyebrow">Linescore</span>
      </div>
      <div style={{overflowX:'auto'}}>
        <table className="w-full" style={{fontSize:13}}>
          <thead>
            <tr>
              <th className="eyebrow" style={{padding:'8px 14px', textAlign:'left', borderBottom:'1px solid var(--line)'}}>Team</th>
              {innings.map(n=>(
                <th key={n} className="eyebrow mono" style={{padding:'8px 8px', textAlign:'center', color:'var(--muted-2)', fontSize:10, borderBottom:'1px solid var(--line)', minWidth:32}}>{n}</th>
              ))}
              <th className="eyebrow" style={{padding:'8px 12px', textAlign:'center', borderBottom:'1px solid var(--line)', borderLeft:'1px solid var(--line)'}}>R</th>
              <th className="eyebrow" style={{padding:'8px 12px', textAlign:'center', borderBottom:'1px solid var(--line)'}}>H</th>
              <th className="eyebrow" style={{padding:'8px 12px', textAlign:'center', borderBottom:'1px solid var(--line)'}}>E</th>
            </tr>
          </thead>
          <tbody>
            {[{t:game.awayTeam, line:away, sum:sumA, h:9, e:0},
              {t:game.homeTeam, line:home, sum:sumH, h:7, e:1}].map(({t,line,sum,h,e}, i)=>(
              <tr key={t.abbreviation} className="row-hover"
                  style={{borderBottom: i===0?'1px solid var(--line)':'none'}}>
                <td style={{padding:'10px 14px'}}>
                  <div className="flex items-center gap-2">
                    <window.UI.TeamDot color={t.color} />
                    <span style={{fontWeight:600}}>{t.abbreviation}</span>
                    <span style={{color:'var(--muted)', fontSize:12}}>{t.name}</span>
                  </div>
                </td>
                {line.map((v,j)=>(
                  <td key={j} className="tabular mono" style={{padding:'10px 8px', textAlign:'center', color: v==null?'var(--faint)':'var(--ink-soft)'}}>
                    {v==null?'·':v}
                  </td>
                ))}
                <td className="tabular" style={{padding:'10px 12px', textAlign:'center', fontWeight:700, borderLeft:'1px solid var(--line)'}}>{sum}</td>
                <td className="tabular mono" style={{padding:'10px 12px', textAlign:'center', color:'var(--ink-soft)'}}>{h}</td>
                <td className="tabular mono" style={{padding:'10px 12px', textAlign:'center', color:'var(--muted)'}}>{e}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BoxScore({ game }) {
  const batters = [
    { name:'G. Springer',    pos:'RF', ab:4, r:1, h:2, rbi:1, bb:0, so:1, avg:'.287' },
    { name:'B. Bichette',    pos:'SS', ab:4, r:1, h:2, rbi:1, bb:0, so:0, avg:'.304' },
    { name:'V. Guerrero Jr.',pos:'1B', ab:3, r:1, h:1, rbi:1, bb:1, so:0, avg:'.298' },
    { name:'D. Varsho',      pos:'CF', ab:4, r:0, h:1, rbi:0, bb:0, so:1, avg:'.241' },
    { name:'A. Kirk',        pos:'C',  ab:3, r:0, h:0, rbi:0, bb:1, so:1, avg:'.255' },
    { name:'S. Clement',     pos:'LF', ab:3, r:1, h:2, rbi:0, bb:0, so:0, avg:'.268' },
    { name:'E. Clement',     pos:'2B', ab:3, r:0, h:1, rbi:1, bb:0, so:1, avg:'.245' },
    { name:'E. Jiménez',     pos:'DH', ab:4, r:0, h:0, rbi:0, bb:0, so:2, avg:'.229' },
    { name:'A. Barger',      pos:'3B', ab:3, r:0, h:0, rbi:0, bb:1, so:1, avg:'.221' },
  ];
  const head = ['AB','R','H','RBI','BB','SO','AVG'];
  return (
    <div className="card" style={{padding:0, overflow:'hidden'}}>
      <div className="flex items-center justify-between" style={{padding:'10px 16px', borderBottom:'1px solid var(--line)'}}>
        <div className="flex items-center gap-2">
          <window.UI.TeamDot color={game.awayTeam.color} />
          <span className="eyebrow">Batting · {game.awayTeam.abbreviation}</span>
        </div>
        <div className="tabs" style={{padding:2, fontSize:11}}>
          <button className="on">Away</button>
          <button>Home</button>
        </div>
      </div>
      <table className="w-full" style={{fontSize:12.5}}>
        <thead>
          <tr>
            <th className="eyebrow" style={{padding:'8px 14px', textAlign:'left', borderBottom:'1px solid var(--line)'}}>Player</th>
            {head.map(h=>(
              <th key={h} className="eyebrow" style={{padding:'8px 10px', textAlign:'right', color:'var(--muted-2)', fontSize:10, borderBottom:'1px solid var(--line)'}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {batters.map((b,i)=>(
            <tr key={b.name} className="row-hover" style={{borderBottom: i===batters.length-1?'none':'1px solid var(--line)'}}>
              <td style={{padding:'9px 14px'}}>
                <span style={{fontWeight:500, color:'var(--ink)'}}>{b.name}</span>
                <span className="mono" style={{color:'var(--faint)', fontSize:10.5, marginLeft:6}}>{b.pos}</span>
              </td>
              <td className="tabular mono" style={{padding:'9px 10px', textAlign:'right'}}>{b.ab}</td>
              <td className="tabular mono" style={{padding:'9px 10px', textAlign:'right', color: b.r>0?'var(--ink)':'var(--muted)', fontWeight: b.r>0?600:400}}>{b.r}</td>
              <td className="tabular mono" style={{padding:'9px 10px', textAlign:'right', color: b.h>0?'var(--ink)':'var(--muted)', fontWeight: b.h>0?600:400}}>{b.h}</td>
              <td className="tabular mono" style={{padding:'9px 10px', textAlign:'right', color: b.rbi>0?'var(--ink)':'var(--muted)'}}>{b.rbi}</td>
              <td className="tabular mono" style={{padding:'9px 10px', textAlign:'right', color:'var(--muted)'}}>{b.bb}</td>
              <td className="tabular mono" style={{padding:'9px 10px', textAlign:'right', color:'var(--muted)'}}>{b.so}</td>
              <td className="tabular mono" style={{padding:'9px 10px', textAlign:'right', color:'var(--ink-soft)'}}>{b.avg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WinProbabilityChart({ game }) {
  // Soft two-area fill, Blue Jays line on top
  const W = 560, H = 140;
  const pts = [50,52,48,51,55,58,54,52,57,62,60,65,68,71,68,72,76,74,78,82,79,76,72,74];
  const path = pts.map((p,i)=>{
    const x = (i/(pts.length-1))*W;
    const y = H - (p/100)*H;
    return `${i===0?'M':'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const areaTop = path + ` L${W},${H} L0,${H} Z`;
  const areaBot = pts.map((p,i)=>{
    const x = (i/(pts.length-1))*W;
    const y = H - (p/100)*H;
    return `${i===0?'M':'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ') + ` L${W},0 L0,0 Z`;

  const cur = pts[pts.length-1];
  return (
    <div className="card" style={{padding:16}}>
      <div className="flex items-center justify-between mb-2">
        <span className="eyebrow">Win probability</span>
        <div className="flex items-center gap-3" style={{fontSize:11.5}}>
          <span className="flex items-center gap-1.5"><window.UI.TeamDot color={game.awayTeam.color} /> {game.awayTeam.abbreviation} <span className="tabular mono" style={{fontWeight:700, color:'var(--ink)'}}>{cur}%</span></span>
          <span className="flex items-center gap-1.5"><window.UI.TeamDot color={game.homeTeam.color} /> {game.homeTeam.abbreviation} <span className="tabular mono" style={{color:'var(--muted)'}}>{100-cur}%</span></span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%', height:140, display:'block'}}>
        <defs>
          <linearGradient id="wpa-top" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={game.awayTeam.color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={game.awayTeam.color} stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="wpa-bot" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={game.homeTeam.color} stopOpacity="0.12" />
            <stop offset="100%" stopColor={game.homeTeam.color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {/* 50% baseline */}
        <line x1="0" y1={H/2} x2={W} y2={H/2} stroke="var(--line-2)" strokeDasharray="2 4" />
        <path d={areaBot} fill="url(#wpa-bot)" />
        <path d={areaTop} fill="url(#wpa-top)" />
        <path d={path} stroke={game.awayTeam.color} strokeWidth="1.6" fill="none" />
        {/* End marker */}
        <circle cx={W} cy={H - (cur/100)*H} r="3.5" fill={game.awayTeam.color} stroke="var(--bg-elev)" strokeWidth="1.5" />
      </svg>
      <div className="flex items-center justify-between mt-2" style={{fontSize:10.5, color:'var(--faint)'}} className="mono">
        <span>1st</span><span>3rd</span><span>5th</span><span>7th</span><span>9th</span>
      </div>
    </div>
  );
}

function ScoringPlays({ game }) {
  const plays = [
    { inning:'B 2', team:'home', score:'1–0', text:'Mookie Betts singles to center, Shohei Ohtani scores.', badge:'1B' },
    { inning:'T 3', team:'away', score:'2–1', text:'Bo Bichette 2-run homer (6) to left field.', badge:'HR' },
    { inning:'B 5', team:'home', score:'3–2', text:'Freddie Freeman doubles to right, two runs score.', badge:'2B' },
    { inning:'T 5', team:'away', score:'3–3', text:'V. Guerrero Jr. sac fly to center, Springer scores.', badge:'SF' },
    { inning:'T 7', team:'away', score:'4–3', text:'Bo Bichette RBI single up the middle, Springer scores.', badge:'1B', fresh:true },
  ];
  return (
    <div className="card" style={{padding:0, overflow:'hidden'}}>
      <div style={{padding:'10px 16px', borderBottom:'1px solid var(--line)'}}>
        <span className="eyebrow">Scoring plays</span>
      </div>
      <ol style={{margin:0, padding:'6px 0'}}>
        {plays.map((p,i)=>{
          const team = p.team==='home' ? game.homeTeam : game.awayTeam;
          return (
            <li key={i} className={`flex items-start gap-3 row-hover ${p.fresh?'flash':''}`}
                style={{padding:'12px 16px', borderTop: i===0?'none':'1px solid var(--line)', listStyle:'none'}}>
              <span className="mono" style={{fontSize:11, color:'var(--muted)', width:32, flex:'none', paddingTop:2}}>{p.inning}</span>
              <span className="chip" style={{height:20, padding:'0 8px', fontSize:10.5, fontWeight:600,
                     background: team.color+'18', color: team.color, borderColor: team.color+'40'}}>{p.badge}</span>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:13, color:'var(--ink)', lineHeight:1.45}}>{p.text}</div>
              </div>
              <span className="tabular mono" style={{fontSize:12, fontWeight:700, color:'var(--ink)', flex:'none'}}>{p.score}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function TeamStatsBar({ game }) {
  const rows = [
    { k:'Hits',     a:9,   h:7,   fmt:v=>v },
    { k:'Errors',   a:0,   h:1,   fmt:v=>v },
    { k:'LOB',      a:6,   h:8,   fmt:v=>v },
    { k:'AVG',      a:.287,h:.264,fmt:v=>v.toFixed(3).slice(1) },
    { k:'Pitches',  a:96,  h:104, fmt:v=>v },
  ];
  function Bar({ a, h }) {
    const total = (a+h) || 1;
    const pa = (a/total)*100;
    return (
      <div style={{display:'flex', height:6, borderRadius:999, overflow:'hidden', background:'var(--bg-sunken)', border:'1px solid var(--line)'}}>
        <div style={{width:pa+'%', background:game.awayTeam.color}} />
        <div style={{width:(100-pa)+'%', background:game.homeTeam.color, opacity:0.75}} />
      </div>
    );
  }
  return (
    <div className="card" style={{padding:16}}>
      <div className="flex items-center justify-between mb-3">
        <span className="eyebrow">Team comparison</span>
        <div className="flex items-center gap-3" style={{fontSize:11, color:'var(--muted)'}}>
          <span className="flex items-center gap-1.5"><window.UI.TeamDot color={game.awayTeam.color} />{game.awayTeam.abbreviation}</span>
          <span className="flex items-center gap-1.5"><window.UI.TeamDot color={game.homeTeam.color} />{game.homeTeam.abbreviation}</span>
        </div>
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:10}}>
        {rows.map(r=>(
          <div key={r.k} style={{display:'grid', gridTemplateColumns:'48px 1fr 48px 60px 48px', alignItems:'center', gap:10}}>
            <span className="tabular mono" style={{fontSize:12, fontWeight:700, textAlign:'right'}}>{r.fmt(r.a)}</span>
            <Bar a={r.a} h={r.h} />
            <span className="tabular mono" style={{fontSize:12, fontWeight:700, textAlign:'left'}}>{r.fmt(r.h)}</span>
            <span className="eyebrow" style={{textAlign:'center'}}>{r.k}</span>
            <span />
          </div>
        ))}
      </div>
    </div>
  );
}

function GameDetail({ game, onBack }) {
  if (!game) return null;
  return (
    <div className="fadein">
      <MatchupHero game={game} onBack={onBack} />
      <LiveSituationPanel game={game} />
      {game.league==='mlb' && (
        <div className="grid gap-4" style={{gridTemplateColumns:'1fr', marginBottom:16}}>
          <Linescore game={game} />
        </div>
      )}
      <div className="grid gap-4" style={{gridTemplateColumns:'1.3fr 1fr', alignItems:'start', marginBottom:16}}>
        <WinProbabilityChart game={game} />
        <TeamStatsBar game={game} />
      </div>
      <div className="grid gap-4" style={{gridTemplateColumns:'1.3fr 1fr', alignItems:'start'}}>
        <BoxScore game={game} />
        <ScoringPlays game={game} />
      </div>
    </div>
  );
}

window.GameDetail = GameDetail;
