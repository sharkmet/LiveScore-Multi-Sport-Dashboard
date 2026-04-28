import { useState } from 'react'
import GameCard from './GameCard.jsx'

const DAYS = [
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'today',     label: 'Today'     },
  { id: 'tomorrow',  label: 'Tomorrow'  },
]

function DayTabs({ selected, onChange }) {
  return (
    <div className="tabs">
      {DAYS.map(day => (
        <button
          key={day.id}
          className={selected === day.id ? 'on' : ''}
          onClick={() => onChange(day.id)}
        >
          {day.label}
          {day.id === 'today' && selected === 'today' && (
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 999, background: 'var(--live)', marginLeft: 6, verticalAlign: 'middle' }} />
          )}
        </button>
      ))}
    </div>
  )
}

function SectionHeader({ label, count, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      {accent && <span className="pulsedot" style={{ width: 8, height: 8 }} />}
      <span className="eyebrow">{label}</span>
      <span className="eyebrow" style={{ opacity: 0.5 }}>{count}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
    </div>
  )
}

function Section({ label, games, onSelectGame, accent, flashMap }) {
  if (games.length === 0) return null
  return (
    <section>
      <SectionHeader label={label} count={games.length} accent={accent} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--gap)' }}>
        {games.map(game => (
          <GameCard
            key={game.gameId}
            game={game}
            onClick={onSelectGame}
            flashTeam={flashMap?.[game.gameId]}
          />
        ))}
      </div>
    </section>
  )
}

function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 'var(--pad)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <div className="skeleton" style={{ height: 11, width: 60 }} />
        <div className="skeleton" style={{ height: 11, width: 30 }} />
      </div>
      {[0, 1].map(i => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="skeleton" style={{ width: 8, height: 8, borderRadius: 999 }} />
            <div className="skeleton" style={{ height: 12, width: 90, opacity: 0.6 - i * 0.1 }} />
          </div>
          <div className="skeleton" style={{ height: 20, width: 28 }} />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ selectedDay, leagueFilter }) {
  const dayLabel  = selectedDay === 'today' ? 'today' : selectedDay
  const leagueLabel = leagueFilter && leagueFilter !== 'all' ? ` ${leagueFilter.toUpperCase()}` : ''
  const emoji = leagueFilter === 'nhl' ? '🏒' : leagueFilter === 'nba' ? '🏀' : leagueFilter === 'nfl' ? '🏈' : '⚾'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', textAlign: 'center' }}>
      <div style={{ fontSize: 48, opacity: 0.25, marginBottom: 16 }}>{emoji}</div>
      <p style={{ color: 'var(--muted)', fontSize: 14 }}>No{leagueLabel} games {dayLabel}</p>
      <p style={{ color: 'var(--faint)', fontSize: 12, marginTop: 4 }}>Check back later</p>
    </div>
  )
}

export default function Scoreboard({ gamesByDay = {}, leagueFilter = 'all', onSelectGame, isLoading = false, flashMap = {} }) {
  const [selectedDay, setSelectedDay] = useState('today')

  const allDayGames = gamesByDay[selectedDay] ?? []
  const games = leagueFilter === 'all'
    ? allDayGames
    : allDayGames.filter(g => g.league === leagueFilter)

  const liveGames     = games.filter(g => g.status === 'live' || g.status === 'warmup')
  const delayedGames  = games.filter(g => g.status === 'delayed')
  const upcomingGames = games.filter(g => g.status === 'scheduled')
  const finalGames    = games.filter(g => g.status === 'final')

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink)', margin: 0 }}>
            {selectedDay === 'today' ? "Today's Games" : selectedDay === 'yesterday' ? "Yesterday's Games" : "Tomorrow's Games"}
          </h2>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
            Live updates · All sports
          </div>
        </div>
        <DayTabs selected={selectedDay} onChange={setSelectedDay} />
      </div>

      {isLoading && selectedDay === 'today' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--gap)' }}>
          {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : games.length === 0 ? (
        <EmptyState selectedDay={selectedDay} leagueFilter={leagueFilter} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <Section label="Live Now"  games={liveGames}     onSelectGame={onSelectGame} accent flashMap={flashMap} />
          <Section label="Delayed"   games={delayedGames}  onSelectGame={onSelectGame} flashMap={flashMap} />
          <Section label="Upcoming"  games={upcomingGames} onSelectGame={onSelectGame} flashMap={flashMap} />
          <Section label="Final"     games={finalGames}    onSelectGame={onSelectGame} flashMap={flashMap} />
        </div>
      )}
    </div>
  )
}
