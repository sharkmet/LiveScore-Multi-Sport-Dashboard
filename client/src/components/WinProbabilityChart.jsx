import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ReferenceDot, ResponsiveContainer } from 'recharts'

const SOURCE_LABELS = {
  mlb:    'MLB Official',
  model:  'ML Model',
  simple: 'Estimate',
}

// ─── League config ────────────────────────────────────────────────────────────

function getLeagueConfig(league) {
  switch (league?.toLowerCase()) {
    case 'nba': return { totalPeriods: 4, secsPerPeriod: 720,  ticks: [0,.25,.5,.75,1], tickLabels: ['Q1','Q2','Q3','Q4','Final'] }
    case 'nfl': return { totalPeriods: 4, secsPerPeriod: 900,  ticks: [0,.25,.5,.75,1], tickLabels: ['Q1','Q2','Q3','Q4','Final'] }
    case 'nhl': return { totalPeriods: 3, secsPerPeriod: 1200, ticks: [0,1/3,2/3,1],   tickLabels: ['P1','P2','P3','Final'] }
    case 'mlb': return { totalPeriods: 9, secsPerPeriod: null, ticks: [0,1/3,2/3,1],   tickLabels: ['1st','4th','7th','Final'] }
    default:    return { totalPeriods: 4, secsPerPeriod: 900,  ticks: [0,.25,.5,.75,1], tickLabels: ['Q1','Q2','Q3','Q4','Final'] }
  }
}

// Convert a timeline point to 0-1 game progress.
// Period-end points (no clock in label) map to the end of that period.
// Live intra-period points parse remaining clock from periodLabel.
function computeGameProgress(pt, config) {
  const { totalPeriods, secsPerPeriod } = config
  const period = pt.period ?? 0
  if (period === 0) return 0

  if (!secsPerPeriod) {
    // MLB: period = inning, half derived from periodLabel ("Top 3rd" / "Bot 5th")
    const isBot = pt.periodLabel?.startsWith('Bot')
    return Math.min(1, ((period - 1) * 2 + (isBot ? 1 : 0)) / (totalPeriods * 2))
  }

  // Find a "MM:SS" clock remaining in the label (e.g. "Q3 5:24" or "2nd 14:32")
  const clockPart = (pt.periodLabel ?? '').split(' ').find(p => /^\d+:\d+$/.test(p))
  const elapsedBeforePeriod = (period - 1) * secsPerPeriod
  let elapsedInPeriod = secsPerPeriod // default: treat as end of period
  if (clockPart) {
    const [m, s] = clockPart.split(':').map(Number)
    elapsedInPeriod = secsPerPeriod - ((m || 0) * 60 + (s || 0))
  }

  return Math.min(1, Math.max(0, (elapsedBeforePeriod + elapsedInPeriod) / (totalPeriods * secsPerPeriod)))
}

