// ---- Scoreboard ----
const { StatusTag, LeagueGlyph, TeamDot, SectionHeader, Eyebrow, LiveTag, formatTime } = window.UI;

// Baseball diamond showing base runners
function BaseDiamond({ bases = { first:false, second:false, third:false }, outs = 0 }) {
  const on = (b) => bases[b] ? 'var(--live)' : 'transparent';
  const stroke = (b) => bases[b] ? 'var(--live)' : 'var(--line-2)';
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 28 28" width="26" height="26" style={{display:'block'}}>
        {/* second base (top) */}
        <rect x="10.5" y="3" width="7" height="7" transform="rotate(45 14 6.5)"
              fill={on('second')} stroke={stroke('second')} strokeWidth="1.2" />
        {/* third base (left) */}
        <rect x="3" y="10.5" width="7" height="7" transform="rotate(45 6.5 14)"
              fill={on('third')} stroke={stroke('third')} strokeWidth="1.2" />
        {/* first base (right) */}
        <rect x="18" y="10.5" width="7" height="7" transform="rotate(45 21.5 14)"
              fill={on('first')} stroke={stroke('first')} strokeWidth="1.2" />
      </svg>
      <div style={{display:'flex', gap:3}}>
        {[0,1,2].map(i=>(
          <span key={i} style={{width:6, height:6, borderRadius:999,
            background: i < outs ? 'var(--ink)' : 'transparent',
            border: i < outs ? '0' : '1px solid var(--line-2)'}} />
        ))}
      </div>
      <span className="mono" style={{fontSize:9.5, color:'var(--muted)', letterSpacing:'0.08em', textTransform:'uppercase'}}>
        {outs} out
      </span>
    </div>
  );
}

// Football drive indicator (down/distance/possession arrow + field position)
function FootballDrive({ down, distance, yardLine, possession, redZone }) {
  return (
    <div className="flex items-center gap-2.5" style={{width:'100%'}}>
      <span style={{fontSize:11, fontWeight:700, color: redZone?'var(--live)':'var(--ink)'}}>
        {down}{down===1?'st':down===2?'nd':down===3?'rd':'th'} & {distance}
      </span>
      <span style={{color:'var(--muted-2)', fontSize:11}}>·</span>
      <span className="mono" style={{fontSize:11, color:'var(--muted)'}}>at {yardLine}</span>
      <div style={{flex:1, height:4, background:'var(--bg-sunken)', borderRadius:999, position:'relative', border:'1px solid var(--line)'}}>
        <div style={{position:'absolute', left:0, top:0, bottom:0, width:`${yardLine}%`,
                     background: redZone?'var(--live)':'var(--ink)', borderRadius:999, opacity:0.8}} />
        <span style={{position:'absolute', top:-3, left:`${yardLine}%`, transform:'translateX(-50%)',
                      fontSize:10, color: redZone?'var(--live)':'var(--ink-soft)'}}>▾</span>
      </div>
      {redZone && <span className="chip" style={{height:18, padding:'0 6px', fontSize:9.5, fontWeight:700,
        background:'var(--live-soft)', color:'var(--live)', borderColor:'var(--live-line)'}}>RED ZONE</span>}
    </div>
  );
}

// Hockey: power play / shots
function HockeyStrip({ shots, powerPlay }) {
  return (
    <div className="flex items-center gap-3" style={{fontSize:11}}>
      <span style={{color:'var(--muted)'}}>SOG</span>
      <span className="mono tabular" style={{color:'var(--ink)', fontWeight:600}}>{shots.away}–{shots.home}</span>
      {powerPlay && <span className="chip" style={{height:18, padding:'0 6px', fontSize:9.5, fontWeight:700,
        background:'var(--live-soft)', color:'var(--live)', borderColor:'var(--live-line)'}}>
        PP · {powerPlay.team} {powerPlay.time}
      </span>}
    </div>
  );
}

// Basketball: possession + team fouls
function BasketballStrip({ possession, fouls, bonus }) {
  return (
    <div className="flex items-center gap-3" style={{fontSize:11}}>
      <span style={{color:'var(--muted)'}}>Poss</span>
      <span style={{fontWeight:700, color:'var(--ink)'}}>{possession}</span>
      <span style={{color:'var(--faint)'}}>·</span>
      <span style={{color:'var(--muted)'}}>Fouls</span>
      <span className="mono tabular" style={{color:'var(--ink-soft)'}}>{fouls.away}–{fouls.home}</span>
      {bonus && <span className="chip" style={{height:18, padding:'0 6px', fontSize:9.5, fontWeight:700,
        background:'var(--amber-soft)', color:'var(--amber)', borderColor:'#E3CC9B'}}>BONUS · {bonus}</span>}
    </div>
  );
}

