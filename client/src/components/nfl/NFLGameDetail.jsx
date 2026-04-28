import NFLDriveTimeline from './NFLDriveTimeline.jsx'
import LinescoreTable from '../LinescoreTable.jsx'
import WinProbabilityChart from '../WinProbabilityChart.jsx'
import { formatStartTime } from '../../utils/formatters.js'

function StatusBadge({ game }) {
  const { status, period } = game
  const label = period?.label ?? ''
  const clock = game.nflExtras?.clock

  if (status === 'live') {
    return (
      <div className="chip" style={{ background: 'var(--live-soft)', color: 'var(--live)', borderColor: 'var(--live-line)', gap: 7 }}>
        <span className="pulsedot" style={{ width: 7, height: 7 }} />
        <span style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label || 'Live'}
        </span>
        {clock && (
          <span className="mono" style={{ fontSize: 10, opacity: 0.7 }}>{clock}</span>
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
        {team?.abbreviation}
      </span>
      <span className="tabular" style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1, color: isWinner ? 'var(--ink)' : 'var(--muted)' }}>
        {score}
      </span>
      {team?.record && (
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--faint)' }}>{team.record}</span>
      )}
    </div>
  )
}

function TimeoutDots({ count = 3, side = 'left' }) {
  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: side === 'right' ? 'flex-end' : 'flex-start' }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            display: 'inline-block', width: 8, height: 8, borderRadius: 999,
            background: i < count ? 'var(--amber)' : 'transparent',
            border: i < count ? 'none' : '1px solid var(--line-2)',
          }}
        />
      ))}
    </div>
  )
}

function SituationBar({ game }) {
  const { nflExtras, homeTeam, awayTeam, status, period } = game
  if (status !== 'live' || !nflExtras) return null

  const { clock, possession, down, distance, yardLineText, isRedZone, timeoutsHome, timeoutsAway } = nflExtras
  const hasSituation = down && distance

  const redZoneStyle = isRedZone ? {
    borderColor: 'rgba(200,55,45,0.4)',
    background: 'rgba(200,55,45,0.06)',
    boxShadow: '0 0 12px rgba(200,55,45,0.12)',
  } : {
    borderColor: 'var(--line)',
    background: 'var(--bg-sunken)',
  }

  return (
    <div className="card" style={{ padding: '12px 16px', ...redZoneStyle }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--live)' }}>
          {period?.label ?? ''}{clock ? ` · ${clock}` : ''}
        </span>
        {isRedZone && (
          <span className="chip" style={{ background: 'rgba(200,55,45,0.12)', color: 'var(--live)', borderColor: 'var(--live-line)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Red Zone
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="eyebrow">{awayTeam?.abbreviation}</span>
          <TimeoutDots count={timeoutsAway ?? 3} side="left" />
        </div>

        <div style={{ flex: 1, textAlign: 'center' }}>
          {hasSituation ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                {down === 1 ? '1st' : down === 2 ? '2nd' : down === 3 ? '3rd' : '4th'} & {distance}
              </p>
              {yardLineText && (
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>{yardLineText}</p>
              )}
              {possession && (
                <p style={{ fontSize: 10, color: 'var(--faint)', margin: 0 }}>
                  {possession === 'home' ? homeTeam?.abbreviation : awayTeam?.abbreviation} ball
                </p>
              )}
            </div>
          ) : (
            <p style={{ fontSize: 12, color: 'var(--faint)', margin: 0 }}>Between plays</p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span className="eyebrow">{homeTeam?.abbreviation}</span>
          <TimeoutDots count={timeoutsHome ?? 3} side="right" />
        </div>
      </div>
    </div>
  )
}

export default function NFLGameDetail({ game, isEmbedded = false }) {
  const { homeTeam, awayTeam, score, lastPlay, status, nflExtras } = game
  const isFinal     = status === 'final'
  const isScheduled = status === 'scheduled'
  const isLive      = status === 'live'
  const homeWins    = isFinal && score.home > score.away
  const awayWins    = isFinal && score.away > score.home
  const hasTimeline = game.timeline?.length > 0
  const drives      = nflExtras?.driveTimeline ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Hero card */}
      <div className={`card${isLive ? ' live' : ''}`} style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span className="eyebrow">NFL · Regular Season</span>
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
            <p style={{ padding: '10px 16px', textAlign: 'center', fontSize: 12.5, color: 'var(--ink-soft)', fontStyle: 'italic', margin: 0 }}>
              {lastPlay}
            </p>
          </div>
        )}
      </div>

      {isLive && <SituationBar game={game} />}

      <WinProbabilityChart game={game} homeTeam={homeTeam} awayTeam={awayTeam} />

      {(isLive || isFinal) && (
        <div className="card" style={{ padding: 16 }}>
          <div style={{ marginBottom: 12 }}><span className="eyebrow">Drive Log</span></div>
          <NFLDriveTimeline drives={drives} homeTeam={homeTeam} awayTeam={awayTeam} />
        </div>
      )}

      {hasTimeline ? (
        <div className="card" style={{ padding: 16 }}>
          <div style={{ marginBottom: 12 }}><span className="eyebrow">Scoring by Quarter</span></div>
          <LinescoreTable game={game} />
        </div>
      ) : isScheduled ? (
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Game hasn't started yet</p>
        </div>
      ) : null}
    </div>
  )
}
