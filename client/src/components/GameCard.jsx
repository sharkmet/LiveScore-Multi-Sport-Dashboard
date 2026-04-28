import { formatStartTime } from '../utils/formatters.js'

const TEAM_COLORS = {
  // MLB
  NYY: '#003087', TOR: '#134A8E', BAL: '#DF4601', BOS: '#BD3039',
  NYM: '#002D72', PHI: '#E81828', ATL: '#13274F', WSH: '#AB0003',
  MIA: '#00A3E0', SF:  '#FD5A1E', LAD: '#005A9C', SD:  '#2F241D',
  COL: '#33006F', ARI: '#A71930', STL: '#C41E3A', CHC: '#0E3386',
  MIL: '#12284B', CIN: '#C6011F', PIT: '#27251F', HOU: '#EB6E1F',
  SEA: '#0C2C56', OAK: '#003831', TEX: '#003278', LAA: '#BA0021',
  MIN: '#002B5C', CLE: '#00385D', DET: '#0C2340', KC:  '#004687',
  CWS: '#27251F', TB:  '#092C5C',
  // NHL (non-overlapping abbreviations only)
  TBL: '#002868', NYR: '#0038A8', CAR: '#CC0000', FLA: '#041E42',
  BUF: '#00338D', MTL: '#AF1E2D', OTT: '#C52032', CGY: '#C8102E',
  EDM: '#FF4C00', VAN: '#00205B', ANA: '#FC4C02', LAK: '#111111',
  SJS: '#006D75', NSH: '#FFB81C', WPG: '#041E42', DAL: '#006847',
  VGK: '#B4975A', CBJ: '#002654', NJD: '#CE1126', NYI: '#003087',
  // NBA
  GSW: '#006BB6', LAL: '#552583', PHX: '#1D1160', BKN: '#000000',
  OKC: '#007AC1', UTA: '#002B5C', DEN: '#0E2240', POR: '#E03A3E',
  SAC: '#5A2D81', MEM: '#5D76A9', NOP: '#0C2340', SAS: '#C4CED4',
}

function LeagueGlyph({ league, size = 18 }) {
  const lbl = (league || '').toUpperCase()
  return (
    <span style={{
      width: size, height: size, fontSize: size * 0.5, fontWeight: 700,
      color: 'var(--muted)', background: 'var(--bg-sunken)', border: '1px solid var(--line)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4,
      flexShrink: 0,
    }}>
      {lbl[0] || '·'}
    </span>
  )
}

function StatusTag({ status, period, startTime }) {
  if (status === 'live') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className="pulsedot" />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--live)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {period?.short || period?.label || 'Live'}
        </span>
      </div>
    )
  }
  if (status === 'warmup') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className="pulsedot" />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--live)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Warmup
        </span>
      </div>
    )
  }
  if (status === 'delayed') {
    return (
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        ⏸ Delayed
      </span>
    )
  }
  if (status === 'final') {
    return (
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Final
      </span>
    )
  }
  return (
    <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>
      {formatStartTime(startTime)}
    </span>
  )
}

function TeamDot({ color }) {
  return (
    <span style={{
      width: 8, height: 8, borderRadius: 999, flexShrink: 0,
      background: color || 'var(--muted-2)',
      border: '1px solid rgba(31,29,26,0.08)',
    }} />
  )
}

function TeamRow({ team, score, isWinner, isLive, dim, changed, possession }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '6px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <TeamDot color={team.color} />
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{
              fontSize: 13, fontWeight: 600,
              color: isWinner ? 'var(--ink)' : dim ? 'var(--muted)' : 'var(--ink-soft)',
            }}>
              {team.abbreviation}
            </span>
            {possession && (
              <span style={{ fontSize: 10, color: 'var(--live)' }}>●</span>
            )}
            <span style={{ fontSize: 12, color: 'var(--muted-2)', fontWeight: 400 }} className="truncate">
              {team.name}
            </span>
          </div>
          {team.record && (
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--faint)', fontWeight: 500 }}>{team.record}</div>
          )}
        </div>
      </div>
      <span
        className={`score-num tabular ${changed ? 'changed' : ''}`}
        style={{
          fontSize: 26, fontWeight: 700, lineHeight: 1,
          color: isWinner ? 'var(--ink)' : isLive ? 'var(--ink-soft)' : 'var(--muted)',
          letterSpacing: '-0.02em',
        }}
      >
        {score == null ? <span style={{ color: 'var(--faint)', fontWeight: 400 }}>—</span> : score}
      </span>
    </div>
  )
}

