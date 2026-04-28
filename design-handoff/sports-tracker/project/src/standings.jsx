// ---- Standings ----
const { Eyebrow, SectionHeader } = window.UI;

function PlayoffMarker({ status }) {
  const colors = {
    'in':         { bg:'var(--win)',   label:'Playoff / Clinched' },
    'bubble':     { bg:'var(--amber)', label:'Bubble / Play-In' },
    'eliminated': { bg:'var(--faint)', label:'Eliminated' },
    'out':        { bg:'transparent', label:'' },
  };
  const c = colors[status] || colors.out;
  if (!c.bg || c.bg === 'transparent') return <span style={{display:'inline-block', width:6, height:6}} />;
  return <span title={c.label} style={{display:'inline-block', width:6, height:6, borderRadius:999, background:c.bg, flex:'none'}} />;
}

function StandingsTable({ name, teams }) {
  return (
    <div className="card" style={{overflow:'hidden', padding:0}}>
      <div className="flex items-center justify-between" style={{padding:'10px 14px', borderBottom:'1px solid var(--line)'}}>
        <Eyebrow>{name}</Eyebrow>
        <span className="mono" style={{fontSize:10.5, color:'var(--faint)'}}>{teams.length} teams</span>
      </div>
      <table className="w-full" style={{fontSize:12.5}}>
        <thead>
          <tr>
            {['Team','W','L','PCT','GB','L10','STRK'].map((h,i)=>(
              <th key={h} className="eyebrow"
                  style={{padding:'8px 10px', textAlign:i===0?'left':'right', color:'var(--muted-2)', fontSize:10, borderBottom:'1px solid var(--line)'}}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {teams.map((t,i)=>(
            <tr key={t.abbreviation} className="row-hover"
                style={{borderBottom: i===teams.length-1?'none':'1px solid var(--line)',
                        background: t.playoffStatus==='eliminated' ? 'rgba(0,0,0,0.01)' : t.playoffStatus==='in' && i===0 ? 'var(--win-soft)' : 'transparent',
                        opacity: t.playoffStatus==='eliminated' ? 0.55 : 1}}>
              <td style={{padding:'9px 10px'}}>
                <div className="flex items-center gap-2.5">
                  <span className="mono" style={{color:'var(--faint)', fontSize:10.5, width:14, textAlign:'right'}}>{i+1}</span>
                  <PlayoffMarker status={t.playoffStatus} />
                  <span style={{fontWeight:600, color:'var(--ink)'}}>{t.abbreviation}</span>
                  <span style={{color:'var(--muted)', fontSize:12}} className="truncate">{t.name}</span>
                </div>
              </td>
              <td className="tabular" style={{padding:'9px 10px', textAlign:'right', fontWeight:600}}>{t.wins}</td>
              <td className="tabular" style={{padding:'9px 10px', textAlign:'right', color:'var(--ink-soft)'}}>{t.losses}</td>
              <td className="tabular mono" style={{padding:'9px 10px', textAlign:'right', color:'var(--ink-soft)'}}>{t.pct}</td>
              <td className="tabular" style={{padding:'9px 10px', textAlign:'right', color:'var(--muted)'}}>{t.gamesBack}</td>
              <td className="tabular mono" style={{padding:'9px 10px', textAlign:'right', color:'var(--ink-soft)'}}>{t.last10}</td>
              <td className="tabular mono" style={{padding:'9px 10px', textAlign:'right', fontWeight:600,
                  color: t.streak?.startsWith('W') ? 'var(--win)' : 'var(--loss)'}}>
                {t.streak}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StandingsLegend() {
  const items = [
    ['var(--win)','Playoff / Clinched'],
    ['var(--amber)','Bubble / Play-In'],
    ['var(--faint)','Eliminated'],
  ];
  return (
    <div className="flex items-center gap-4 flex-wrap">
      {items.map(([c,l])=>(
        <span key={l} className="flex items-center gap-1.5" style={{fontSize:11, color:'var(--muted)'}}>
          <span style={{display:'inline-block', width:6, height:6, borderRadius:999, background:c}} />
          {l}
        </span>
      ))}
    </div>
  );
}

function Standings() {
  const data = [
    { conf:'American League', divisions: window.LS_DATA.MLB_STANDINGS.divisions },
    { conf:'National League', divisions: window.LS_DATA.NL_STANDINGS.divisions },
  ];
  return (
    <div className="fadein">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h2 style={{fontSize:24, fontWeight:700, letterSpacing:'-0.02em', marginBottom:2}}>MLB Standings</h2>
          <div style={{fontSize:12, color:'var(--muted)'}}>2026 Regular Season · through Apr 17</div>
        </div>
        <StandingsLegend />
      </div>
      {data.map(({conf, divisions})=>(
        <div key={conf} className="mb-7">
          <SectionHeader label={conf} />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4" style={{gap:'var(--gap)'}}>
            {Object.entries(divisions).map(([name, teams])=>(
              <StandingsTable key={name} name={name} teams={teams} />
            ))}
          </div>
        </div>
      ))}
      <p style={{fontSize:10.5, color:'var(--faint)', textAlign:'center', marginTop:24}} className="mono">
        x · clinched playoff &nbsp;·&nbsp; y · clinched division &nbsp;·&nbsp; z · best record &nbsp;·&nbsp; e · eliminated
      </p>
    </div>
  );
}

window.Standings = Standings;
