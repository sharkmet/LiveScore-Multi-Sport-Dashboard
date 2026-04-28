import HockeyLinescore    from './HockeyLinescore.jsx'
import HockeyPlayByPlay   from './HockeyPlayByPlay.jsx'
import HockeyBoxScore     from './HockeyBoxScore.jsx'
import HockeyMatchupPanel from './HockeyMatchupPanel.jsx'
import WinProbabilityChart from '../WinProbabilityChart.jsx'
import { formatStartTime } from '../../utils/formatters.js'

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
        {game.matchup?.period?.timeRemaining && (
          <span className="mono" style={{ fontSize: 10, color: 'var(--live)', opacity: 0.7 }}>
            {game.matchup.period.timeRemaining}
          </span>
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

function StatBar({ label, awayVal, homeVal, awayColor, homeColor, awayDisplay, homeDisplay }) {
  const a = typeof awayVal === 'number' ? awayVal : 0
  const h = typeof homeVal === 'number' ? homeVal : 0
  const total = (a + h) || 1
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 44px 52px', alignItems: 'center', gap: 10 }}>
      <span className="tabular mono" style={{ fontSize: 11.5, fontWeight: 700, textAlign: 'right', color: 'var(--ink)' }}>
        {awayDisplay ?? (awayVal ?? '—')}
      </span>
      <div style={{ height: 6, borderRadius: 999, overflow: 'hidden', background: 'var(--bg-sunken)', border: '1px solid var(--line)', display: 'flex' }}>
        <div style={{ width: `${(a / total) * 100}%`, background: awayColor }} />
        <div style={{ flex: 1, background: homeColor, opacity: 0.75 }} />
      </div>
      <span className="tabular mono" style={{ fontSize: 11.5, fontWeight: 700, textAlign: 'left', color: 'var(--ink)' }}>
        {homeDisplay ?? (homeVal ?? '—')}
      </span>
      <span className="eyebrow" style={{ textAlign: 'center', fontSize: 9 }}>{label}</span>
    </div>
  )
}

function ppDisplay(goals, opp) {
  if (opp == null) return null
  return `${goals ?? 0}/${opp}`
}

export default function HockeyGameDetail({ game, isEmbedded = false }) {
  const { homeTeam, awayTeam, score, lastPlay, status } = game
  const isFinal     = status === 'final'
  const isScheduled = status === 'scheduled'
  const isLive      = status === 'live'
  const homeWins    = isFinal && score.home > score.away
  const awayWins    = isFinal && score.away > score.home
  const hasTimeline = game.timeline?.length > 0

  const shotsAway = game._shotsOnGoal?.away ?? game.matchup?.shotsOnGoal?.away ?? game.boxScore?.away?.totals?.shotsOnGoal ?? null
  const shotsHome = game._shotsOnGoal?.home ?? game.matchup?.shotsOnGoal?.home ?? game.boxScore?.home?.totals?.shotsOnGoal ?? null

  const awayTotals = game.boxScore?.away?.totals ?? {}
  const homeTotals = game.boxScore?.home?.totals ?? {}

  const awayColor = awayTeam.color || '#6E6A62'
  const homeColor = homeTeam.color || '#9A958A'
  const hasWinProb = !!(game.winProbabilityTimeline?.length || game.winProbability)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Standalone hero — skip when embedded, parent already shows MatchupHero */}
      {!isEmbedded && (
        <div className={`card${isLive ? ' live' : ''}`} style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <span className="eyebrow">NHL · Regular Season</span>
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
            <div style={{ marginTop: 20, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg-sunken)' }}>
              <p style={{ padding: '10px 16px', textAlign: 'center', fontSize: 12.5, color: 'var(--ink-soft)', fontStyle: 'italic' }}>
                {lastPlay}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Live matchup panel — skip when embedded, parent LiveSituationPanel handles it */}
      {!isEmbedded && isLive && game.matchup && (
        <HockeyMatchupPanel matchup={game.matchup} homeTeam={homeTeam} awayTeam={awayTeam} />
      )}

      {/* Linescore — always render; HockeyLinescore handles empty timeline gracefully */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--line)' }}>
          <span className="eyebrow">Linescore</span>
        </div>
        {isScheduled ? (
          <div style={{ padding: '24px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--faint)' }}>Game hasn't started yet</p>
          </div>
        ) : (
          <HockeyLinescore game={game} />
        )}
      </div>

      {/* Win Probability + Team comparison (2-col, equal height) */}
      {(hasWinProb || shotsAway !== null || shotsHome !== null) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16, alignItems: 'stretch' }}>
          {hasWinProb
            ? <WinProbabilityChart game={game} homeTeam={homeTeam} awayTeam={awayTeam} />
            : <div />
          }
          <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexShrink: 0 }}>
              <span className="eyebrow">Team Stats</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span className="dot" style={{ background: awayColor }} />{awayTeam.abbreviation}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span className="dot" style={{ background: homeColor }} />{homeTeam.abbreviation}
                </span>
              </div>
            </div>
            {/* Always render all stat rows — 0 fallback so the card fills even before boxScore loads */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', flex: 1, gap: 10 }}>
              <StatBar label="Shots" awayVal={shotsAway ?? 0} homeVal={shotsHome ?? 0} awayColor={awayColor} homeColor={homeColor} />
              <StatBar
                label="PP"
                awayVal={awayTotals.powerPlayGoals ?? 0}
                homeVal={homeTotals.powerPlayGoals ?? 0}
                awayDisplay={ppDisplay(awayTotals.powerPlayGoals ?? 0, awayTotals.powerPlayOpportunities ?? 0)}
                homeDisplay={ppDisplay(homeTotals.powerPlayGoals ?? 0, homeTotals.powerPlayOpportunities ?? 0)}
                awayColor={awayColor} homeColor={homeColor}
              />
              <StatBar label="PIM" awayVal={awayTotals.pim ?? 0} homeVal={homeTotals.pim ?? 0} awayColor={awayColor} homeColor={homeColor} />
              <StatBar label="Hits" awayVal={awayTotals.hits ?? 0} homeVal={homeTotals.hits ?? 0} awayColor={awayColor} homeColor={homeColor} />
              <StatBar label="Blk" awayVal={awayTotals.blockedShots ?? 0} homeVal={homeTotals.blockedShots ?? 0} awayColor={awayColor} homeColor={homeColor} />
              <StatBar
                label="FO%"
                awayVal={awayTotals.faceoffWinPct ?? 50}
                homeVal={homeTotals.faceoffWinPct ?? 50}
                awayDisplay={awayTotals.faceoffWinPct != null ? `${Math.round(awayTotals.faceoffWinPct)}%` : '—'}
                homeDisplay={homeTotals.faceoffWinPct != null ? `${Math.round(homeTotals.faceoffWinPct)}%` : '—'}
                awayColor={awayColor} homeColor={homeColor}
              />
            </div>
          </div>
        </div>
      )}

      {/* Play-by-play + Box Score (2-col, equal height) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16, alignItems: 'stretch' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 0, minHeight: '100%' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
            <span className="eyebrow">Play by play</span>
          </div>
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <HockeyPlayByPlay
              recentPlays={game.recentPlays}
              goals={game.goals}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
            />
          </div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ marginBottom: 16 }}><span className="eyebrow">Box Score</span></div>
          {game.boxScore ? (
            <HockeyBoxScore boxScore={game.boxScore} homeTeam={homeTeam} awayTeam={awayTeam} />
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
