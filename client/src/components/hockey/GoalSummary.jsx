const TYPE_STYLES = {
  EV: { background: 'var(--bg-sunken)', color: 'var(--muted)', border: '1px solid var(--line)' },
  PP: { background: 'rgba(200,160,40,0.1)', color: 'var(--amber)', border: '1px solid rgba(200,160,40,0.3)' },
  SH: { background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' },
  EN: { background: 'rgba(200,55,45,0.1)', color: 'var(--live)', border: '1px solid var(--live-line)' },
}

function GoalTypeChip({ type }) {
  const s = TYPE_STYLES[type] ?? TYPE_STYLES.EV
  return (
    <span style={{
      display: 'inline-block', borderRadius: 4, padding: '2px 6px',
      fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
      ...s,
    }}>
      {type}
    </span>
  )
}

export default function GoalSummary({ goals, homeTeam, awayTeam }) {
  if (!goals?.length) {
    return (
      <p style={{ padding: '16px 0', textAlign: 'center', fontSize: 13, color: 'var(--faint)' }}>
        No goals yet
      </p>
    )
  }

  const byPeriod = goals.reduce((acc, g) => {
    if (!acc[g.period]) acc[g.period] = []
    acc[g.period].push(g)
    return acc
  }, {})

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {Object.entries(byPeriod).map(([period, periodGoals]) => (
        <div key={period}>
          <p className="eyebrow" style={{ marginBottom: 8 }}>{period} Period</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {periodGoals.map((g, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg-sunken)',
                  padding: '10px 12px',
                }}
              >
                <span className="mono" style={{ width: 40, flexShrink: 0, fontSize: 11, color: 'var(--muted)' }}>{g.time}</span>
                <span style={{ width: 32, flexShrink: 0, textAlign: 'center', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink)' }}>
                  {g.team}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>{g.scorer}</p>
                  {g.assists?.length > 0 ? (
                    <p style={{ fontSize: 11, color: 'var(--muted)', margin: '2px 0 0' }}>{g.assists.join(', ')}</p>
                  ) : (
                    <p style={{ fontSize: 11, color: 'var(--faint)', margin: '2px 0 0' }}>Unassisted</p>
                  )}
                </div>
                <GoalTypeChip type={g.type} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
