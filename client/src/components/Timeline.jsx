import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { computeCumulativeRuns } from '../utils/formatters.js'

function buildChartData(timeline, homeTeam, awayTeam) {
  const homeRuns = computeCumulativeRuns(timeline, 'homeScore')
  const awayRuns = computeCumulativeRuns(timeline, 'awayScore')
  return homeRuns.map((h, i) => ({
    inning: h.inning,
    [homeTeam.abbreviation]: h.runs,
    [awayTeam.abbreviation]: awayRuns[i].runs,
  }))
}

export default function Timeline({ game }) {
  const { timeline, homeTeam, awayTeam } = game

  if (!timeline || timeline.length === 0) {
    return (
      <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--muted)' }}>
        Game hasn't started yet
      </div>
    )
  }

  const data = buildChartData(timeline, homeTeam, awayTeam)

  return (
    <div style={{ minHeight: 250 }}>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
          <XAxis
            dataKey="inning"
            tick={{ fill: '#9a958a', fontSize: 12 }}
            label={{ value: 'Inning', position: 'insideBottom', offset: -2, fill: '#bfb9ae', fontSize: 12 }}
          />
          <YAxis allowDecimals={false} tick={{ fill: '#9a958a', fontSize: 12 }} width={28} />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 8 }}
            labelStyle={{ color: 'var(--ink)' }}
            itemStyle={{ color: 'var(--ink-soft)' }}
            labelFormatter={(val) => `Inning ${val}`}
          />
          <Legend wrapperStyle={{ color: 'var(--muted)', fontSize: 12 }} />
          <Line type="monotone" dataKey={homeTeam.abbreviation} stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey={awayTeam.abbreviation} stroke="var(--live)" strokeWidth={2} dot={{ r: 4, fill: 'var(--live)' }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
