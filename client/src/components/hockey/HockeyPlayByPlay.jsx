const TYPE_ICON = {
  'goal':         '🚨',
  'penalty':      '⚠',
  'shot-on-goal': '·',
  'blocked-shot': '·',
  'hit':          '·',
  'period-end':   '—',
}

const TYPE_LABEL = {
  'shot-on-goal': 'Shot',
  'blocked-shot': 'Block',
  'hit':          'Hit',
  'penalty':      'Penalty',
  'goal':         'Goal',
  'period-end':   '',
}

function PlayRow({ play, homeTeam, awayTeam }) {
  const isGoal      = play.isGoal
  const isPenalty   = play.isPenalty
  const isPeriodEnd = play.isPeriodEnd

  const teamColor = play.isHome === true
    ? (homeTeam?.color ?? '#3b82f6')
    : play.isHome === false
    ? (awayTeam?.color ?? '#6E6A62')
    : null

  if (isPeriodEnd) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '5px 12px',
        borderTop: '1px solid var(--line)',
      }}>
        <span style={{ fontSize: 10, color: 'var(--faint)', fontStyle: 'italic' }}>
          End of {play.period}
        </span>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 12px',
      borderRadius: isGoal ? 8 : 0,
      margin: isGoal ? '4px 8px' : 0,
      background: isGoal
        ? 'linear-gradient(135deg, rgba(255,210,50,0.12), rgba(255,210,50,0.04))'
        : 'transparent',
      border: isGoal ? '1px solid rgba(255,210,50,0.3)' : 'none',
    }}>
      {/* Period + clock */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 36, flexShrink: 0 }}>
        <span className="eyebrow" style={{ fontSize: 8.5, color: 'var(--muted-2)' }}>{play.period}</span>
        <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>{play.time}</span>
      </div>

      {/* Icon */}
      <span style={{
        fontSize: isGoal ? 14 : 10,
        width: 18, textAlign: 'center', flexShrink: 0,
        color: isPenalty ? 'var(--amber)' : isGoal ? '#D4AC0D' : 'var(--faint)',
      }}>
        {TYPE_ICON[play.type] ?? '·'}
      </span>

      {/* Team chip */}
      {play.teamAbbrev && (
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
          color: teamColor ?? 'var(--muted)', flexShrink: 0, width: 28,
        }}>
          {play.teamAbbrev}
        </span>
      )}

      {/* Player + description */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {play.playerName && (
          <div style={{
            fontSize: isGoal ? 12.5 : 11.5,
            fontWeight: isGoal ? 700 : 500,
            color: isGoal ? 'var(--ink)' : 'var(--ink-soft)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {play.playerName}
          </div>
        )}
        <div style={{
          fontSize: 10.5, color: isGoal ? 'var(--muted)' : 'var(--faint)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {play.description}
        </div>
      </div>

      {/* Type label */}
      <span style={{
        fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0,
        color: isGoal ? '#D4AC0D' : isPenalty ? 'var(--amber)' : 'var(--faint)',
      }}>
        {TYPE_LABEL[play.type] ?? play.type}
      </span>
    </div>
  )
}

export default function HockeyPlayByPlay({ recentPlays, goals, homeTeam, awayTeam }) {
  const plays = recentPlays?.length > 0
    ? recentPlays
    : (goals ?? []).map(g => ({
        eventId: `goal-${g.time}`,
        type: 'goal',
        isGoal: true,
        isPenalty: false,
        isPeriodEnd: false,
        period: g.period,
        time: g.time,
        isHome: g.team === homeTeam?.abbreviation ? true : g.team === awayTeam?.abbreviation ? false : null,
        teamAbbrev: g.team,
        playerName: g.scorer,
        description: g.assists?.length ? `A: ${g.assists.join(', ')}` : 'Unassisted',
      }))

  if (!plays.length) {
    return (
      <p style={{ fontSize: 13, color: 'var(--faint)', textAlign: 'center', padding: '20px 0' }}>
        No plays yet
      </p>
    )
  }

  const pinned = plays.slice(0, 3)
  const older  = plays.slice(3)

  return (
    <div style={{ overflowY: 'auto', flex: 1 }}>
      {/* Top 3 pinned — sticky to the top of the scroll container */}
      <div style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--bg-elev)' }}>
        {pinned.map((play, i) => (
          <PlayRow key={play.eventId ?? i} play={play} homeTeam={homeTeam} awayTeam={awayTeam} />
        ))}
      </div>

      {/* Older plays — scroll to reach */}
      {older.map((play, i) => (
        <PlayRow key={play.eventId ?? (i + 3)} play={play} homeTeam={homeTeam} awayTeam={awayTeam} />
      ))}
    </div>
  )
}
