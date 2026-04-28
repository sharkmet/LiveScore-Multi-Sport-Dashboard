function PlayerTable({ players }) {
  if (!players?.length) return null
  const th = { padding: '6px 8px', textAlign: 'right', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', borderBottom: '1px solid var(--line)' }
  const td = { padding: '6px 8px', textAlign: 'right', fontSize: 12, color: 'var(--ink-soft)' }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {['Player','PTS','REB','AST','STL','BLK','FG','3P','FT','TO','PF'].map((h, i) => (
            <th key={h} style={{ ...th, textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {players.map((p, i) => {
          const s = p.statistics ?? {}
          const fgStr = s.fieldGoalsAttempted != null ? `${s.fieldGoalsMade}/${s.fieldGoalsAttempted}` : '–'
          const tpStr = s.threePointersAttempted != null ? `${s.threePointersMade}/${s.threePointersAttempted}` : '–'
          const ftStr = s.freeThrowsAttempted != null ? `${s.freeThrowsMade}/${s.freeThrowsAttempted}` : '–'
          return (
            <tr key={i} style={{ borderBottom: i < players.length - 1 ? '1px solid var(--line)' : 'none' }}>
              <td style={{ ...td, textAlign: 'left', color: 'var(--ink)', fontWeight: 500 }}>
                {p.name}
                {p.position && <span style={{ marginLeft: 4, fontSize: 10, color: 'var(--faint)' }}>{p.position}</span>}
                {p.oncourt && <span style={{ marginLeft: 6, display: 'inline-block', width: 6, height: 6, borderRadius: 999, background: 'var(--live)', verticalAlign: 'middle' }} />}
              </td>
              <td className="tabular" style={{ ...td, fontWeight: 600 }}>{s.points ?? '–'}</td>
              <td className="tabular" style={td}>{s.rebounds ?? '–'}</td>
              <td className="tabular" style={td}>{s.assists ?? '–'}</td>
              <td className="tabular" style={td}>{s.steals ?? '–'}</td>
              <td className="tabular" style={td}>{s.blocks ?? '–'}</td>
              <td className="tabular" style={td}>{fgStr}</td>
              <td className="tabular" style={td}>{tpStr}</td>
              <td className="tabular" style={td}>{ftStr}</td>
              <td className="tabular" style={td}>{s.turnovers ?? '–'}</td>
              <td className="tabular" style={td}>{s.foulsPersonal ?? '–'}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function TeamTotalsBar({ totals, label }) {
  if (!totals) return null
  const fgPct = totals.fieldGoalsAttempted > 0 ? ((totals.fieldGoalsMade / totals.fieldGoalsAttempted) * 100).toFixed(1) + '%' : '–'
  const tpPct = totals.threePointersAttempted > 0 ? ((totals.threePointersMade / totals.threePointersAttempted) * 100).toFixed(1) + '%' : '–'
  const ftPct = totals.freeThrowsAttempted > 0 ? ((totals.freeThrowsMade / totals.freeThrowsAttempted) * 100).toFixed(1) + '%' : '–'

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', borderRadius: 8, background: 'var(--bg-sunken)', border: '1px solid var(--line)', padding: '8px 12px', fontSize: 12, color: 'var(--muted)' }}>
      <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{label}</span>
      <span>FG: <strong style={{ color: 'var(--ink-soft)' }}>{fgPct}</strong></span>
      <span>3P: <strong style={{ color: 'var(--ink-soft)' }}>{tpPct}</strong></span>
      <span>FT: <strong style={{ color: 'var(--ink-soft)' }}>{ftPct}</strong></span>
      {totals.rebounds != null && <span>REB: <strong style={{ color: 'var(--ink-soft)' }}>{totals.rebounds}</strong></span>}
      {totals.assists != null && <span>AST: <strong style={{ color: 'var(--ink-soft)' }}>{totals.assists}</strong></span>}
      {totals.turnovers != null && <span>TO: <strong style={{ color: 'var(--ink-soft)' }}>{totals.turnovers}</strong></span>}
    </div>
  )
}

function TeamSection({ team, data, side }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h4 className="eyebrow">{team.abbreviation} — {side === 'away' ? 'Away' : 'Home'}</h4>
      <TeamTotalsBar totals={data.teamStats ?? data.totals} label="Totals" />
      <div style={{ overflowX: 'auto' }}>
        <PlayerTable players={data.players} />
      </div>
    </div>
  )
}

export default function BasketballBoxScore({ boxScore, homeTeam, awayTeam }) {
  if (!boxScore) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <TeamSection team={awayTeam} data={boxScore.away} side="away" />
      <div className="hairline" />
      <TeamSection team={homeTeam} data={boxScore.home} side="home" />
    </div>
  )
}
