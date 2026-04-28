import { useLeagueData } from '../hooks/useLeagueData'
import { useGameData } from '../hooks/useGameData'

const LEAGUE_META = {
  mlb: { icon: '⚾', label: 'MLB', season: '2026 Postseason' },
  nhl: { icon: '🏒', label: 'NHL', season: '2025–26 Stanley Cup Playoffs' },
  nba: { icon: '🏀', label: 'NBA', season: '2025–26 NBA Playoffs' },
  nfl: { icon: '🏈', label: 'NFL', season: '2024–25 NFL Playoffs' },
}

function getSeeds(series) {
  return {
    topSeed:    series.topSeed    ?? series.highSeed,
    bottomSeed: series.bottomSeed ?? series.lowSeed,
    topWins:    series.topSeedWins    ?? series.highSeedWins ?? 0,
    bottomWins: series.bottomSeedWins ?? series.lowSeedWins  ?? 0,
  }
}

function seriesStatus(series) {
  const { topSeed, bottomSeed, topWins, bottomWins } = getSeeds(series)
  const { status, winnerTeamId } = series
  if (status === 'upcoming') return { label: 'Upcoming', color: 'var(--faint)' }
  if (status === 'complete') {
    const winner = winnerTeamId === topSeed?.id ? topSeed : bottomSeed
    return { label: `${winner?.abbreviation ?? 'TBD'} wins`, color: 'var(--win)' }
  }
  if (topWins === bottomWins) {
    return { label: `Tied ${topWins}-${bottomWins}`, color: 'var(--muted)' }
  }
  const leader = topWins > bottomWins ? topSeed : bottomSeed
  const leadW  = Math.max(topWins, bottomWins)
  const loseW  = Math.min(topWins, bottomWins)
  return { label: `${leader?.abbreviation ?? '?'} leads ${leadW}-${loseW}`, color: 'var(--live)' }
}

function WinPips({ wins, needed, isWinner }) {
  return (
    <div style={{ display: 'flex', gap: 5 }}>
      {Array.from({ length: needed }, (_, i) => (
        <span
          key={i}
          style={{
            width: 10, height: 10, borderRadius: 999,
            background: i < wins ? (isWinner ? 'var(--win)' : 'var(--ink)') : 'transparent',
            border: `1.5px solid ${i < wins ? (isWinner ? 'var(--win)' : 'var(--ink)') : 'var(--line-2)'}`,
          }}
        />
      ))}
    </div>
  )
}

function SeriesTeamRow({ team, wins, needed, isWinner, isEliminated }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px',
      background: isWinner ? 'var(--win-soft)' : 'transparent',
    }}>
      {team?.seed != null && (
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--faint)', width: 14, flexShrink: 0 }}>{team.seed}</span>
      )}
      <span style={{
        fontWeight: 700, fontSize: 16, flex: 1,
        color: isWinner ? 'var(--win)' : isEliminated ? 'var(--faint)' : team ? 'var(--ink)' : 'var(--faint)',
      }}>
        {team?.abbreviation ?? 'TBD'}
      </span>
      <WinPips wins={wins} needed={needed || 4} isWinner={isWinner} />
      <span style={{
        fontSize: 22, fontWeight: 700, width: 28, textAlign: 'right',
        color: isWinner ? 'var(--win)' : 'var(--ink-soft)',
      }} className="tabular">
        {wins}
      </span>
    </div>
  )
}

function SeriesCard({ series }) {
  const { topSeed, bottomSeed, topWins, bottomWins } = getSeeds(series)
  const { status, winnerTeamId } = series
  const statusInfo     = seriesStatus(series)
  const isComplete     = status === 'complete'
  const isLive         = status === 'live' || status === 'in_progress' || status === 'active'
  const needed         = series.neededToWin ?? series.bestOf ?? 4
  const topIsWinner    = isComplete && winnerTeamId === topSeed?.id
  const bottomIsWinner = isComplete && winnerTeamId === bottomSeed?.id

  return (
    <div className="card" style={{
      overflow: 'hidden', padding: 0,
      opacity: isComplete ? 0.8 : 1,
      borderColor: 'var(--line)',
    }}>
      {/* Series header status */}
      <div style={{ padding: '7px 14px', borderBottom: '1px solid var(--line)', background: 'var(--bg-sunken)', display: 'flex', alignItems: 'center', gap: 6 }}>
        {isComplete ? (
          <span className="eyebrow">Final</span>
        ) : isLive ? (
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>In Progress</span>
        ) : (
          <span className="eyebrow">Upcoming</span>
        )}
        {series.conference && (
          <span className="eyebrow" style={{ marginLeft: 'auto' }}>{series.conference}</span>
        )}
      </div>
      <SeriesTeamRow
        team={topSeed} wins={topWins} needed={needed}
        isWinner={topIsWinner} isEliminated={isComplete && !topIsWinner}
      />
      <div className="hairline" />
      <SeriesTeamRow
        team={bottomSeed} wins={bottomWins} needed={needed}
        isWinner={bottomIsWinner} isEliminated={isComplete && !bottomIsWinner}
      />
      <div style={{ padding: '8px 16px', borderTop: '1px solid var(--line)', background: 'var(--bg-sunken)' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: statusInfo.color, margin: 0 }}>{statusInfo.label}</p>
      </div>
    </div>
  )
}

