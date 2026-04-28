import BasketballLinescore    from './BasketballLinescore.jsx'
import BasketballBoxScore     from './BasketballBoxScore.jsx'
import BasketballMatchupPanel from './BasketballMatchupPanel.jsx'
import ScoringPlays           from './ScoringPlays.jsx'
import WinProbabilityChart    from '../WinProbabilityChart.jsx'
import { formatStartTime }    from '../../utils/formatters.js'

function StatusBadge({ game }) {
  const { status, period } = game
  const label = period?.label ?? ''

  if (status === 'live') {
    return (
      <div className="chip" style={{ background: 'var(--live-soft)', color: 'var(--live)', borderColor: 'var(--live-line)', gap: 7 }}>
        <span className="pulsedot" style={{ width: 7, height: 7 }} />
        <span style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label || 'Live'}
        </span>
        {period?.timeRemaining && (
          <span className="mono" style={{ fontSize: 10, opacity: 0.7 }}>{period.timeRemaining}</span>
        )}
        {period?.inHalftime && (
          <span style={{ fontSize: 10, opacity: 0.7 }}>· Halftime</span>
        )}
      </div>
    )
  }
  if (status === 'final') {
    return (
      <span className="chip">
        <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label || 'Final'}</span>
      </span>
    )
  }
  return (
    <span className="chip">
      <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{formatStartTime(game.startTime)}</span>
    </span>
  )
}

function ScoreBlock({ team, score, isWinner }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: isWinner ? 'var(--ink)' : 'var(--muted)' }}>
        {team.abbreviation}
      </span>
      <span className="tabular" style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1, color: isWinner ? 'var(--ink)' : 'var(--muted)' }}>
        {score}
      </span>
      {team.record && (
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--faint)' }}>{team.record}</span>
      )}
    </div>
  )
}

function GameLeadersCard({ leaders, homeTeam, awayTeam }) {
  const rows = leaders
    ? [
        { side: 'away', team: awayTeam, leader: leaders.away },
        { side: 'home', team: homeTeam, leader: leaders.home },
      ].filter(r => r.leader)
    : []

  return (
    <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 14, flexShrink: 0 }}><span className="eyebrow">Game leaders</span></div>
      {rows.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, justifyContent: 'space-evenly' }}>
          {rows.map(({ side, team, leader }) => (
            <div key={side} style={{ padding: '14px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg-sunken)', flex: 1 }}>
              <div className="eyebrow" style={{ marginBottom: 4 }}>{team?.abbreviation} Leader</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{leader.name}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                {leader.points} PTS · {leader.rebounds} REB · {leader.assists} AST
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: 13, color: 'var(--faint)', textAlign: 'center', padding: '16px 0', flex: 1 }}>
          Leaders not yet available
        </p>
      )}
    </div>
  )
}

export default function BasketballGameDetail({ game, isEmbedded = false }) {
  const { homeTeam, awayTeam, score, lastPlay, status } = game
  const isFinal         = status === 'final'
  const isScheduled     = status === 'scheduled'
  const isLive          = status === 'live'
  const homeWins        = isFinal && score.home > score.away
  const awayWins        = isFinal && score.away > score.home
  const hasLinescore    = game.linescore?.length > 0
  const hasScoringPlays = game.scoringPlays?.length > 0
  const hasWinProb      = !!(game.winProbabilityTimeline?.length || game.winProbability)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Standalone hero — skip when embedded, parent already shows MatchupHero */}
      {!isEmbedded && (
        <div className={`card${isLive ? ' live' : ''}`} style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <span className="eyebrow">NBA · Regular Season</span>
            <StatusBadge game={game} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 16 }}>
            <ScoreBlock team={awayTeam} score={isScheduled ? '–' : score.away} isWinner={awayWins} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: 20, color: 'var(--faint)', fontWeight: 300 }}>vs</span>
            </div>
            <ScoreBlock team={homeTeam} score={isScheduled ? '–' : score.home} isWinner={homeWins} />
          </div>

          {lastPlay && (
            <div style={{ marginTop: 16, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg-sunken)' }}>
              <p style={{ padding: '10px 16px', textAlign: 'center', fontSize: 12.5, color: 'var(--ink-soft)', fontStyle: 'italic' }}>
                {lastPlay}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Live matchup panel — skip when embedded, parent LiveSituationPanel handles it */}
      {!isEmbedded && isLive && game.matchup && (
        <BasketballMatchupPanel matchup={game.matchup} homeTeam={homeTeam} awayTeam={awayTeam} />
      )}

      {/* Linescore — full width, always show */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--line)' }}>
          <span className="eyebrow">Linescore</span>
        </div>
        {hasLinescore || isLive || isFinal ? (
          <BasketballLinescore game={game} />
        ) : (
          <div style={{ padding: '24px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--faint)' }}>Game hasn't started yet</p>
          </div>
        )}
      </div>

      {/* Win Probability + Game Leaders (2-col, equal height) */}
      {hasWinProb ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16, alignItems: 'stretch' }}>
          <WinProbabilityChart game={game} homeTeam={homeTeam} awayTeam={awayTeam} />
          <GameLeadersCard leaders={game.gameLeaders} homeTeam={homeTeam} awayTeam={awayTeam} />
        </div>
      ) : (
        <GameLeadersCard leaders={game.gameLeaders} homeTeam={homeTeam} awayTeam={awayTeam} />
      )}

      {/* Scoring Plays + Box Score (2-col, equal height) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16, alignItems: 'stretch' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 0, minHeight: '100%' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
            <span className="eyebrow">Scoring plays</span>
          </div>
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {hasScoringPlays || isLive || isFinal ? (
              <ScoringPlays plays={game.scoringPlays} homeTeam={homeTeam} awayTeam={awayTeam} />
            ) : (
              <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: 'var(--faint)' }}>No scoring plays yet</p>
              </div>
            )}
          </div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ marginBottom: 16 }}><span className="eyebrow">Box score</span></div>
          {game.boxScore ? (
            <BasketballBoxScore boxScore={game.boxScore} homeTeam={homeTeam} awayTeam={awayTeam} />
          ) : (
            <p style={{ fontSize: 13, color: 'var(--faint)', textAlign: 'center', padding: '16px 0' }}>
              Box score not yet available
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