function makeTickFormatter(config) {
  const { ticks, tickLabels } = config
  return (x) => {
    const idx = ticks.findIndex(t => Math.abs(t - x) < 0.001)
    return idx >= 0 ? (tickLabels[idx] ?? '') : ''
  }
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function WinProbTooltip({ active, payload, homeAbbr, awayAbbr }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  const homePct = Math.round(d.home * 100)
  const awayPct = 100 - homePct
  return (
    <div style={{ borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg-elev)', padding: '8px 12px', fontSize: 11, fontFamily: 'monospace', boxShadow: '0 4px 16px rgba(31,29,26,0.12)' }}>
      <div style={{ color: 'var(--muted)', marginBottom: 4 }}>
        {d.label ?? d.periodLabel ?? ''}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <span style={{ color: '#3b82f6' }}>{homeAbbr} {homePct}%</span>
        <span style={{ color: 'var(--muted)' }}>{awayAbbr} {awayPct}%</span>
      </div>
    </div>
  )
}

// ─── Pregame bar ──────────────────────────────────────────────────────────────

function PregameBar({ winProbability, homeTeam, awayTeam }) {
  const { home, away, source } = winProbability
  const homePct = Math.round(home * 100)
  const awayPct = 100 - homePct

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)', marginBottom: 6, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        <span>{awayTeam?.abbreviation} <span style={{ color: 'var(--ink-soft)' }}>{awayPct}%</span></span>
        <span style={{ fontSize: 9, color: 'var(--faint)' }}>{SOURCE_LABELS[source] ?? source}</span>
        <span>{homeTeam?.abbreviation} <span style={{ color: 'var(--ink-soft)' }}>{homePct}%</span></span>
      </div>
      <div style={{ height: 8, width: '100%', borderRadius: 999, background: 'var(--bg-sunken)', overflow: 'hidden', border: '1px solid var(--line)' }}>
        <div style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(to right, var(--muted), #6b7280)', width: `${awayPct}%`, transition: 'width 0.7s' }} />
      </div>
    </div>
  )
}

// ─── Area chart ───────────────────────────────────────────────────────────────

function ProbabilityAreaChart({ timeline, homeTeam, awayTeam, source, league, status, pregameHome }) {
  const config = getLeagueConfig(league)

  // Attach gameProgress (0-1) to every point for the numeric X-axis.
  // Server-computed values are authoritative; fall back to client parsing only when absent.
  let data = timeline.map((pt) => ({
    ...pt,
    label: pt.periodLabel ?? `P${pt.period}`,
    gameProgress: (pt.gameProgress != null && Number.isFinite(pt.gameProgress))
      ? pt.gameProgress
      : computeGameProgress(pt, config),
  }))

  const isFinal = status === 'final'

  // For final games extend the last data point to gameProgress=1 so the line
  // always fills the full chart width instead of stopping mid-chart.
  if (isFinal && data.length > 0 && (data[data.length - 1].gameProgress ?? 0) < 0.99) {
    const last = data[data.length - 1]
    data = [...data, { ...last, gameProgress: 1, label: 'Final' }]
  }

  // Recharts needs at least 2 distinct data points to draw a line.
  if (data.length === 0) {
    const h = pregameHome ?? 0.5
    data = [
      { home: h, gameProgress: 0,             label: 'Pregame', period: 0 },
      { home: h, gameProgress: isFinal ? 1 : 0.01, label: isFinal ? 'Final' : 'Now', period: 0 },
    ]
  } else if (data.length === 1) {
    const gp = data[0].gameProgress ?? 0
    if (gp > 0.001) {
      data = [{ home: pregameHome ?? 0.5, gameProgress: 0, label: 'Pregame', period: 0 }, ...data]
    } else {
      data = [...data, { ...data[0], gameProgress: isFinal ? 1 : 0.01, label: isFinal ? 'Final' : 'Now' }]
    }
  }

  const last    = data.length > 0 ? data[data.length - 1] : null
  const homePct = last ? Math.round(last.home * 100) : 50
  const awayPct = 100 - homePct

  // Clip domain to next period boundary past current data so the chart fills
  // the visible area rather than showing a trailing line against empty space.
  // Final games always show the full [0, 1] domain.
  const lastProgress = last?.gameProgress ?? 0
  // isFinal already declared above
  // If lastProgress sits on (or within float precision of) a tick, we're at a period
  // boundary — intermission or period just ended. Clip domain there, not the next tick.
  const atTick = config.ticks.find(t => Math.abs(t - lastProgress) < 0.003)
  const domainEnd = isFinal
    ? 1
    : atTick ?? config.ticks.find(t => t > lastProgress + 0.001) ?? 1
  const visibleTicks = config.ticks.filter(t => t <= domainEnd + 0.001)
  const tickFormatter = makeTickFormatter(config)

  // Position end-tag label above or below the dot to avoid clipping
  const endLabelPos = last
    ? (last.home > 0.72 ? 'bottom' : last.home < 0.28 ? 'top' : 'top')
    : 'top'

  return (
    <div>
      {/* Current probability readout */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, fontFamily: 'monospace' }}>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <span style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{awayTeam?.abbreviation}</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: awayPct > homePct ? 'var(--ink)' : 'var(--muted)' }}>{awayPct}%</span>
          </span>
          <span style={{ fontSize: 14, color: 'var(--faint)', fontWeight: 300 }}>·</span>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <span style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{homeTeam?.abbreviation}</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: homePct >= awayPct ? 'var(--ink)' : 'var(--muted)' }}>{homePct}%</span>
          </span>
        </div>
        {source && (
          <span style={{ fontSize: 9, color: 'var(--faint)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {SOURCE_LABELS[source] ?? source}
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={data} margin={{ top: 8, right: 28, bottom: 0, left: -28 }}>
          <defs>
            <linearGradient id="probGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#1e40af" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#1e40af" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
          <ReferenceLine y={0.5} stroke="var(--line-2)" strokeDasharray="5 3" />

          {/* Numeric X-axis: clipped to current game progress so no trailing empty space */}
          <XAxis
            type="number"
            dataKey="gameProgress"
            domain={[0, domainEnd]}
            ticks={visibleTicks}
            tickFormatter={tickFormatter}
            tick={{ fill: '#9a958a', fontSize: 9, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
          />

          {/* Y-axis: always 0 / 25 / 50 / 75 / 100 */}
          <YAxis
            domain={[0, 1]}
            ticks={[0, 0.25, 0.5, 0.75, 1]}
            tickFormatter={(v) => `${Math.round(v * 100)}`}
            tick={{ fill: '#9a958a', fontSize: 9, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            content={<WinProbTooltip homeAbbr={homeTeam?.abbreviation} awayAbbr={awayTeam?.abbreviation} />}
            cursor={{ stroke: 'var(--line-2)', strokeWidth: 1 }}
          />

          <Area
            type="monotone"
            dataKey="home"
            stroke="#1e40af"
            strokeWidth={2}
            fill="url(#probGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#1e40af', strokeWidth: 0 }}
          />

          {/* End tag: dot + percentage label at the current moment */}
          {last && (
            <ReferenceDot
              x={last.gameProgress}
              y={last.home}
              r={4}
              fill="#1e40af"
              stroke="var(--bg)"
              strokeWidth={2}
              label={{
                value: `${homePct}%`,
                position: endLabelPos,
                fill: '#1e40af',
                fontSize: 9,
                fontFamily: 'monospace',
                fontWeight: 700,
              }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function WinProbabilityChart({ game, homeTeam, awayTeam }) {
  const { status, winProbability, winProbabilityTimeline } = game

  if (status === 'scheduled') {
    if (!winProbability) return null
    return (
      <div className="card" style={{ padding: 16 }}>
        <div style={{ marginBottom: 12 }}><span className="eyebrow">Win Probability</span></div>
        <PregameBar winProbability={winProbability} homeTeam={homeTeam} awayTeam={awayTeam} />
      </div>
    )
  }

  const timeline = winProbabilityTimeline?.length > 0
    ? winProbabilityTimeline
    : winProbability
    ? [
        { home: winProbability.home, period: 0, periodLabel: 'Start' },
        { home: winProbability.home, period: 1, periodLabel: 'Now' },
      ]
    : null

  if (!timeline) return null

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ marginBottom: 12 }}><span className="eyebrow">Win Probability</span></div>
      <ProbabilityAreaChart
        timeline={timeline}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        source={winProbability?.source}
        league={game.league}
        status={game.status}
        pregameHome={winProbability?.home}
      />
    </div>
  )
}
