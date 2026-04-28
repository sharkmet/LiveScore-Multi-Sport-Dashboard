function SkaterTable({ skaters }) {
  if (!skaters?.length) return null
  const th = { padding: '6px 8px', textAlign: 'right', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', borderBottom: '1px solid var(--line)' }
  const td = { padding: '6px 8px', textAlign: 'right', fontSize: 12, color: 'var(--ink-soft)' }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {['Player','G','A','Pts','+/-','PIM','SOG','TOI'].map((h, i) => (
            <th key={h} style={{ ...th, textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {skaters.map((s, i) => (
          <tr key={i} style={{ borderBottom: i < skaters.length - 1 ? '1px solid var(--line)' : 'none' }}>
            <td style={{ ...td, textAlign: 'left', color: 'var(--ink)', fontWeight: 500 }}>{s.name}</td>
            <td className="tabular" style={td}>{s.goals}</td>
            <td className="tabular" style={td}>{s.assists}</td>
            <td className="tabular" style={{ ...td, fontWeight: 600 }}>{s.points}</td>
            <td className="tabular" style={{ ...td, color: s.plusMinus > 0 ? 'var(--win)' : s.plusMinus < 0 ? 'var(--live)' : 'var(--faint)' }}>
              {s.plusMinus > 0 ? `+${s.plusMinus}` : s.plusMinus}
            </td>
            <td className="tabular" style={td}>{s.pim}</td>
            <td className="tabular" style={td}>{s.shots}</td>
            <td className="tabular" style={{ ...td, color: 'var(--muted)' }}>{s.timeOnIce}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function GoalieTable({ goalies }) {
  if (!goalies?.length) return null
  const th = { padding: '6px 8px', textAlign: 'right', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', borderBottom: '1px solid var(--line)' }
  const td = { padding: '6px 8px', textAlign: 'right', fontSize: 12, color: 'var(--ink-soft)' }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {['Goalie','GA','SA','SV%','TOI'].map((h, i) => (
            <th key={h} style={{ ...th, textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {goalies.map((g, i) => (
          <tr key={i} style={{ borderBottom: i < goalies.length - 1 ? '1px solid var(--line)' : 'none' }}>
            <td style={{ ...td, textAlign: 'left', color: 'var(--ink)', fontWeight: 500 }}>{g.name}</td>
            <td className="tabular" style={td}>{g.goalsAgainst}</td>
            <td className="tabular" style={td}>{g.shotsAgainst}</td>
            <td className="tabular" style={{ ...td, fontWeight: 600 }}>{g.savePercentage}</td>
            <td className="tabular" style={{ ...td, color: 'var(--muted)' }}>{g.timeOnIce}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function TeamTotalsBar({ totals, label }) {
  if (!totals) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', borderRadius: 8, background: 'var(--bg-sunken)', border: '1px solid var(--line)', padding: '8px 12px', fontSize: 12, color: 'var(--muted)' }}>
      <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{label}</span>
      <span>Goals: <strong style={{ color: 'var(--ink-soft)' }}>{totals.goals}</strong></span>
      <span>SOG: <strong style={{ color: 'var(--ink-soft)' }}>{totals.shotsOnGoal}</strong></span>
      <span>PP: <strong style={{ color: 'var(--ink-soft)' }}>{totals.powerPlayGoals}/{totals.powerPlayOpportunities}</strong></span>
      <span>PIM: <strong style={{ color: 'var(--ink-soft)' }}>{totals.pim}</strong></span>
    </div>
  )
}

function TeamSection({ team, data, side }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h4 className="eyebrow">{team.abbreviation} — {side === 'away' ? 'Away' : 'Home'}</h4>
      <TeamTotalsBar totals={data.totals} label="Totals" />
      <div style={{ overflowX: 'auto' }}>
        <SkaterTable skaters={data.skaters} />
      </div>
      {data.goalies?.length > 0 && (
        <>
          <p className="eyebrow" style={{ marginTop: 4 }}>Goalies</p>
          <div style={{ overflowX: 'auto' }}>
            <GoalieTable goalies={data.goalies} />
          </div>
        </>
      )}
    </div>
  )
}

export default function HockeyBoxScore({ boxScore, homeTeam, awayTeam }) {
  if (!boxScore) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <TeamSection team={awayTeam} data={boxScore.away} side="away" />
      <div className="hairline" />
      <TeamSection team={homeTeam} data={boxScore.home} side="home" />
    </div>
  )
}
