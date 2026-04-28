const PITCH_TYPE_LABELS = {
  FF: 'Four-Seam FB', SI: 'Sinker', FC: 'Cutter', SL: 'Slider',
  CU: 'Curveball', CH: 'Changeup', FS: 'Splitter', KC: 'Knuck-Curve',
  KN: 'Knuckleball', EP: 'Eephus',
}

function BaseDiamond({ runners }) {
  const { first = false, second = false, third = false } = runners ?? {}
  const on  = (b) => b ? 'var(--amber)' : 'transparent'
  const str = (b) => b ? 'var(--amber)' : 'var(--line-2)'

  return (
    <svg viewBox="0 0 48 48" width="48" height="48" aria-label="Runners on base">
      <rect x="21" y="35" width="6" height="6" style={{ fill: 'var(--faint)' }} transform="rotate(45 24 38)" />
      <rect x="35" y="21" width="7" height="7" style={{ fill: on(first), stroke: str(first), strokeWidth: 1.5 }} transform="rotate(45 38.5 24.5)" />
      <rect x="21" y="7"  width="7" height="7" style={{ fill: on(second), stroke: str(second), strokeWidth: 1.5 }} transform="rotate(45 24.5 10.5)" />
      <rect x="7"  y="21" width="7" height="7" style={{ fill: on(third), stroke: str(third), strokeWidth: 1.5 }} transform="rotate(45 10.5 24.5)" />
    </svg>
  )
}

function CountDots({ value, max, color }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          style={{
            width: 10, height: 10, borderRadius: 999,
            background: i < value ? color : 'transparent',
            border: i < value ? 'none' : '1px solid var(--line-2)',
          }}
        />
      ))}
    </div>
  )
}

function PitchBadge({ lastPitch }) {
  if (!lastPitch) return null
  const typeLabel = PITCH_TYPE_LABELS[lastPitch.type] ?? lastPitch.type
  const desc = lastPitch.description?.toLowerCase() ?? ''
  const isStrike = desc.includes('strike') || desc.includes('foul') || desc.includes('swinging')
  const isBall   = desc.includes('ball')

  const style = isStrike
    ? { background: 'var(--live-soft)', borderColor: 'var(--live-line)', color: 'var(--live)' }
    : isBall
    ? { background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.25)', color: '#22c55e' }
    : { background: 'var(--bg-sunken)', borderColor: 'var(--line)', color: 'var(--muted)' }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 8, border: `1px solid ${style.borderColor}`, background: style.background, padding: '6px 12px', fontSize: 12 }}>
      <span style={{ fontWeight: 700, color: style.color }}>{typeLabel}</span>
      {lastPitch.speed && (
        <span className="mono" style={{ color: 'var(--muted)' }}>{lastPitch.speed} mph</span>
      )}
      <span style={{ color: 'var(--faint)' }}>·</span>
      <span style={{ color: 'var(--ink-soft)', textTransform: 'capitalize' }}>{lastPitch.description}</span>
    </div>
  )
}

export default function MatchupPanel({ matchup }) {
  if (!matchup) return null
  const { batter, pitcher, count, runners, lastPitch } = matchup

  return (
    <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <span className="eyebrow">Current At-Bat</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <BaseDiamond runners={runners} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'B', value: count?.balls ?? 0,   max: 4, color: '#22c55e' },
            { label: 'S', value: count?.strikes ?? 0, max: 3, color: 'var(--live)' },
            { label: 'O', value: count?.outs ?? 0,    max: 3, color: 'var(--amber)' },
          ].map(({ label, value, max, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="eyebrow" style={{ width: 12 }}>{label}</span>
              <CountDots value={value} max={max} color={color} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { role: 'Batting', person: batter, stats: [{ label: 'AVG', val: batter?.avg }, { label: 'OPS', val: batter?.ops }, { label: 'HR', val: batter?.hrThisSeason }] },
          { role: 'Pitching', person: pitcher, stats: [{ label: 'ERA', val: pitcher?.era }, { label: 'W-L', val: `${pitcher?.wins}-${pitcher?.losses}` }, { label: 'IP', val: pitcher?.ip }] },
        ].map(({ role, person, stats }) => (
          <div key={role} style={{ borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg-sunken)', padding: '10px 12px' }}>
            <div className="eyebrow" style={{ marginBottom: 4 }}>{role}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>{person?.name}</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
              {stats.map(({ label, val }) => (
                <span key={label} className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>
                  <span style={{ color: 'var(--ink-soft)' }}>{val}</span> {label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {lastPitch && <PitchBadge lastPitch={lastPitch} />}
    </div>
  )
}
