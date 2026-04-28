import { useLeagueData } from '../hooks/useLeagueData'

const LEAGUE_META = {
  mlb: { icon: '⚾', label: 'MLB', season: '2026 Regular Season' },
  nhl: { icon: '🏒', label: 'NHL', season: '2025–26 Regular Season' },
  nba: { icon: '🏀', label: 'NBA', season: '2025–26 Regular Season' },
  nfl: { icon: '🏈', label: 'NFL', season: '2024–25 Regular Season' },
}

const COLUMN_MAP = {
  W:    'wins',
  L:    'losses',
  T:    'ties',
  OT:   'otLosses',
  PTS:  'points',
  GF:   'gf',
  GA:   'ga',
  RS:   'gf',
  RA:   'ga',
  PF:   'pf',
  PA:   'pa',
  DIFF: 'diff',
  Net:  'diff',
  PCT:  'pct',
  GB:   'gamesBack',
  PPG:  'gf',
  OPP:  'ga',
  Div:  'divRecord',
  Conf: 'confRecord',
  Str:  'streak',
  L10:  'last10',
  STRK: 'streak',
}

const FALLBACK_DIVISIONS = {
  mlb: ['AL East', 'AL Central', 'AL West', 'NL East', 'NL Central', 'NL West'],
  nhl: ['Atlantic', 'Metropolitan', 'Central', 'Pacific'],
  nba: ['East', 'West'],
  nfl: ['AFC East', 'AFC North', 'AFC South', 'AFC West', 'NFC East', 'NFC North', 'NFC South', 'NFC West'],
}

function playoffDot(status) {
  if (status === 'in')         return <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--win)', flexShrink: 0, display: 'inline-block', marginRight: 6 }} title="Playoffs" />
  if (status === 'eliminated') return <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--faint)', flexShrink: 0, display: 'inline-block', marginRight: 6 }} title="Eliminated" />
  return <span style={{ width: 7, height: 7, marginRight: 6, display: 'inline-block' }} />
}

function playoffRowStyle(status, isFirst) {
  if (status === 'eliminated') return { opacity: 0.55 }
  if (status === 'in' && isFirst) return { background: 'var(--win-soft)' }
  if (status === 'in')         return { borderLeft: '2px solid var(--win)' }
  return {}
}

// Columns whose values are wide (decimals, records, multi-char strings)
const LONG_COLS  = new Set(['PCT', 'PPG', 'OPP', 'Div', 'Conf', 'L10'])
const SHORT_COLS = new Set(['W', 'L', 'OT', 'T', 'Str', 'STRK'])
function colPx(col) {
  if (SHORT_COLS.has(col)) return 26
  if (LONG_COLS.has(col))  return 48
  return 38
}

