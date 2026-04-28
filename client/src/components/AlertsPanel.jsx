import { formatRelativeTime } from '../utils/formatters.js'

const SEVERITY_STYLES = {
  critical: { bar: 'var(--live)',   badge: { bg: 'var(--live-soft)', color: 'var(--live)', border: 'var(--live-line)' } },
  warning:  { bar: 'var(--amber)',  badge: { bg: 'var(--amber-soft)', color: 'var(--amber)', border: '#E3CC9B' } },
  info:     { bar: 'var(--muted)',  badge: { bg: 'var(--bg-sunken)', color: 'var(--muted)', border: 'var(--line-2)' } },
}

function AlertItem({ alert, onSelect }) {
  const s = SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.info

  return (
    <button
      onClick={() => onSelect(alert.gameId)}
      style={{
        display: 'flex', width: '100%', alignItems: 'stretch', gap: 0,
        background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 10,
        textAlign: 'left', cursor: 'pointer', overflow: 'hidden',
        transition: 'box-shadow 0.12s, border-color 0.12s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--line-2)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(31,29,26,0.08)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      {/* Severity bar */}
      <div style={{ width: 3, flexShrink: 0, background: s.bar, alignSelf: 'stretch' }} />

      <div style={{ flex: 1, minWidth: 0, padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 4 }}>
          <span style={{
            display: 'inline-block', padding: '1px 7px', borderRadius: 999,
            background: s.badge.bg, color: s.badge.color, border: `1px solid ${s.badge.border}`,
            fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {alert.type.replace('_', ' ')}
          </span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--faint)' }}>
            {formatRelativeTime(alert.timestamp)}
          </span>
        </div>
        <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.4, margin: 0 }}>
          {alert.title}
        </p>
        <p style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.4, margin: '2px 0 0' }}>
          {alert.message}
        </p>
      </div>
    </button>
  )
}

export default function AlertsPanel({ alerts, onSelectGame }) {
  const liveCount = alerts.filter(a => a.severity === 'critical').length

  return (
    <aside style={{
      width: 304, flexShrink: 0,
      display: 'none',
      flexDirection: 'column',
      borderLeft: '1px solid var(--line)',
      background: 'var(--bg)',
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto',
    }}
    className="alerts-sidebar"
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 16px 12px',
        borderBottom: '1px solid var(--line)',
        position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 1,
      }}>
        <span className="eyebrow">Alerts</span>
        {liveCount > 0 && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 20, height: 20, borderRadius: 999,
            background: 'var(--live-soft)', color: 'var(--live)',
            border: '1px solid var(--live-line)',
            fontSize: 10, fontWeight: 700,
          }}>
            {liveCount}
          </span>
        )}
      </div>

      {/* List */}
      <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {alerts.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
            <p style={{ color: 'var(--faint)', fontSize: 13 }}>No alerts</p>
          </div>
        ) : (
          alerts.map(alert => (
            <AlertItem key={alert.id} alert={alert} onSelect={onSelectGame} />
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 16px', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p className="eyebrow" style={{ margin: 0 }}>Push: Scoring + Finals</p>
        <button style={{ fontSize: 10, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          Settings
        </button>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .alerts-sidebar { display: flex !important; }
        }
      `}</style>
    </aside>
  )
}
