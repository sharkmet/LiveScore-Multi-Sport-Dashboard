import { useState } from 'react'

// ─── Mock playoff data ────────────────────────────────────────────────────────

const NHL_PLAYOFFS = {
  rounds: [
    {
      name: 'First Round',
      series: [
        // Eastern
        { id: 'e1', conf: 'East', topSeed: 'BOS', botSeed: 'FLA', topWins: 4, botWins: 1, status: 'complete', winner: 'BOS' },
        { id: 'e2', conf: 'East', topSeed: 'NYR', botSeed: 'NJD', topWins: 4, botWins: 2, status: 'complete', winner: 'NYR' },
        { id: 'e3', conf: 'East', topSeed: 'CAR', botSeed: 'NYI', topWins: 4, botWins: 3, status: 'complete', winner: 'CAR' },
        { id: 'e4', conf: 'East', topSeed: 'TOR', botSeed: 'TBL', topWins: 3, botWins: 2, status: 'live', winner: null },
        // Western
        { id: 'w1', conf: 'West', topSeed: 'VGK', botSeed: 'WPG', topWins: 4, botWins: 2, status: 'complete', winner: 'VGK' },
        { id: 'w2', conf: 'West', topSeed: 'COL', botSeed: 'SEA', topWins: 4, botWins: 1, status: 'complete', winner: 'COL' },
        { id: 'w3', conf: 'West', topSeed: 'EDM', botSeed: 'LAK', topWins: 4, botWins: 3, status: 'complete', winner: 'EDM' },
        { id: 'w4', conf: 'West', topSeed: 'DAL', botSeed: 'MIN', topWins: 4, botWins: 0, status: 'complete', winner: 'DAL' },
      ],
    },
    {
      name: 'Second Round',
      series: [
        { id: 'e5', conf: 'East', topSeed: 'BOS', botSeed: 'NYR', topWins: 2, botWins: 1, status: 'live', winner: null },
        { id: 'e6', conf: 'East', topSeed: 'CAR', botSeed: 'TOR', topWins: 0, botWins: 0, status: 'upcoming', winner: null },
        { id: 'w5', conf: 'West', topSeed: 'VGK', botSeed: 'EDM', topWins: 1, botWins: 2, status: 'live', winner: null },
        { id: 'w6', conf: 'West', topSeed: 'COL', botSeed: 'DAL', topWins: 0, botWins: 0, status: 'upcoming', winner: null },
      ],
    },
    {
      name: 'Conference Finals',
      series: [
        { id: 'ecf', conf: 'East', topSeed: 'TBD', botSeed: 'TBD', topWins: 0, botWins: 0, status: 'upcoming', winner: null },
        { id: 'wcf', conf: 'West', topSeed: 'TBD', botSeed: 'TBD', topWins: 0, botWins: 0, status: 'upcoming', winner: null },
      ],
    },
    {
      name: 'Stanley Cup Final',
      series: [
        { id: 'scf', conf: null, topSeed: 'TBD', botSeed: 'TBD', topWins: 0, botWins: 0, status: 'upcoming', winner: null },
      ],
    },
  ],
}