function DivisionTable({ name, teams, columns, liveTeams }) {
  const lastCol = columns.length - 1
  // Team col ≈ 85px; each stat col varies; +14 for extra right-edge breathing room
  const tableMinWidth = 85 + columns.reduce((sum, col) => sum + colPx(col), 0) + 14

  return (
    <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--line)', background: 'var(--bg-sunken)' }}>
        <span className="eyebrow">{name}</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: tableMinWidth }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)' }}>
              <th style={{ padding: '8px 10px', textAlign: 'left' }}>
                <span className="eyebrow" style={{ fontSize: 9.5 }}>Team</span>
              </th>
              {columns.map((col, idx) => {
                const p = colPx(col) > 40 ? 5 : 4
                const pr = idx === lastCol ? 16 : p
                return (
                  <th key={col} style={{ padding: `8px ${pr}px 8px ${p}px`, textAlign: 'right' }}>
                    <span className="eyebrow" style={{ fontSize: 9.5 }}>{col}</span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {teams.map((team, i) => {
              const isLive = liveTeams?.has(team.abbreviation)
              return (
              <tr
                key={team.teamId || team.abbreviation}
                className="row-hover"
                style={{ borderBottom: '1px solid var(--line)', ...playoffRowStyle(team.playoffStatus, i === 0) }}
              >
                <td style={{ padding: '9px 10px', textAlign: 'left' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span className="mono" style={{ color: 'var(--faint)', fontSize: 10.5, width: 14, flexShrink: 0, textAlign: 'right' }}>{i + 1}</span>
                    {playoffDot(team.playoffStatus)}
                    <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{team.abbreviation}</span>
                    {isLive && (
                      <span title="Playing now" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, marginLeft: 2 }}>
                        <span className="pulsedot" style={{ width: 5, height: 5, flexShrink: 0 }} />
                        <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--live)', letterSpacing: '0.04em' }}>LIVE</span>
                      </span>
                    )}
                  </span>
                </td>
                {columns.map((col, idx) => {
                  const field = COLUMN_MAP[col]
                  const val   = field ? (team[field] ?? '—') : '—'
                  const isStreak = col === 'Str' || col === 'STRK'
                  const streakColor = isStreak && typeof val === 'string'
                    ? (val.startsWith('W') ? 'var(--win)' : val.startsWith('L') ? 'var(--loss)' : 'var(--ink-soft)')
                    : 'var(--ink-soft)'
                  const p = colPx(col) > 40 ? 5 : 4
                  const pr = idx === lastCol ? 16 : p
                  return (
                    <td key={col} style={{ padding: `9px ${pr}px 9px ${p}px`, textAlign: 'right', color: streakColor }} className="tabular mono">
                      {val === '' || val === null ? '—' : val}
                    </td>
                  )
                })}
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  )
}


const GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 460px))',
  gap: 16,
  justifyContent: 'center',
}

function LoadingSkeleton({ divisions }) {
  return (
    <div style={GRID_STYLE}>
      {divisions.map(name => (
        <div key={name} className="card" style={{ padding: 16 }}>
          <div className="skeleton" style={{ height: 12, width: 120, marginBottom: 14 }} />
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
              <div className="skeleton" style={{ height: 11, width: 120, opacity: 0.6 - i * 0.08 }} />
              <div style={{ flex: 1 }} />
              {[1, 2, 3].map(j => (
                <div key={j} className="skeleton" style={{ height: 11, width: 24, opacity: 0.4 - i * 0.05 }} />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default function StandingsView({ league, liveTeams }) {
  const meta = LEAGUE_META[league]
  const { data, isLoading, error } = useLeagueData('standings', league)

  if (!meta) return null

  return (
    <div className="fadein" style={{ maxWidth: 1600, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>{meta.icon}</span>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink)', margin: 0 }}>
              {meta.label} Standings
            </h2>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>{meta.season}</p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card" style={{ padding: '12px 16px', borderColor: 'var(--live-line)', background: 'var(--live-soft)', marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--live)' }}>Failed to load standings: {error}</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && <LoadingSkeleton divisions={FALLBACK_DIVISIONS[league] ?? []} />}

      {/* Data */}
      {!isLoading && !error && data && (
        <div style={GRID_STYLE}>
          {Object.entries(data.divisions ?? {}).map(([divName, teams]) => (
            <DivisionTable
              key={divName}
              name={divName}
              teams={teams}
              columns={data.columns ?? ['W', 'L', 'PCT']}
              liveTeams={liveTeams}
            />
          ))}
        </div>
      )}

      {/* Legend + footnote */}
      {!isLoading && !error && data && (
        <p className="eyebrow" style={{ textAlign: 'center', marginTop: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '4px 14px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--win)', display: 'inline-block' }} /> Playoff
          </span>
          <span style={{ color: 'var(--faint)' }}>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--faint)', display: 'inline-block' }} /> Eliminated
          </span>
          <span style={{ color: 'var(--faint)' }}>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span className="pulsedot" style={{ width: 5, height: 5 }} /> Playing now
          </span>
        </p>
      )}
    </div>
  )
}
