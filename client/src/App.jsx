import { useState, useEffect } from 'react'
import { useGameData } from './hooks/useGameData.js'
import Scoreboard from './components/Scoreboard.jsx'
import GameDetail from './components/GameDetail.jsx'
import AlertsPanel from './components/AlertsPanel.jsx'
import ToastContainer from './components/ToastContainer.jsx'
import StandingsView from './components/StandingsView.jsx'
import PlayoffsView from './components/PlayoffsView.jsx'

const LEAGUES = [
  { id: 'all', label: 'All' },
  { id: 'mlb', label: 'MLB' },
  { id: 'nhl', label: 'NHL' },
  { id: 'nba', label: 'NBA' },
  { id: 'nfl', label: 'NFL' },
]

const VIEWS = [
  { id: 'scores',    label: 'Scores'    },
  { id: 'standings', label: 'Standings' },
  { id: 'playoffs',  label: 'Playoffs'  },
]

function LiveScoreMark({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="LiveScore home"
      style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10 }}
    >
      <span style={{
        position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 30, height: 30, borderRadius: 8,
        background: 'linear-gradient(135deg, var(--ink) 0%, #2E2A23 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 2px rgba(31,29,26,0.15)',
      }}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--bg)" strokeWidth="1.8" strokeLinecap="round">
          <path d="M3 15 Q12 5 21 15" strokeOpacity="0.55" />
          <path d="M5 17 Q12 9 19 17" strokeOpacity="0.85" />
          <circle cx="12" cy="17" r="1.8" fill="var(--live)" stroke="none" />
        </svg>
        <span style={{
          position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: 999,
          background: 'var(--live)', boxShadow: '0 0 0 2px rgba(200,55,45,0.18)',
        }} />
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
          Live<span style={{ color: 'var(--live)' }}>·</span>Score
        </span>
        <span className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--muted-2)', marginTop: 3, textTransform: 'uppercase' }}>
          Dashboard
        </span>
      </span>
    </button>
  )
}

function TickerStrip({ games }) {
  const liveGames = games.filter(g => g.status === 'live' || g.status === 'warmup')
  if (liveGames.length === 0) return <div style={{ flex: 1 }} />

  // Repeat until we have enough items to always fill the strip, then double for seamless loop
  const minItems = 10
  const repeatCount = Math.max(1, Math.ceil(minItems / liveGames.length))
  const single = Array.from({ length: repeatCount }, () => liveGames).flat()
  const loop   = [...single, ...single]
  const duration = Math.max(18, single.length * 3.5)

  return (
    <div style={{
      flex: 1, minWidth: 0, overflow: 'hidden',
      maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
      WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
    }}>
      <div style={{ display: 'inline-flex', gap: 22, animation: `tickermove ${duration}s linear infinite`, whiteSpace: 'nowrap', paddingLeft: 8 }}>
        {loop.map((g, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11.5, color: 'var(--ink-soft)' }}>
            <span className="pulsedot" style={{ width: 5, height: 5 }} />
            <span style={{ fontWeight: 600, color: g.score.away > g.score.home ? 'var(--ink)' : 'var(--muted)' }}>
              {g.awayTeam.abbreviation}
            </span>
            <span className="mono tabular" style={{ fontWeight: 700, color: 'var(--ink)' }}>{g.score.away}</span>
            <span style={{ color: 'var(--faint)' }}>·</span>
            <span className="mono tabular" style={{ fontWeight: 700, color: 'var(--ink)' }}>{g.score.home}</span>
            <span style={{ fontWeight: 600, color: g.score.home > g.score.away ? 'var(--ink)' : 'var(--muted)' }}>
              {g.homeTeam.abbreviation}
            </span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--live)', fontWeight: 600, marginLeft: 2 }}>
              {g.period?.short || g.period?.label?.slice(0, 3) || 'Live'}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}

function LiveIndicator({ status }) {
  const isConnected = status === 'connected'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--muted)',
      background: 'var(--bg-elev)', padding: '5px 10px', borderRadius: 999, border: '1px solid var(--line)',
    }}>
      {isConnected ? (
        <>
          <span className="pulsedot" style={{ width: 6, height: 6 }} />
          <span style={{ fontWeight: 500 }}>Live</span>
        </>
      ) : (
        <>
          <span className="dot" style={{ background: 'var(--faint)' }} />
          <span>Offline</span>
        </>
      )}
    </div>
  )
}

function GameCountChips({ games }) {
  const liveCount     = games.filter(g => g.status === 'live' || g.status === 'warmup').length
  const delayedCount  = games.filter(g => g.status === 'delayed').length
  const upcomingCount = games.filter(g => g.status === 'scheduled').length

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--muted)' }}>
      {liveCount > 0 && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span className="dot" style={{ background: 'var(--live)' }} />
          {liveCount} live
        </span>
      )}
      {delayedCount > 0 && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span className="dot" style={{ background: 'var(--amber)' }} />
          {delayedCount} delayed
        </span>
      )}
      {upcomingCount > 0 && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span className="dot" style={{ background: 'var(--muted-2)' }} />
          {upcomingCount} upcoming
        </span>
      )}
    </div>
  )
}

