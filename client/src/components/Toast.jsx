const SEVERITY_STYLES = {
  critical: { bar: 'var(--live)',   bg: 'var(--live-soft)',  color: 'var(--live)',  border: 'var(--live-line)' },
  warning:  { bar: 'var(--amber)',  bg: 'var(--amber-soft)', color: 'var(--amber)', border: '#E3CC9B' },
  info:     { bar: 'var(--muted)',  bg: 'var(--bg-elev)',    color: 'var(--muted)', border: 'var(--line-2)' },
}

export default function Toast({ alert, onDismiss }) {
  const s = SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.info

  return (
    <div style={{
      display: 'flex', width: 320, overflow: 'hidden', borderRadius: 14,
      border: `1px solid ${s.border}`,
      background: s.bg,
      boxShadow: '0 8px 30px rgba(31,29,26,0.12), 0 2px 8px rgba(31,29,26,0.08)',
      animation: 'toastIn 0.3s cubic-bezier(0.16,1,0.3,1)',
    }}>
      {/* Severity bar */}
      <div style={{ width: 4, flexShrink: 0, background: s.bar }} />

      <div style={{ display: 'flex', flex: 1, alignItems: 'flex-start', gap: 12, padding: '12px 14px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 4 }}>
            <span style={{
              display: 'inline-block', padding: '1px 7px', borderRadius: 999,
              background: 'rgba(255,255,255,0.6)', color: s.color,
              border: `1px solid ${s.border}`,
              fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {alert.type.replace('_', ' ')}
            </span>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.4, margin: 0 }}>
            {alert.title}
          </p>
          <p style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.4, margin: '2px 0 0' }}>
            {alert.message}
          </p>
        </div>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{
            flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--muted-2)', fontSize: 14, lineHeight: 1, padding: 2,
          }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
