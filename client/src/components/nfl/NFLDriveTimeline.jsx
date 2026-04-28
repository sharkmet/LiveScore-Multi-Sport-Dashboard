const RESULT_COLORS = {
  TD:         'var(--win)',
  FG:         'var(--amber)',
  Punt:       'var(--muted)',
  Turnover:   'var(--live)',
  INT:        'var(--live)',
  Fumble:     'var(--live)',
  'End Half': 'var(--muted)',
  'End Game': 'var(--muted)',
  Missed:     'var(--amber)',
  default:    'var(--muted)',
}

function resultColor(result) {
  if (!result) return RESULT_COLORS.default
  for (const key of Object.keys(RESULT_COLORS)) {
    if (result.includes(key)) return RESULT_COLORS[key]
  }
  return RESULT_COLORS.default
}

export default function NFLDriveTimeline({ drives = [], homeTeam, awayTeam }) {
  if (!drives.length) {
    return (
      <p style={{ padding: '16px 0', textAlign: 'center', fontSize: 12, color: 'var(--faint)' }}>
        No drive data available
      </p>
    )
  }

  return (
    <div style={{ maxHeight: 256, overflowY: 'auto' }}>
      <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
        <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-elev)' }}>
          <tr>
            {['Team', 'Result', 'Plays', 'Yds', 'TOP'].map((h, i) => (
              <th
                key={h}
                className="eyebrow"
                style={{ padding: '6px 8px', textAlign: i >= 2 ? 'right' : 'left', borderBottom: '1px solid var(--line)' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {drives.map((drive, i) => {
            const isHome = drive.team === 'home' || drive.team === homeTeam?.abbreviation
            const abbr   = isHome ? homeTeam?.abbreviation : awayTeam?.abbreviation
            return (
              <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
                <td style={{ padding: '6px 8px', fontWeight: 700, color: 'var(--ink)' }}>{abbr ?? drive.team}</td>
                <td style={{ padding: '6px 8px', fontWeight: 600, color: resultColor(drive.result) }}>
                  {drive.result ?? '—'}
                </td>
                <td className="mono" style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--muted)' }}>{drive.plays ?? '—'}</td>
                <td className="mono" style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--muted)' }}>{drive.yards ?? '—'}</td>
                <td className="mono" style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--muted)' }}>{drive.timeOfPossession ?? '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
