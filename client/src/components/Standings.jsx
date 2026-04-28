import { useState } from 'react'
import { MLB_STANDINGS, NHL_STANDINGS } from '../mocks/standings.js'

// ─── MLB helpers ─────────────────────────────────────────────────────────────

function MlbDivisionTable({ division }) {
  return (
    <div className="rounded-xl border border-edge-subtle bg-surface shadow-card overflow-hidden">
      <div className="px-4 py-2.5 border-b border-edge-subtle/50">
        <span className="section-label">{division.name}</span>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-edge-subtle/30">
            <th className="py-2 pl-4 text-left font-medium text-slate-500 w-8">#</th>
            <th className="py-2 pl-1 text-left font-medium text-slate-500">Team</th>
            <th className="py-2 px-4 text-right font-medium text-slate-500 w-10">W</th>
            <th className="py-2 px-4 text-right font-medium text-slate-500 w-10">L</th>
            <th className="py-2 px-4 text-right font-medium text-slate-500 w-14">PCT</th>
            <th className="py-2 px-4 text-right font-medium text-slate-500 w-10">GB</th>
            <th className="py-2 px-4 text-right font-medium text-slate-500 w-16">L10</th>
            <th className="py-2 pl-4 pr-5 text-right font-medium text-slate-500 w-16">STRK</th>
          </tr>
        </thead>
        <tbody>
          {division.teams.map((team, i) => {
            const isPlayoff   = i < 3 || team.wcRank !== null
            const isDivLeader = i === 0
            const isWc        = team.wcRank !== null
            return (
              <tr
                key={team.abbreviation}
                className={`border-b border-edge-subtle/20 last:border-0 transition-colors hover:bg-slate-800/30 ${
                  isDivLeader ? 'bg-slate-800/20' : ''
                }`}
              >
                <td className="py-2.5 pl-4 tabular-nums text-slate-600">{i + 1}</td>
                <td className="py-2.5 pl-1 pr-3">
                  <div className="flex items-center gap-2">
                    {isPlayoff && (
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${isDivLeader ? 'bg-live' : isWc ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                    )}
                    {!isPlayoff && <span className="h-1.5 w-1.5 shrink-0" />}
                    <span className="font-bold text-slate-200">{team.abbreviation}</span>
                    <span className="hidden text-slate-500 sm:inline">{team.name}</span>
                  </div>
                </td>
                <td className="py-2.5 px-4 text-right tabular-nums text-slate-300">{team.w}</td>
                <td className="py-2.5 px-4 text-right tabular-nums text-slate-400">{team.l}</td>
                <td className="py-2.5 px-4 text-right tabular-nums font-mono text-slate-300">{team.pct}</td>
                <td className="py-2.5 px-4 text-right tabular-nums text-slate-500">{team.gb}</td>
                <td className="py-2.5 px-4 text-right tabular-nums text-slate-400">{team.last10}</td>
                <td className={`py-2.5 pl-4 pr-5 text-right font-mono font-bold ${
                  team.streak.startsWith('W') ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {team.streak}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── NHL helpers ──────────────────────────────────────────────────────────────

function NhlDivisionTable({ division }) {
  return (
    <div className="rounded-xl border border-edge-subtle bg-surface shadow-card overflow-hidden">
      <div className="px-4 py-2.5 border-b border-edge-subtle/50">
        <span className="section-label">{division.name}</span>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-edge-subtle/30">
            <th className="py-2 pl-4 text-left font-medium text-slate-500 w-8">#</th>
            <th className="py-2 pl-1 text-left font-medium text-slate-500">Team</th>
            <th className="py-2 px-4 text-right font-medium text-slate-500 w-10">W</th>
            <th className="py-2 px-4 text-right font-medium text-slate-500 w-10">L</th>
            <th className="py-2 px-4 text-right font-medium text-slate-500 w-12">OTL</th>
            <th className="py-2 px-4 text-right font-medium text-slate-500 w-12">PTS</th>
            <th className="py-2 px-4 text-right font-medium text-slate-500 w-12">GF</th>
            <th className="py-2 px-4 text-right font-medium text-slate-500 w-12">GA</th>
            <th className="py-2 px-4 text-right font-medium text-slate-500 w-16">L10</th>
            <th className="py-2 pl-4 pr-5 text-right font-medium text-slate-500 w-16">STRK</th>
          </tr>
        </thead>
        <tbody>
          {division.teams.map((team, i) => {
            const isPlayoff   = i < 3
            const isDivLeader = i === 0
            return (
              <tr
                key={team.abbreviation}
                className={`border-b border-edge-subtle/20 last:border-0 transition-colors hover:bg-slate-800/30 ${
                  isDivLeader ? 'bg-slate-800/20' : ''
                }`}
              >
                <td className="py-2.5 pl-4 tabular-nums text-slate-600">{i + 1}</td>
                <td className="py-2.5 pl-1 pr-3">
                  <div className="flex items-center gap-2">
                    {isPlayoff && (
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${isDivLeader ? 'bg-live' : 'bg-emerald-500'}`} />
                    )}
                    {!isPlayoff && <span className="h-1.5 w-1.5 shrink-0" />}
                    <span className="font-bold text-slate-200">{team.abbreviation}</span>
                    <span className="hidden text-slate-500 sm:inline">{team.name}</span>
                  </div>
                </td>
                <td className="py-2.5 px-4 text-right tabular-nums text-slate-300">{team.w}</td>
                <td className="py-2.5 px-4 text-right tabular-nums text-slate-400">{team.l}</td>
                <td className="py-2.5 px-4 text-right tabular-nums text-slate-500">{team.otl}</td>
                <td className="py-2.5 px-4 text-right tabular-nums font-bold text-white">{team.pts}</td>
                <td className="py-2.5 px-4 text-right tabular-nums text-slate-400">{team.gf}</td>
                <td className="py-2.5 px-4 text-right tabular-nums text-slate-500">{team.ga}</td>
                <td className="py-2.5 px-4 text-right tabular-nums text-slate-400">{team.last10}</td>
                <td className={`py-2.5 pl-4 pr-5 text-right font-mono font-bold ${
                  team.streak.startsWith('W') ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {team.streak}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function Legend({ league }) {
  if (league === 'mlb') {
    return (
      <div className="flex items-center gap-4 text-[10px] text-slate-600">
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-live" /> Division leader</span>
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Playoff position</span>
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Wild card</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-4 text-[10px] text-slate-600">
      <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-live" /> Division leader</span>
      <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Playoff position</span>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function Standings({ leagueFilter = 'all' }) {
  const [activeLeague, setActiveLeague] = useState(
    leagueFilter === 'nhl' ? 'nhl' : 'mlb'
  )

  const data    = activeLeague === 'nhl' ? NHL_STANDINGS : MLB_STANDINGS
  const DivComp = activeLeague === 'nhl' ? NhlDivisionTable : MlbDivisionTable

  return (
    <div className="animate-fade-in pb-8">
      {/* League picker */}
      <div className="mb-6 flex items-center gap-0.5">
        {['mlb', 'nhl'].map((lg) => (
          <button
            key={lg}
            onClick={() => setActiveLeague(lg)}
            className={`
              relative px-5 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors rounded-full
              ${activeLeague === lg
                ? 'bg-slate-800 text-white'
                : 'text-slate-500 hover:text-slate-300'
              }
            `}
          >
            {lg.toUpperCase()}
          </button>
        ))}
        <div className="ml-auto">
          <Legend league={activeLeague} />
        </div>
      </div>

      {/* Conference / division grids */}
      {data.map((conf) => (
        <div key={conf.conference} className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <span className="section-label text-slate-300">{conf.conference}</span>
            <div className="flex-1 border-t border-edge-subtle/50" />
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {conf.divisions.map((div) => (
              <DivComp key={div.name} division={div} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