function BaseDiamond({ bases = {}, outs = 0, balls = 0, strikes = 0 }) {
  const on  = (b) => bases[b] ? 'var(--live)' : 'transparent'
  const str = (b) => bases[b] ? 'var(--live)' : 'var(--line-2)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg viewBox="0 0 30 30" width="28" height="28">
        <rect x="11" y="2"  width="8" height="8" transform="rotate(45 15 6)"   fill={on('second')} stroke={str('second')} strokeWidth="1.3" />
        <rect x="2"  y="11" width="8" height="8" transform="rotate(45 6 15)"   fill={on('third')}  stroke={str('third')}  strokeWidth="1.3" />
        <rect x="20" y="11" width="8" height="8" transform="rotate(45 24 15)"  fill={on('first')}  stroke={str('first')}  strokeWidth="1.3" />
        <rect x="11" y="20" width="8" height="8" transform="rotate(45 15 24)"  fill="var(--bg-elev)" stroke="var(--line-2)" strokeWidth="1.3" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              width: 6, height: 6, borderRadius: 999,
              background: i < outs ? 'var(--ink)' : 'transparent',
              border: i < outs ? '0' : '1px solid var(--line-2)',
            }} />
          ))}
        </div>
        <span className="mono" style={{ fontSize: 9.5, color: 'var(--muted)', letterSpacing: '0.04em' }}>
          {balls}-{strikes} · {outs} out
        </span>
      </div>
    </div>
  )
}

function FootballDrive({ down, distance, yardLine, possession, redZone, clock }) {
  const ord = n => n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
      {clock && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <span style={{ color: 'var(--muted)', fontSize: 11 }}>Clock</span>
          <span className="mono tabular" style={{ fontWeight: 700, color: 'var(--ink-soft)', fontSize: 11 }}>{clock}</span>
        </span>
      )}
      {clock && down && <span style={{ color: 'var(--line-2)', fontSize: 11 }}>·</span>}
      <span style={{ fontSize: 11, fontWeight: 700, color: redZone ? 'var(--live)' : 'var(--ink)', whiteSpace: 'nowrap' }}>
        {down}{ord(down)} &amp; {distance}
      </span>
      <span style={{ color: 'var(--muted-2)', fontSize: 11 }}>·</span>
      <span className="mono" style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>at {yardLine}</span>
      <div style={{ flex: 1, height: 4, background: 'var(--bg-sunken)', borderRadius: 999, position: 'relative', border: '1px solid var(--line)' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: `${yardLine}%`,
          background: redZone ? 'var(--live)' : 'var(--ink)', borderRadius: 999, opacity: 0.8,
        }} />
      </div>
      {redZone && (
        <span className="chip" style={{ height: 18, padding: '0 6px', fontSize: 9.5, fontWeight: 700, background: 'var(--live-soft)', color: 'var(--live)', borderColor: 'var(--live-line)' }}>
          RZ
        </span>
      )}
    </div>
  )
}

function HockeyStrip({ shotsOnGoal, penalties, strength, homeTeam, awayTeam, clock }) {
  const sog = shotsOnGoal || {}
  const pp  = penalties?.length > 0 ? penalties[0] : null
  const ispp = strength === 'PP' || pp
  const penalized = pp?.team
  const ppTeam = penalized
    ? (penalized === homeTeam?.abbreviation ? awayTeam?.abbreviation : homeTeam?.abbreviation)
    : null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11 }}>
      {clock && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ color: 'var(--muted)' }}>Clock</span>
          <span className="mono tabular" style={{ fontWeight: 700, color: ispp ? 'var(--live)' : 'var(--ink-soft)', fontSize: 11 }}>{clock}</span>
        </span>
      )}
      <span style={{ color: 'var(--muted)' }}>SOG</span>
      <span className="mono tabular" style={{ color: 'var(--ink)', fontWeight: 600 }}>{sog.away ?? 0}–{sog.home ?? 0}</span>
      {ispp && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span className="chip" style={{ height: 18, padding: '0 6px', fontSize: 9.5, fontWeight: 700, background: 'var(--live-soft)', color: 'var(--live)', borderColor: 'var(--live-line)' }}>
            {ppTeam ? `${ppTeam} PP` : 'PP'}
          </span>
          {pp?.timeRemaining && (
            <span className="mono tabular" style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--live)' }}>{pp.timeRemaining}</span>
          )}
        </span>
      )}
    </div>
  )
}

