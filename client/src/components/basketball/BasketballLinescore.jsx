function TeamDot({ color }) {
  return (
    <span style={{
      display: 'inline-block', width: 8, height: 8, borderRadius: 999, flexShrink: 0,
      background: color || 'var(--muted-2)', border: '1px solid var(--line)',
    }} />
  )
}

export default function BasketballLinescore({ game }) {
  const { linescore = [], homeTeam, awayTeam, score, status, period } = game

  const isCurrentPeriod = (q) =>
    status === 'live' && q === period?.current

  const activeCellStyle = { background: 'var(--live-soft)' }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', minWidth: 380, borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            <th className="eyebrow" style={{
              padding: '8px 14px', textAlign: 'left',
              borderBottom: '1px solid var(--line)',
            }}>
              Team
            </th>
            {linescore.map((q) => (
              <th
                key={q.period}
                className="eyebrow mono"
                style={{
                  padding: '8px 8px', textAlign: 'center', minWidth: 40, fontSize: 10,
                  color: isCurrentPeriod(q.period) ? 'var(--live)' : 'var(--muted-2)',
                  borderBottom: '1px solid var(--line)',
                  ...(isCurrentPeriod(q.period) ? activeCellStyle : {}),
                }}
              >
                {q.periodLabel}
              </th>
            ))}
            <th className="eyebrow" style={{
              padding: '8px 12px', textAlign: 'center',
              borderBottom: '1px solid var(--line)', borderLeft: '1px solid var(--line)',
            }}>T</th>
          </tr>
        </thead>
        <tbody>
          {[
            { team: awayTeam, scoreKey: 'awayScore', total: score.away },
            { team: homeTeam, scoreKey: 'homeScore', total: score.home },
          ].map(({ team, scoreKey, total }, rowIdx) => (
            <tr
              key={team.id || team.abbreviation}
              className="row-hover"
              style={{ borderBottom: rowIdx === 0 ? '1px solid var(--line)' : 'none' }}
            >
              <td style={{ padding: '10px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TeamDot color={team.color} />
                  <span style={{ fontWeight: 600 }}>{team.abbreviation}</span>
                  <span style={{ color: 'var(--muted)', fontSize: 12 }}>{team.name}</span>
                </div>
              </td>
              {linescore.map((q) => (
                <td
                  key={q.period}
                  className="tabular"
                  style={{
                    padding: '10px 8px', textAlign: 'center',
                    color: q[scoreKey] == null ? 'var(--faint)' : 'var(--ink-soft)',
                    ...(isCurrentPeriod(q.period) ? activeCellStyle : {}),
                  }}
                >
                  {q[scoreKey] ?? '·'}
                </td>
              ))}
              <td className="tabular" style={{
                padding: '10px 12px', textAlign: 'center', fontWeight: 700,
                borderLeft: '1px solid var(--line)',
              }}>
                {total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