const MLB_PLAYOFFS = {
  rounds: [
    {
      name: 'Wild Card Series',
      series: [
        { id: 'alwc1', conf: 'AL', topSeed: 'HOU', botSeed: 'MIN', topWins: 2, botWins: 0, status: 'complete', winner: 'HOU' },
        { id: 'alwc2', conf: 'AL', topSeed: 'TEX', botSeed: 'TOR', topWins: 0, botWins: 2, status: 'complete', winner: 'TOR' },
        { id: 'alwc3', conf: 'AL', topSeed: 'BAL', botSeed: 'SEA', topWins: 2, botWins: 1, status: 'complete', winner: 'BAL' },
        { id: 'nlwc1', conf: 'NL', topSeed: 'LAD', botSeed: 'MIA', topWins: 2, botWins: 0, status: 'complete', winner: 'LAD' },
        { id: 'nlwc2', conf: 'NL', topSeed: 'ATL', botSeed: 'ARI', topWins: 1, botWins: 2, status: 'complete', winner: 'ARI' },
        { id: 'nlwc3', conf: 'NL', topSeed: 'MIL', botSeed: 'PHI', topWins: 0, botWins: 2, status: 'complete', winner: 'PHI' },
      ],
    },
    {
      name: 'Division Series',
      series: [
        { id: 'alds1', conf: 'AL', topSeed: 'BOS', botSeed: 'HOU', topWins: 2, botWins: 1, status: 'live', winner: null },
        { id: 'alds2', conf: 'AL', topSeed: 'TOR', botSeed: 'BAL', topWins: 1, botWins: 1, status: 'live', winner: null },
        { id: 'nlds1', conf: 'NL', topSeed: 'LAD', botSeed: 'ARI', topWins: 3, botWins: 2, status: 'live', winner: null },
        { id: 'nlds2', conf: 'NL', topSeed: 'ATL', botSeed: 'PHI', topWins: 0, botWins: 0, status: 'upcoming', winner: null },
      ],
    },
    {
      name: 'Championship Series',
      series: [
        { id: 'alcs', conf: 'AL', topSeed: 'TBD', botSeed: 'TBD', topWins: 0, botWins: 0, status: 'upcoming', winner: null },
        { id: 'nlcs', conf: 'NL', topSeed: 'TBD', botSeed: 'TBD', topWins: 0, botWins: 0, status: 'upcoming', winner: null },
      ],
    },
    {
      name: 'World Series',
      series: [
        { id: 'ws', conf: null, topSeed: 'TBD', botSeed: 'TBD', topWins: 0, botWins: 0, status: 'upcoming', winner: null },
      ],
    },
  ],
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SeriesCard({ series, bestOf = 7 }) {
  const halfway    = Math.ceil(bestOf / 2)
  const isComplete = series.status === 'complete'
  const isLive     = series.status === 'live'
  const isUpcoming = series.status === 'upcoming'

  function WinPips({ wins }) {
    return (
      <span className="flex gap-0.5">
        {Array.from({ length: halfway }, (_, i) => (
          <span
            key={i}
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              i < wins ? 'bg-white' : 'border border-slate-600'
            }`}
          />
        ))}
      </span>
    )
  }

  function TeamRow({ abbrev, wins, isWinner }) {
    return (
      <div className={`flex items-center justify-between gap-3 ${isComplete && !isWinner ? 'opacity-40' : ''}`}>
        <span className={`text-xs font-bold tabular-nums ${isWinner ? 'text-white' : 'text-slate-300'}`}>
          {abbrev === 'TBD' ? <span className="text-slate-600">TBD</span> : abbrev}
        </span>
        <div className="flex items-center gap-2">
          <WinPips wins={wins} />
          <span className={`w-3 text-right text-xs tabular-nums font-bold ${isWinner ? 'text-white' : 'text-slate-500'}`}>
            {abbrev === 'TBD' ? '' : wins}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`rounded-lg border px-3 py-2.5 ${
        isLive
          ? 'border-live-border bg-live-dim'
          : isComplete
            ? 'border-edge-subtle bg-pitch-950/60'
            : 'border-edge-subtle/40 bg-pitch-950/30'
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className={`text-[9px] font-bold uppercase tracking-widest ${
          isLive ? 'text-live' : isUpcoming ? 'text-slate-600' : 'text-slate-500'
        }`}>
          {isLive ? '● LIVE' : isUpcoming ? 'UPCOMING' : 'FINAL'}
        </span>
        {series.conf && (
          <span className="text-[9px] text-slate-600 uppercase">{series.conf}</span>
        )}
      </div>
      <div className="space-y-1.5">
        <TeamRow
          abbrev={series.topSeed}
          wins={series.topWins}
          isWinner={series.winner === series.topSeed}
        />
        <TeamRow
          abbrev={series.botSeed}
          wins={series.botWins}
          isWinner={series.winner === series.botSeed}
        />
      </div>
    </div>
  )
}

function RoundSection({ round, bestOf }) {
  const eastSeries = round.series.filter((s) => s.conf === 'East' || s.conf === 'AL')
  const westSeries = round.series.filter((s) => s.conf === 'West' || s.conf === 'NL')
  const finalSeries = round.series.filter((s) => s.conf === null)

  if (finalSeries.length > 0) {
    return (
      <div>
        <div className="mb-2 flex items-center gap-3">
          <span className="section-label text-amber-400/80">{round.name}</span>
          <div className="flex-1 border-t border-amber-900/40" />
        </div>
        <div className="mx-auto max-w-xs">
          {finalSeries.map((s) => (
            <SeriesCard key={s.id} series={s} bestOf={bestOf} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-2 flex items-center gap-3">
        <span className="section-label">{round.name}</span>
        <div className="flex-1 border-t border-edge-subtle/50" />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2">
            {eastSeries[0]?.conf === 'East' ? 'Eastern' : 'American League'}
          </p>
          {eastSeries.map((s) => (
            <SeriesCard key={s.id} series={s} bestOf={bestOf} />
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2">
            {westSeries[0]?.conf === 'West' ? 'Western' : 'National League'}
          </p>
          {westSeries.map((s) => (
            <SeriesCard key={s.id} series={s} bestOf={bestOf} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function Playoffs({ leagueFilter = 'all' }) {
  const [activeLeague, setActiveLeague] = useState(
    leagueFilter === 'nhl' ? 'nhl' : 'mlb'
  )

  const data  = activeLeague === 'nhl' ? NHL_PLAYOFFS : MLB_PLAYOFFS
  const bestOf = activeLeague === 'nhl' ? 7 : 7

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
      </div>

      {/* Rounds */}
      <div className="space-y-8">
        {data.rounds.map((round) => (
          <RoundSection key={round.name} round={round} bestOf={bestOf} />
        ))}
      </div>
    </div>
  )
}
