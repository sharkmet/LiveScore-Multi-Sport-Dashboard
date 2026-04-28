const TYPE_COLORS = {
  PP: 'var(--amber)',
  SH: 'var(--live)',
  EN: 'var(--faint)',
  EV: 'var(--ink-soft)',
}

function GoalTypeBadge({ type }) {
  const color = TYPE_COLORS[type] ?? 'var(--faint)'
  return (
    <span className="mono" style={{ fontSize: 10, fontWeight: 700, color, flexShrink: 0 }}>
      {type ?? 'EV'}
    </span>
  )
}

export default function HockeyScoringPlays({ goals, homeTeam, awayTeam }) {
  if (!goals?.length) {
    return (
      <p style={{ fontSize: 13, color: 'var(--faint)', textAlign: 'center', padding: '16px 0' }}>
        No goals yet
      </p>
    )
  }

  const homeAbbrev = homeTeam?.abbreviation ?? ''
  const awayAbbrev = awayTeam?.abbreviation ?? ''

  // Compute running score as we iterate
  let homeScore = 0, awayScore = 0
  const playsWithScore = goals.map((goal) => {
    if (goal.team === homeAbbrev) homeScore++
    else awayScore++
    return { ...goal, runningHome: homeScore, runningAway: awayScore }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '8px 12px' }}>
      {playsWithScore.map((goal, i) => {
        const isHome = goal.team === homeAbbrev
        const teamColor = isHome
          ? (homeTeam?.color ?? '#3b82f6')
          : (awayTeam?.color ?? '#6E6A62')
        const assistsStr = goal.assists?.length
          ? `A: ${goal.assists.join(', ')}`
          : null

        return (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg-sunken)',
              padding: '8px 12px',
            }}
          >
            {/* Period + time */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40, flexShrink: 0 }}>
              <span className="eyebrow" style={{ fontSize: 9 }}>{goal.period}</span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>{goal.time}</span>
            </div>

            {/* Team chip */}
            <span
              style={{
                width: 32, flexShrink: 0,
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                color: teamColor,
              }}
            >
              {goal.team}
            </span>

            {/* Scorer + assists */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {goal.scorer}
              </div>
              {assistsStr && (
                <div style={{ fontSize: 10, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {assistsStr}
                </div>
              )}
            </div>

            <GoalTypeBadge type={goal.type} />

            {/* Running score */}
            <span className="mono tabular" style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.02em' }}>
              {goal.runningAway}–{goal.runningHome}
            </span>
          </div>
        )
      })}
    </div>
  )
}