function ScoreNum({ value, changed, live, winner }) {
  return (
    <span
      className={`score-num tabular ${changed ? 'changed' : ''}`}
      style={{
        fontSize:28, fontWeight:700, lineHeight:1,
        color: winner ? 'var(--ink)' : live ? 'var(--ink-soft)' : 'var(--muted)',
        letterSpacing:'-0.02em',
      }}>
      {value == null ? <span style={{color:'var(--faint)', fontWeight:500}}>—</span> : value}
    </span>
  );
}

function TeamRow({ team, score, isWinner, isLive, dim, changed, possession }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <div className="flex items-center gap-2.5 min-w-0">
        <TeamDot color={team.color} />
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span style={{fontSize:13, fontWeight:600, color: isWinner ? 'var(--ink)' : dim ? 'var(--muted)' : 'var(--ink-soft)'}}>
              {team.abbreviation}
            </span>
            {possession && <span style={{fontSize:10, color:'var(--live)'}}>●</span>}
            <span style={{fontSize:12, color:'var(--muted)', fontWeight:400}} className="truncate">
              {team.name}
            </span>
          </div>
          {team.record && <div style={{fontSize:10.5, color:'var(--faint)', fontWeight:500}} className="mono">{team.record}</div>}
        </div>
      </div>
      <ScoreNum value={score} live={isLive} winner={isWinner} changed={changed} />
    </div>
  );
}

function GameCard({ game, onClick, flashTeam }) {
  const isLive = game.status==='live' || game.status==='warmup';
  const isDelayed = game.status==='delayed';
  const isFinal = game.status==='final';
  const homeWins = isFinal && game.score.home > game.score.away;
  const awayWins = isFinal && game.score.away > game.score.home;

  return (
    <button
      onClick={onClick}
      className={`card hoverable ${isLive?'live':''} ${isDelayed?'delayed':''} text-left w-full`}
      style={{padding:'var(--pad)', display:'block'}}
    >
      <div className="flex items-center justify-between mb-3">
        <StatusTag status={game.status} period={game.period} startTime={game.startTime} />
        <div className="flex items-center gap-2">
          <LeagueGlyph league={game.league} />
          <span className="eyebrow" style={{fontSize:10}}>{(game.league||'').toUpperCase()}</span>
        </div>
      </div>

      <div>
        <TeamRow team={game.awayTeam} score={game.status==='scheduled'?null:game.score.away}
                 isWinner={awayWins} isLive={isLive} dim={isLive && game.score.away < game.score.home}
                 changed={flashTeam==='away'} possession={isLive && game.possession==='away'} />
        <div className="hairline my-1"></div>
        <TeamRow team={game.homeTeam} score={game.status==='scheduled'?null:game.score.home}
                 isWinner={homeWins} isLive={isLive} dim={isLive && game.score.home < game.score.away}
                 changed={flashTeam==='home'} possession={isLive && game.possession==='home'} />
      </div>

      {/* Sport-specific live strip */}
      {isLive && game.league==='mlb' && game.bases && (
        <div className="mt-3 pt-2.5 flex items-center justify-between" style={{borderTop:'1px solid var(--line)'}}>
          <BaseDiamond bases={game.bases} outs={game.outs||0} />
          <span style={{fontSize:11, color:'var(--ink-soft)', fontWeight:500}}>{game.count || ''}</span>
        </div>
      )}
      {isLive && game.league==='nfl' && game.drive && (
        <div className="mt-3 pt-2.5" style={{borderTop:'1px solid var(--line)'}}>
          <FootballDrive {...game.drive} />
        </div>
      )}
      {isLive && game.league==='nhl' && game.hockeyInfo && (
        <div className="mt-3 pt-2.5" style={{borderTop:'1px solid var(--line)'}}>
          <HockeyStrip {...game.hockeyInfo} />
        </div>
      )}
      {isLive && game.league==='nba' && game.bballInfo && (
        <div className="mt-3 pt-2.5" style={{borderTop:'1px solid var(--line)'}}>
          <BasketballStrip {...game.bballInfo} />
        </div>
      )}

      {!isLive && (game.situation || game.venue) && (
        <div className="mt-3 pt-2.5" style={{borderTop:'1px solid var(--line)'}}>
          {game.situation && (
            <div style={{fontSize:11.5, color:'var(--ink-soft)', fontWeight:500}}>{game.situation}</div>
          )}
          {game.venue && !game.situation && (
            <div style={{fontSize:11, color:'var(--muted)'}}>{game.venue}</div>
          )}
        </div>
      )}
    </button>
  );
}

function DayTabs({ value, onChange }) {
  return (
    <div className="tabs">
      {[['yesterday','Yesterday'],['today','Today'],['tomorrow','Tomorrow']].map(([id,label])=>(
        <button key={id} className={value===id?'on':''} onClick={()=>onChange(id)}>
          {label}
          {id==='today' && value==='today' && <span style={{display:'inline-block', width:6, height:6, borderRadius:999, background:'var(--live)', marginLeft:6, verticalAlign:'middle'}} />}
        </button>
      ))}
    </div>
  );
}

