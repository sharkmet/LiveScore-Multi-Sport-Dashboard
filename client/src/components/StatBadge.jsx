export default function StatBadge({ label, value, highlight = false }) {
  const style = highlight
    ? { background: 'rgba(200,160,40,0.12)', color: 'var(--amber)', outline: '1px solid rgba(200,160,40,0.3)' }
    : { background: 'var(--bg-sunken)', color: 'var(--muted)' }

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontFamily: 'monospace', ...style }}>
      {label && <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, lineHeight: 1, marginBottom: 2 }}>{label}</span>}
      <span style={{ lineHeight: 1, fontWeight: 600 }}>{value}</span>
    </span>
  )
}

export function isHighlightERA(era) {
  const n = parseFloat(era)
  return !isNaN(n) && n < 2.5
}

export function isHighlightAVG(avg) {
  const n = parseFloat(avg)
  return !isNaN(n) && n >= 0.3
}

export function isHighlightHR(hr, gamesPlayed) {
  if (!gamesPlayed || gamesPlayed === 0) return false
  return (hr / gamesPlayed) * 162 >= 30
}