function BasketballStrip({ clock, bonus }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11 }}>
      {clock && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ color: 'var(--muted)' }}>Clock</span>
          <span className="mono tabular" style={{ fontWeight: 700, color: 'var(--ink-soft)', fontSize: 11 }}>{clock}</span>
        </span>
      )}
      {bonus && (
        <span className="chip" style={{ height: 18, padding: '0 6px', fontSize: 9.5, fontWeight: 700, background: 'var(--amber-soft)', color: 'var(--amber)', borderColor: '#E3CC9B' }}>
          BONUS · {bonus}
        </span>
      )}
    </div>
  )
}

function getNhlLeaders(game) {
  if (!game.boxScore) return null
  function topSkater(skaters) {
    const active = (skaters ?? []).filter(s => s.points > 0)
    if (!active.length) return null
    return [...active].sort((a, b) => b.points - a.points || b.goals - a.goals)[0]
  }
  const home = topSkater(game.boxScore.home?.skaters)
  const away = topSkater(game.boxScore.away?.skaters)
  return (home || away) ? { home, away } : null
}

function getMlbLeaders(game) {
  if (!game.boxScore) return null
  function topBatter(batters) {
    const active = (batters ?? []).filter(b => (b.gameStats?.hits ?? 0) > 0)
    if (!active.length) return null
    return [...active].sort((a, b) => {
      const score = g => (g.gameStats?.hits ?? 0) * 3 + (g.gameStats?.homeRuns ?? 0) * 2 + (g.gameStats?.rbi ?? 0)
      return score(b) - score(a)
    })[0]
  }
  const home = topBatter(game.boxScore.home?.batters)
  const away = topBatter(game.boxScore.away?.batters)
  return (home || away) ? { home, away } : null
}

