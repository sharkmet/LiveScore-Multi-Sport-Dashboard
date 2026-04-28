function PossessionDot({ active }) {
  if (!active) return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 999, border: '1px solid var(--line-2)' }} />
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8, flexShrink: 0 }}>
      <span style={{ position: 'absolute', display: 'inline-flex', width: '100%', height: '100%', borderRadius: 999, background: 'var(--amber)', opacity: 0.7, animation: 'livepulse 1.8s infinite' }} />
      <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8, borderRadius: 999, background: 'var(--amber)' }} />
    </span>
  )
}

function TimeoutDots({ remaining, total = 7 }) {
  const dots = Array.from({ length: total }, (_, i) => i < remaining)
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {dots.map((active, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block', width: 8, height: 8, borderRadius: 999,
            background: active ? 'var(--ink-soft)' : 'transparent',
            border: active ? 'none' : '1px solid var(--line-2)',
          }}
        />
      ))}
    </div>
  )
}

function TeamStat({ label, value, bonus, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <span className="eyebrow">{label}</span>
      {children ?? (
        <span className="tabular" style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{value}</span>
      )}
      {bonus && (
        <span className="chip" style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(200,160,40,0.1)', color: 'var(--amber)', borderColor: 'rgba(200,160,40,0.3)' }}>
          Bonus
        </span>
      )}
    </div>
  )
}

export default function BasketballMatchupPanel({ matchup, homeTeam, awayTeam }) {
  if (!matchup) return null

  const { timeoutsHome, timeoutsAway, foulsHome, foulsAway, homeInBonus, awayInBonus, possession } = matchup
  const awayHasBall = possession === 'away'
  const homeHasBall = possession === 'home'

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PossessionDot active={awayHasBall} />
            <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink)' }}>
              {awayTeam?.abbreviation ?? 'Away'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <TeamStat label="Fouls" value={foulsAway} bonus={awayInBonus} />
            <TeamStat label="T/O"><TimeoutDots remaining={timeoutsAway ?? 0} /></TeamStat>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span className="eyebrow">Live</span>
          <div style={{ height: 1, width: '100%', background: 'var(--line)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink)' }}>
              {homeTeam?.abbreviation ?? 'Home'}
            </span>
            <PossessionDot active={homeHasBall} />
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <TeamStat label="Fouls" value={foulsHome} bonus={homeInBonus} />
            <TeamStat label="T/O"><TimeoutDots remaining={timeoutsHome ?? 0} /></TeamStat>
          </div>
        </div>
      </div>
    </div>
  )
}