function RoundColumn({ round }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)', flex: 1, minWidth: 270 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="eyebrow">{round.name || round.roundName}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)', flex: 1, justifyContent: 'space-around' }}>
        {round.series.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', background: 'var(--bg-elev)', border: '1px dashed var(--line-2)', borderRadius: 'var(--radius)' }}>
            <p style={{ fontSize: 12, color: 'var(--faint)', margin: 0 }}>Teams TBD</p>
          </div>
        ) : (
          round.series.map(s => (
            <SeriesCard key={s.id || s.seriesId} series={s} />
          ))
        )}
      </div>
    </div>
  )
}

function NotStarted({ league }) {
  const msg = league === 'mlb'
    ? 'MLB playoffs begin in October. Check back during the postseason.'
    : league === 'nhl'
    ? 'NHL playoff bracket has not been announced yet.'
    : league === 'nfl'
    ? 'NFL playoffs begin in January. Check back during the postseason.'
    : 'NBA playoff bracket has not been announced yet.'
  return (
    <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
      <p style={{ color: 'var(--muted)', fontSize: 14 }}>{msg}</p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', gap: 16, overflowX: 'auto' }}>
      {[4, 2, 1].map((count, roundIdx) => (
        <div key={roundIdx} style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="skeleton" style={{ height: 11, width: 100 }} />
          {Array.from({ length: count }, (_, i) => (
            <div key={i} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {[0, 1].map(j => (
                <div key={j} style={{ padding: '10px 12px', borderBottom: j === 0 ? '1px solid var(--line)' : 'none', display: 'flex', justifyContent: 'space-between' }}>
                  <div className="skeleton" style={{ height: 11, width: 50 }} />
                  <div className="skeleton" style={{ height: 11, width: 20 }} />
                </div>
              ))}
              <div style={{ padding: '6px 12px', background: 'var(--bg-sunken)', borderTop: '1px solid var(--line)' }}>
                <div className="skeleton" style={{ height: 9, width: 70 }} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default function PlayoffsView({ league }) {
  const meta = LEAGUE_META[league]

  const { playoffs, isLoading: wsLoading } = useGameData()
  const wsBracket = playoffs?.[league] ?? null

  const { data: restData, isLoading: restLoading, error } = useLeagueData('playoffs', league)

  const data      = wsBracket ?? restData
  const isLoading = wsBracket ? false : (wsLoading || restLoading)
  const hasData   = !isLoading && !error && data?.rounds?.length > 0

  if (!meta) return null

  return (
    <div className="fadein">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span style={{ fontSize: 28 }}>{meta.icon}</span>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink)', margin: 0 }}>
            {meta.label} Playoffs
          </h2>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>{meta.season}</p>
        </div>
        {hasData && (
          <div className="chip" style={{ background: 'var(--win-soft)', color: 'var(--win)', borderColor: '#A5C9B4' }}>
            <span className="dot" style={{ background: 'var(--win)' }} />
            Live bracket
          </div>
        )}
      </div>

      {/* Error */}
      {error && !wsBracket && (
        <div className="card" style={{ padding: '12px 16px', borderColor: 'var(--live-line)', background: 'var(--live-soft)', marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--live)' }}>Failed to load playoffs: {error}</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && <LoadingSkeleton />}

      {/* Not started */}
      {!isLoading && !hasData && <NotStarted league={league} />}

      {/* Bracket — horizontal layout */}
      {hasData && (
        <div style={{ display: 'flex', gap: 'var(--gap)', alignItems: 'stretch', overflowX: 'auto', paddingBottom: 8 }}>
          {data.rounds.map(round => (
            <RoundColumn key={round.id || round.roundNumber} round={round} />
          ))}
        </div>
      )}
    </div>
  )
}