function TopBar({ leagueFilter, onLeague, view, onView, wsStatus, onHome, allGames }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <header style={{
      background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg-sunken) 100%)',
      borderBottom: '1px solid var(--line)',
      position: 'sticky', top: 0, zIndex: 20,
    }}>
      {/* Row 1 — logo, date, ticker, ws indicator */}
      <div className="flex items-center gap-5" style={{ padding: '10px 24px 8px' }}>
        <LiveScoreMark onClick={onHome} />
        <div style={{ width: 1, height: 20, background: 'var(--line-2)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{today}</span>
          <span className="mono" style={{ fontSize: 9.5, letterSpacing: '0.1em', color: 'var(--muted-2)', textTransform: 'uppercase', marginTop: 2 }}>
            Sports Dashboard
          </span>
        </div>
        <TickerStrip games={allGames} />
        <LiveIndicator status={wsStatus} />
      </div>

      {/* Row 2 — league tabs + game count chips */}
      <div className="flex items-center gap-6" style={{ padding: '4px 24px 10px' }}>
        <div className="tabs">
          {LEAGUES.map(l => (
            <button
              key={l.id}
              className={leagueFilter === l.id ? 'on' : ''}
              onClick={() => onLeague(l.id)}
            >
              {l.label}
            </button>
          ))}
        </div>
        <GameCountChips games={allGames} />
      </div>

      {/* Row 3 — sub-nav (hide Standings/Playoffs on the All tab) */}
      <div className="flex items-center gap-6" style={{ padding: '0 24px' }}>
        {VIEWS.filter(v => leagueFilter !== 'all' || v.id === 'scores').map(v => (
          <button
            key={v.id}
            className={`navlink ${view === v.id ? 'on' : ''}`}
            onClick={() => onView(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>
    </header>
  )
}


export default function App() {
  const { gamesByDay, selectedGame, selectGame: _selectGame, clearSelection: _clearSelection, alerts, newAlerts, wsStatus, isLoading } = useGameData()

  function selectGame(id) {
    _selectGame(id)
    window.scrollTo(0, 0)
  }

  function clearSelection() {
    _clearSelection()
    window.scrollTo(0, 0)
  }
  const [leagueFilter, setLeagueFilter] = useState('all')
  const [view, setView]                 = useState('scores')
  function handleLeagueChange(id) {
    setLeagueFilter(id)
    setView('scores')
    clearSelection()
    window.scrollTo(0, 0)
  }

  function handleViewChange(v) {
    setView(v)
    clearSelection()
    window.scrollTo(0, 0)
  }

  function handleHome() {
    setView('scores')
    clearSelection()
    window.scrollTo(0, 0)
  }

  const allGames = [
    ...(gamesByDay?.today ?? []),
  ]

  const liveTeams = new Set(
    allGames
      .filter(g => (g.status === 'live' || g.status === 'warmup') && g.league === leagueFilter)
      .flatMap(g => [g.homeTeam?.abbreviation, g.awayTeam?.abbreviation])
      .filter(Boolean)
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-sunken)' }}>
      {!selectedGame && (
        <TopBar
          leagueFilter={leagueFilter}
          onLeague={handleLeagueChange}
          view={view}
          onView={handleViewChange}
          wsStatus={wsStatus}
          onHome={handleHome}
          allGames={allGames}
        />
      )}

      {selectedGame && (
        <header style={{
          background: 'var(--bg)',
          borderBottom: '1px solid var(--line)',
          position: 'sticky', top: 0, zIndex: 20,
          padding: '0 24px',
        }}>
          <div className="flex items-center gap-5" style={{ height: 52 }}>
            <LiveScoreMark onClick={handleHome} />
          </div>
        </header>
      )}

      <div style={{ display: 'flex' }}>
        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0, padding: '24px' }}>
          {selectedGame ? (
            <div className="fadein">
              <GameDetail game={selectedGame} onBack={clearSelection} />
            </div>
          ) : view === 'standings' ? (
            <div className="fadein">
              <StandingsView league={leagueFilter === 'all' ? 'mlb' : leagueFilter} liveTeams={liveTeams} />
            </div>
          ) : view === 'playoffs' ? (
            <div className="fadein">
              <PlayoffsView league={leagueFilter === 'all' ? 'mlb' : leagueFilter} />
            </div>
          ) : (
            <div className="fadein">
              <Scoreboard
                gamesByDay={gamesByDay}
                leagueFilter={leagueFilter}
                onSelectGame={selectGame}
                isLoading={isLoading}
              />
            </div>
          )}
        </main>

        {/* Alerts sidebar */}
        <AlertsPanel alerts={alerts} onSelectGame={selectGame} />
      </div>

      <ToastContainer alerts={newAlerts} />
    </div>
  )
}
