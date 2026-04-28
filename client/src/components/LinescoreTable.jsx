function TeamDot({ color }) {
  return (
    <span style={{
      display: 'inline-block', width: 8, height: 8, borderRadius: 999, flexShrink: 0,
      background: color || 'var(--muted-2)', border: '1px solid var(--line)',
    }} />
  )
}

export default function LinescoreTable({ game }) {
  const { homeTeam, awayTeam, score, timeline, period } = game
  const numInnings = Math.max(9, timeline.length)
  const innings = Array.from({ length: numInnings }, (_, i) => i + 1)

  const getScore = (teamKey, inning) => {
    const entry = timeline.find((e) => e.period === inning)
    return entry ? entry[teamKey] : null
  }

  const isCurrentInning = (inning) =>
    game.status === 'live' && inning === period.current

  const activeCellStyle = { background: 'var(--live-soft)' }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th className="eyebrow" style={{
              padding: '8px 14px', textAlign: 'left',
              borderBottom: '1px solid var(--line)',
            }}>
              Team
            </th>
            {innings.map((n) => (
              <th
                key={n}
                className="eyebrow mono"
                style={{
                  padding: '8px 8px', textAlign: 'center', minWidth: 32,
                  fontSize: 10, color: isCurrentInning(n) ? 'var(--live)' : 'var(--muted-2)',
                  borderBottom: '1px solid var(--line)',
                  ...(isCurrentInning(n) ? activeCellStyle : {}),
                }}
              >
                {n}
              </th>
            ))}
            <th className="eyebrow" style={{
              padding: '8px 12px', textAlign: 'center',
              borderBottom: '1px solid var(--line)', borderLeft: '1px solid var(--line)',
            }}>R</th>
            <th className="eyebrow" style={{
              padding: '8px 12px', textAlign: 'center',
              borderBottom: '1px solid var(--line)',
            }}>H</th>
            <th className="eyebrow" style={{
              padding: '8px 12px', textAlign: 'center',
              borderBottom: '1px solid var(--line)',
            }}>E</th>
          </tr>
        </thead>
        <tbody>
          {[
            { team: awayTeam, teamKey: 'awayScore', total: score.away },
            { team: homeTeam, teamKey: 'homeScore', total: score.home },
          ].map(({ team, teamKey, total }, rowIdx) => (
            <tr
              key={rowIdx}
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
              {innings.map((n) => {
                const val = getScore(teamKey, n)
                return (
                  <td
                    key={n}
                    className="tabular mono"
                    style={{
                      padding: '10px 8px', textAlign: 'center',
                      color: val == null ? 'var(--faint)' : 'var(--ink-soft)',
                      ...(isCurrentInning(n) ? activeCellStyle : {}),
                    }}
                  >
                    {val == null ? '·' : val}
                  </td>
                )
              })}
              <td className="tabular" style={{
                padding: '10px 12px', textAlign: 'center', fontWeight: 700,
                borderLeft: '1px solid var(--line)',
              }}>
                {total}
              </td>
              <td className="tabular mono" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--ink-soft)' }}>-</td>
              <td className="tabular mono" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>-</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