function LeagueTabs({ value, onChange }) {
  return (
    <div className="tabs">
      {[['all','All'],['nfl','NFL'],['mlb','MLB'],['nhl','NHL'],['nba','NBA']].map(([id,label])=>(
        <button key={id} className={value===id?'on':''} onClick={()=>onChange(id)}>{label}</button>
      ))}
    </div>
  );
}

function Section({ label, games, live, onSelect, flashMap }) {
  if (!games.length) return null;
  return (
    <section className="mb-8 fadein">
      <SectionHeader label={label} count={games.length} live={live} />
      <div className="grid gap-4" style={{gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'var(--gap)'}}>
        {games.map(g=>(
          <GameCard key={g.gameId} game={g} onClick={()=>onSelect?.(g)} flashTeam={flashMap?.[g.gameId]} />
        ))}
      </div>
    </section>
  );
}

// Sport-specific bases on MLB games in the default dataset
function enrichGames() {
  const g1 = window.LS_DATA.GAMES.find(g=>g.gameId==='g1');
  if (g1 && !g1.bases) { g1.bases={first:false, second:true, third:false}; g1.outs=2; g1.count='2-1 count'; }
  const g2 = window.LS_DATA.GAMES.find(g=>g.gameId==='g2');
  if (g2 && !g2.bases) { g2.bases={first:true, second:false, third:false}; g2.outs=1; g2.count='0-0 count'; }
  const n1 = window.LS_DATA.ALL_GAMES.nhl[0];
  if (n1 && !n1.hockeyInfo) { n1.hockeyInfo={ shots:{away:22, home:18}, powerPlay:{team:'TOR', time:'1:23'} }; }
  const b1 = window.LS_DATA.ALL_GAMES.nba[0];
  if (b1 && !b1.bballInfo) { b1.bballInfo={ possession:'DEN', fouls:{away:7, home:5}, bonus:'OKC' }; b1.possession='home'; }
}
enrichGames();

// NFL sample games
const NFL_GAMES = [
  { gameId:'f1', league:'nfl', status:'live',
    awayTeam:{ abbreviation:'KC',  name:'Chiefs',   record:'12-4', color:'#E31837' },
    homeTeam:{ abbreviation:'BUF', name:'Bills',    record:'13-3', color:'#00338D' },
    score:{away:21, home:17}, period:{label:'Q3 · 8:42', short:'Q3'},
    possession:'away',
    drive:{ down:2, distance:7, yardLine:38, redZone:false } },
  { gameId:'f2', league:'nfl', status:'live',
    awayTeam:{ abbreviation:'DAL', name:'Cowboys',  record:'9-7',  color:'#003594' },
    homeTeam:{ abbreviation:'PHI', name:'Eagles',   record:'11-5', color:'#004C54' },
    score:{away:10, home:24}, period:{label:'Q4 · 3:15', short:'Q4'},
    possession:'home',
    drive:{ down:1, distance:'Goal', yardLine:92, redZone:true } },
  { gameId:'f3', league:'nfl', status:'scheduled',
    awayTeam:{ abbreviation:'SF',  name:'49ers',    record:'10-6', color:'#AA0000' },
    homeTeam:{ abbreviation:'GB',  name:'Packers',  record:'11-5', color:'#203731' },
    score:{away:null, home:null}, startTime:'2026-04-18T20:20' },
  { gameId:'f4', league:'nfl', status:'final',
    awayTeam:{ abbreviation:'MIA', name:'Dolphins', record:'8-8',  color:'#008E97' },
    homeTeam:{ abbreviation:'NYJ', name:'Jets',     record:'6-10', color:'#125740' },
    score:{away:27, home:13}, period:{label:'Final'} },
];
window.LS_DATA.ALL_GAMES.nfl = NFL_GAMES;

function Scoreboard({ league, day, onSelect, flashMap }) {
  const all = league==='all'
    ? [...(window.LS_DATA.ALL_GAMES.nfl||[]), ...window.LS_DATA.ALL_GAMES.mlb, ...window.LS_DATA.ALL_GAMES.nhl, ...window.LS_DATA.ALL_GAMES.nba]
    : window.LS_DATA.ALL_GAMES[league] || [];
  const live = all.filter(g=>g.status==='live'||g.status==='warmup');
  const delayed = all.filter(g=>g.status==='delayed');
  const upcoming = all.filter(g=>g.status==='scheduled');
  const final = all.filter(g=>g.status==='final');
  return (
    <div>
      <Section label="Live Now" games={live} live onSelect={onSelect} flashMap={flashMap} />
      <Section label="Delayed" games={delayed} onSelect={onSelect} flashMap={flashMap} />
      <Section label="Upcoming" games={upcoming} onSelect={onSelect} flashMap={flashMap} />
      <Section label="Final" games={final} onSelect={onSelect} flashMap={flashMap} />
    </div>
  );
}

window.Scoreboard = Scoreboard;
window.DayTabs = DayTabs;
window.LeagueTabs = LeagueTabs;
