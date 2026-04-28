function TeamDot({ color }) {
  return (
    <span style={{
      display: 'inline-block', width: 8, height: 8, borderRadius: 999, flexShrink: 0,
      background: color || 'var(--muted-2)', border: '1px solid var(--line)',
    }} />
  )
}

const SERVER_LABELS = { 1: '1st', 2: '2nd', 3: '3rd', 4: 'OT', 5: 'SO' }
const DISPLAY_LABELS = { 1: 'P1', 2: 'P2', 3: 'P3', 4: 'OT', 5: 'SO' }

export default function HockeyLinescore({ game }) {
  const { timeline, homeTeam, awayTeam, score, boxScore, status, period } = game

  const currentPeriod  = period?.current ?? 0
  const totalPeriods   = Math.max(3, period?.totalPeriods ?? 3, currentPeriod)

  // Always show P1–P3; add OT / SO columns if the game went there
  const periodNums = [1, 2, 3]
  if (totalPeriods >= 4 || currentPeriod >= 4) periodNums.push(4)
  if (totalPeriods >= 5 || currentPeriod >= 5) periodNums.push(5)

  // Build a score lookup keyed by server period label ("1st", "2nd", etc.)
  const scoreByLabel = {}
  for (const t of timeline ?? []) {
    scoreByLabel[t.periodLabel] = { home: t.homeScore, away: t.awayScore }
  }

  const homeSOG = boxScore?.home?.totals?.shotsOnGoal ?? game.matchup?.shotsOnGoal?.home ?? null
  const awaySOG = boxScore?.away?.totals?.shotsOnGoal ?? game.matchup?.shotsOnGoal?.away ?? null

  const isLivePeriod = (num) => status === 'live' && num === currentPeriod
  const activeCellStyle = { background: 'var(--live-soft)' }

  function getCellScore(num, teamKey) {
    const label = SERVER_LABELS[num]
    const data  = label ? scoreByLabel[label] : null
    if (data) return data[teamKey]
    return null // show '·'
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', minWidth: 380, borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            <th className="eyebrow" style={{ padding: '8px 14px', textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              Team
            </th>
            {periodNums.map(num => (
              <th
                key={num}
                className="eyebrow mono"
                style={{
                  padding: '8px 8px', textAlign: 'center', minWidth: 36, fontSize: 10,
                  color: isLivePeriod(num) ? 'var(--live)' : 'var(--muted-2)',
                  borderBottom: '1px solid var(--line)',
                  ...(isLivePeriod(num) ? activeCellStyle : {}),
                }}
              >
                {DISPLAY_LABELS[num] ?? `P${num}`}
              </th>
            ))}
            <th className="eyebrow" style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid var(--line)', borderLeft: '1px solid var(--line)' }}>
              T
            </th>
            {(homeSOG !== null || awaySOG !== null) && (
              <th className="eyebrow" style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid var(--line)' }}>
                SOG
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {[
            { team: awayTeam, teamKey: 'away', totalScore: score.away, sog: awaySOG },
            { team: homeTeam, teamKey: 'home', totalScore: score.home, sog: homeSOG },
          ].map(({ team, teamKey, totalScore, sog }, rowIdx) => (
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
              {periodNums.map(num => {
                const s = getCellScore(num, teamKey)
                return (
                  <td
                    key={num}
                    className="tabular"
                    style={{
                      padding: '10px 8px', textAlign: 'center', color: 'var(--ink-soft)',
                      ...(isLivePeriod(num) ? activeCellStyle : {}),
                    }}
                  >
                    {s ?? '·'}
                  </td>
                )
              })}
              <td className="tabular" style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, borderLeft: '1px solid var(--line)' }}>
                {totalScore}
              </td>
              {(homeSOG !== null || awaySOG !== null) && (
                <td className="tabular" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>
                  {sog ?? '–'}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
