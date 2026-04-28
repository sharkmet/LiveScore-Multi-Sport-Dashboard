const STRENGTH_STYLES = {
  PP: { borderColor: 'rgba(200,160,40,0.4)', background: 'rgba(200,160,40,0.08)', color: 'var(--amber)' },
  SH: { borderColor: 'rgba(59,130,246,0.4)', background: 'rgba(59,130,246,0.08)', color: '#3b82f6' },
  EN: { borderColor: 'var(--live-line)', background: 'var(--live-soft)', color: 'var(--live)' },
  EV: { borderColor: 'var(--line)', background: 'var(--bg-sunken)', color: 'var(--muted)' },
}

function StrengthBadge({ strength, strengthLabel }) {
  const s = STRENGTH_STYLES[strength] ?? STRENGTH_STYLES.EV
  const labels = { PP: 'Power Play', SH: 'Short-Handed', EN: 'Empty Net', EV: 'Even Strength' }
  return (
    <div className="chip" style={{ border: `1px solid ${s.borderColor}`, background: s.background, color: s.color, gap: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{strengthLabel}</span>
      <span style={{ fontSize: 10, opacity: 0.7 }}>{labels[strength] ?? strength}</span>
    </div>
  )
}

function OnIceRoster({ players, label }) {
  if (!players?.length) return null
  return (
    <div>
      <p className="eyebrow" style={{ marginBottom: 6 }}>{label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {players.map((p) => (
          <div
            key={p.id}
            style={{ display: 'flex', alignItems: 'center', gap: 6, borderRadius: 6, border: '1px solid var(--line)', background: 'var(--bg-sunken)', padding: '4px 8px' }}
          >
            <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>#{p.number}</span>
            <span style={{ fontSize: 12, color: 'var(--ink)' }}>{p.name}</span>
            <span style={{ fontSize: 10, color: 'var(--faint)' }}>{p.position}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PenaltyBox({ penalties }) {
  if (!penalties?.length) return null
  return (
    <div>
      <p className="eyebrow" style={{ marginBottom: 6 }}>Penalty Box</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {penalties.map((p, i) => (
          <div
            key={i}
            style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 6, border: '1px solid rgba(200,160,40,0.3)', background: 'rgba(200,160,40,0.06)', padding: '6px 12px', fontSize: 12 }}
          >
            <span style={{ fontWeight: 700, color: 'var(--amber)' }}>{p.team}</span>
            <span style={{ color: 'var(--ink)' }}>{p.player}</span>
            <span style={{ color: 'var(--muted)' }}>· {p.infraction}</span>
            <span className="mono" style={{ marginLeft: 'auto', color: 'var(--amber)' }}>{p.timeRemaining}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HockeyMatchupPanel({ matchup, homeTeam, awayTeam }) {
  if (!matchup) return null

  const { period, strength, strengthLabel, shotsOnGoal, homeOnIce, awayOnIce, penalties } = matchup
  const isNonEV = strength && strength !== 'EV'

  return (
    <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{period?.label ?? 'Live'}</span>
          {period?.timeRemaining && (
            <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{period.timeRemaining}</span>
          )}
          {period?.inIntermission && (
            <span className="chip" style={{ fontSize: 10, color: 'var(--muted)' }}>Intermission</span>
          )}
        </div>
        {isNonEV && <StrengthBadge strength={strength} strengthLabel={strengthLabel} />}
      </div>

      {shotsOnGoal && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg-sunken)', padding: '8px 16px' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p className="eyebrow" style={{ marginBottom: 2 }}>{awayTeam?.abbreviation}</p>
            <p className="tabular" style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>{shotsOnGoal.away}</p>
          </div>
          <div className="eyebrow">SOG</div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p className="eyebrow" style={{ marginBottom: 2 }}>{homeTeam?.abbreviation}</p>
            <p className="tabular" style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>{shotsOnGoal.home}</p>
          </div>
        </div>
      )}

      <PenaltyBox penalties={penalties} />

      {(awayOnIce?.length > 0 || homeOnIce?.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <OnIceRoster players={awayOnIce} label={`${awayTeam?.abbreviation ?? 'Away'} on ice`} />
          <OnIceRoster players={homeOnIce} label={`${homeTeam?.abbreviation ?? 'Home'} on ice`} />
        </div>
      )}
    </div>
  )
}
