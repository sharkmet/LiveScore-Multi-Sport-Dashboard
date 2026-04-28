const ACTION_COLORS = {
  '3pt':    'var(--amber)',
  'layup':  '#3b82f6',
  'dunk':   'var(--live)',
  'jumper': 'var(--ink-soft)',
  '2pt':    'var(--ink-soft)',
  'ft':     'var(--muted)',
}

function ActionBadge({ actionType }) {
  const labels = { '3pt': '3PT', 'layup': 'LAY', 'dunk': 'DNK', 'jumper': 'JMP', '2pt': '2PT', 'ft': 'FT' }
  const color = ACTION_COLORS[actionType] ?? 'var(--faint)'
  const label = labels[actionType] ?? actionType?.toUpperCase() ?? '?'
  return (
    <span className="mono" style={{ fontSize: 10, fontWeight: 700, color }}>{label}</span>
  )
}

function PlayRow({ play }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg-sunken)',
      padding: '8px 12px',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 56, flexShrink: 0 }}>
        <span className="eyebrow">{play.period ? `Q${play.period}` : '–'}</span>
        <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>{play.clock ?? ''}</span>
      </div>
      <span style={{ width: 32, flexShrink: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink)' }}>
        {play.teamAbbrev}
      </span>
      <ActionBadge actionType={play.actionType} />
      <span style={{ minWidth: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: 'var(--ink-soft)' }}>
        {play.description ?? play.playerName ?? '–'}
      </span>
      <span className="mono tabular" style={{ flexShrink: 0, fontSize: 12, color: 'var(--ink)' }}>
        {play.scoreAway ?? '?'}–{play.scoreHome ?? '?'}
      </span>
    </div>
  )
}

export default function ScoringPlays({ plays, homeTeam, awayTeam }) {
  if (!plays?.length) {
    return (
      <p style={{ fontSize: 13, color: 'var(--faint)', textAlign: 'center', padding: '16px 0' }}>
        No scoring plays yet
      </p>
    )
  }

  const sorted = [...plays].reverse() // most recent first
  const pinned = sorted.slice(0, 3)
  const older  = sorted.slice(3)

  return (
    <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '8px 12px' }}>
      {/* Top 3 most recent — sticky to top */}
      <div style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--bg)', paddingBottom: 4 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {pinned.map((play, i) => <PlayRow key={i} play={play} />)}
        </div>
      </div>

      {/* Older plays — scroll down to reach them */}
      {older.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 4 }}>
          {older.map((play, i) => <PlayRow key={i + 3} play={play} />)}
        </div>
      )}
    </div>
  )
}
