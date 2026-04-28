// ---- Playoffs bracket ----
const { SectionHeader, LiveTag } = window.UI;

function WinPips({ wins, needed }) {
  return (
    <span className="inline-flex items-center gap-1">
      {Array.from({length: needed}).map((_,i)=>(
        <span key={i} style={{
          display:'inline-block', width:6, height:6, borderRadius:999,
          background: i < wins ? 'var(--ink)' : 'transparent',
          border: i < wins ? '0' : '1px solid var(--line-2)',
        }} />
      ))}
    </span>
  );
}

function SeriesCard({ series }) {
  const { topSeed, bottomSeed, neededToWin, status, conference } = series;
  const isComplete = status==='complete';
  const isLive = status==='live';
  const isUp = status==='upcoming';
  const topWins = isComplete && topSeed.wins === neededToWin;
  const botWins = isComplete && bottomSeed.wins === neededToWin;

  const leader = topSeed.wins > bottomSeed.wins ? topSeed : bottomSeed.wins > topSeed.wins ? bottomSeed : null;
  const tieLabel = topSeed.wins === bottomSeed.wins && !isUp ? `tied ${topSeed.wins}–${bottomSeed.wins}` : null;
  const statusLabel = isComplete
    ? `${leader?.abbreviation || ''} wins ${leader?.wins}–${Math.min(topSeed.wins,bottomSeed.wins)}`
    : isLive
      ? (tieLabel || `${leader.abbreviation} leads ${Math.max(topSeed.wins,bottomSeed.wins)}–${Math.min(topSeed.wins,bottomSeed.wins)}`)
      : 'Awaiting matchup';

  function Row({ team, isWin, isDim }) {
    const tbd = team.abbreviation === 'TBD';
    return (
      <div className="flex items-center justify-between" style={{padding:'10px 12px', opacity: isDim?0.5:1}}>
        <div className="flex items-center gap-2">
          {team.seed > 0 && !tbd && (
            <span className="mono" style={{fontSize:10, color:'var(--faint)', width:12}}>{team.seed}</span>
          )}
          {!team.seed && !tbd && <span style={{width:12}} />}
          <span style={{fontSize:13, fontWeight: isWin?700:600, color: tbd ? 'var(--faint)' : 'var(--ink)'}}>
            {tbd ? 'TBD' : team.abbreviation}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <WinPips wins={team.wins} needed={neededToWin} />
          <span className="tabular" style={{fontSize:16, fontWeight:700, color: tbd ? 'var(--faint)' : isWin ? 'var(--ink)' : 'var(--ink-soft)', width:14, textAlign:'right'}}>
            {tbd ? '' : team.wins}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`card ${isLive?'live':''}`} style={{padding:0, overflow:'hidden', background: isUp ? 'var(--bg-elev)' : undefined}}>
      <div className="flex items-center justify-between" style={{padding:'7px 12px', borderBottom:'1px solid var(--line)'}}>
        {isLive ? <LiveTag label="Live" />
          : isComplete ? <span className="eyebrow" style={{color:'var(--muted)'}}>Final</span>
          : <span className="eyebrow" style={{color:'var(--faint)'}}>Upcoming</span>}
        {conference && <span className="eyebrow" style={{fontSize:9.5, color:'var(--muted-2)'}}>{conference}</span>}
      </div>
      <Row team={topSeed} isWin={topWins} isDim={isComplete && !topWins} />
      <div className="hairline" />
      <Row team={bottomSeed} isWin={botWins} isDim={isComplete && !botWins} />
      <div style={{padding:'7px 12px', borderTop:'1px solid var(--line)', background:'var(--bg-sunken)'}}>
        <span style={{fontSize:11, color: isLive ? 'var(--live)' : isComplete ? 'var(--win)' : 'var(--muted)', fontWeight:500}}>
          {statusLabel}
        </span>
      </div>
    </div>
  );
}

function RoundColumn({ round }) {
  return (
    <div className="flex flex-col" style={{gap: 'var(--gap)', flex:1, minWidth:200}}>
      <div className="flex items-center gap-2">
        <span className="eyebrow">{round.roundName}</span>
        <span className="eyebrow" style={{color:'var(--faint)'}}>{round.series.length}</span>
      </div>
      <div className="flex flex-col" style={{gap:'var(--gap)', flex:1, justifyContent:'space-around'}}>
        {round.series.map(s => <SeriesCard key={s.seriesId} series={s} />)}
      </div>
    </div>
  );
}

function Playoffs() {
  const { rounds } = window.LS_DATA.PLAYOFFS;
  return (
    <div className="fadein">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h2 style={{fontSize:24, fontWeight:700, letterSpacing:'-0.02em', marginBottom:2}}>MLB Playoffs</h2>
          <div style={{fontSize:12, color:'var(--muted)'}}>2026 Postseason · Division Series</div>
        </div>
        <LiveTag label="Live · 3 series" />
      </div>

      <div className="flex" style={{gap:'var(--gap)', alignItems:'stretch', overflowX:'auto', paddingBottom:8}}>
        {rounds.map(r=><RoundColumn key={r.roundNumber} round={r} />)}
      </div>
    </div>
  );
}

window.Playoffs = Playoffs;