export default function GameCard({ game, onClick, flashTeam }) {
  const { homeTeam, awayTeam, score, status, league } = game
  const awayColor = TEAM_COLORS[awayTeam?.abbreviation] || awayTeam?.color || 'var(--muted-2)'
  const homeColor = TEAM_COLORS[homeTeam?.abbreviation] || homeTeam?.color || 'var(--muted-2)'
  const isLive     = status === 'live' || status === 'warmup'
  const isDelayed  = status === 'delayed'
  const isFinal    = status === 'final'
  const isScheduled = status === 'scheduled'
  const homeWins   = isFinal && score.home > score.away
  const awayWins   = isFinal && score.away > score.home

  return (
    <button
      onClick={() => onClick(game.gameId)}
      className={`card hoverable${isLive ? ' live' : ''}${isDelayed ? ' delayed' : ''}`}
      style={{ padding: 'var(--pad)', display: 'block', width: '100%', textAlign: 'left' }}
    >
      {/* Status + league row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <StatusTag status={status} period={game.period} startTime={game.startTime} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <LeagueGlyph league={league} />
          <span className="eyebrow" style={{ fontSize: 10 }}>{(league || '').toUpperCase()}</span>
        </div>
      </div>

      {/* Teams */}
      <div>
        <TeamRow
          team={{ ...awayTeam, color: awayColor }}
          score={isScheduled ? null : score.away}
          isWinner={awayWins}
          isLive={isLive}
          dim={isLive && score.away < score.home}
          changed={flashTeam === 'away'}
          possession={isLive && game.possession === 'away'}
        />
        <div className="hairline" style={{ margin: '2px 0' }} />
        <TeamRow
          team={{ ...homeTeam, color: homeColor }}
          score={isScheduled ? null : score.home}
          isWinner={homeWins}
          isLive={isLive}
          dim={isLive && score.home < score.away}
          changed={flashTeam === 'home'}
          possession={isLive && game.possession === 'home'}
        />
      </div>

      {/* Sport-specific live strip */}
      {isLive && league === 'mlb' && game.matchup && (
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <BaseDiamond
            bases={game.matchup.runners || {}}
            outs={game.matchup.count?.outs ?? 0}
            balls={game.matchup.count?.balls ?? 0}
            strikes={game.matchup.count?.strikes ?? 0}
          />
          {game.matchup.batter && (
            <span style={{ fontSize: 11, color: 'var(--muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {game.matchup.batter.name}
            </span>
          )}
        </div>
      )}
      {isLive && league === 'nfl' && game.nflExtras && (
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
          <FootballDrive
            down={game.nflExtras.down}
            distance={game.nflExtras.distance}
            yardLine={game.nflExtras.yardLine}
            possession={game.nflExtras.possession}
            redZone={game.nflExtras.isRedZone}
            clock={game.nflExtras.clock}
          />
        </div>
      )}
      {isLive && league === 'nhl' && game.matchup && (
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
          <HockeyStrip
            shotsOnGoal={game.matchup.shotsOnGoal}
            penalties={game.matchup.penalties}
            strength={game.matchup.strength}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            clock={game.matchup?.period?.timeRemaining ?? game.period?.timeRemaining}
          />
        </div>
      )}
      {isFinal && league === 'nhl' && (() => {
        const leaders = getNhlLeaders(game)
        const hasSog = !!game._shotsOnGoal
        if (!leaders && !hasSog) return null
        return (
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {hasSog && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, marginBottom: leaders ? 2 : 0 }}>
                <span style={{ color: 'var(--muted)', minWidth: 28, fontSize: 10 }}>SOG</span>
                <span className="mono tabular" style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>{game._shotsOnGoal.away}–{game._shotsOnGoal.home}</span>
              </div>
            )}
            {leaders && [['away', leaders.away], ['home', leaders.home]].map(([side, leader]) => {
              if (!leader) return null
              const abbr = side === 'home' ? homeTeam.abbreviation : awayTeam.abbreviation
              return (
                <div key={side} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                  <span style={{ color: 'var(--muted)', minWidth: 28, fontSize: 10 }}>{abbr}</span>
                  <span style={{ color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{leader.name?.split(' ').slice(-1)[0]}</span>
                  <span className="mono tabular" style={{ color: 'var(--ink)', fontWeight: 700 }}>{leader.goals}</span>
                  <span style={{ color: 'var(--faint)', fontSize: 10 }}>G</span>
                  <span className="mono tabular" style={{ color: 'var(--ink-soft)' }}>{leader.assists}A</span>
                </div>
              )
            })}
          </div>
        )
      })()}
      {isLive && league === 'nba' && (
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
          <BasketballStrip
            clock={game.period?.timeRemaining}
            bonus={
              game.matchup?.homeInBonus ? homeTeam.abbreviation
              : game.matchup?.awayInBonus ? awayTeam.abbreviation
              : null
            }
          />
        </div>
      )}
      {isFinal && league === 'nba' && game.gameLeaders && (game.gameLeaders.away || game.gameLeaders.home) && (
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[['away', game.gameLeaders.away], ['home', game.gameLeaders.home]].map(([side, leader]) => {
            if (!leader) return null
            const abbr = side === 'home' ? homeTeam.abbreviation : awayTeam.abbreviation
            return (
              <div key={side} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                <span style={{ color: 'var(--muted)', minWidth: 28, fontSize: 10 }}>{abbr}</span>
                <span style={{ color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {leader.name?.split(' ').slice(-1)[0]}
                </span>
                <span className="mono tabular" style={{ color: 'var(--ink)', fontWeight: 700 }}>{leader.points}</span>
                <span style={{ color: 'var(--faint)', fontSize: 10 }}>pts</span>
                <span className="mono tabular" style={{ color: 'var(--ink-soft)' }}>{leader.rebounds}r</span>
                <span className="mono tabular" style={{ color: 'var(--ink-soft)' }}>{leader.assists}a</span>
              </div>
            )
          })}
        </div>
      )}

      {isFinal && league === 'mlb' && (() => {
        const leaders = getMlbLeaders(game)
        if (!leaders) return null
        return (
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[['away', leaders.away], ['home', leaders.home]].map(([side, leader]) => {
              if (!leader) return null
              const abbr = side === 'home' ? homeTeam.abbreviation : awayTeam.abbreviation
              const gs = leader.gameStats ?? {}
              return (
                <div key={side} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                  <span style={{ color: 'var(--muted)', minWidth: 28, fontSize: 10 }}>{abbr}</span>
                  <span style={{ color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{leader.name?.split(' ').slice(-1)[0]}</span>
                  <span className="mono tabular" style={{ color: 'var(--ink)', fontWeight: 700 }}>{gs.hits ?? 0}-{gs.atBats ?? 0}</span>
                  {(gs.homeRuns ?? 0) > 0 && <span style={{ color: 'var(--faint)', fontSize: 10 }}>HR</span>}
                  {(gs.rbi ?? 0) > 0 && <span className="mono tabular" style={{ color: 'var(--ink-soft)' }}>{gs.rbi}RBI</span>}
                </div>
              )
            })}
          </div>
        )
      })()}

      {/* Scheduled: situation or venue */}
      {!isLive && (game.situation || game.venue) && (
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
          <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', fontWeight: 500 }}>
            {game.situation || game.venue}
          </div>
        </div>
      )}
    </button>
  )
}
