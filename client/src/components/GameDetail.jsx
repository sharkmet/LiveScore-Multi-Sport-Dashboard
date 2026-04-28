import { useState } from 'react'
import { useLiveClock } from '../hooks/useLiveClock.js'

const TEAM_COLORS = {
  // MLB
  NYY: '#003087', TOR: '#134A8E', BAL: '#DF4601', BOS: '#BD3039',
  NYM: '#002D72', PHI: '#E81828', ATL: '#13274F', WSH: '#AB0003',
  MIA: '#00A3E0', SF:  '#FD5A1E', LAD: '#005A9C', SD:  '#2F241D',
  COL: '#33006F', ARI: '#A71930', STL: '#C41E3A', CHC: '#0E3386',
  MIL: '#12284B', CIN: '#C6011F', PIT: '#27251F', HOU: '#EB6E1F',
  SEA: '#0C2C56', OAK: '#003831', TEX: '#003278', LAA: '#BA0021',
  MIN: '#002B5C', CLE: '#00385D', DET: '#0C2340', KC:  '#004687',
  CWS: '#27251F', TB:  '#092C5C',
  // NHL (non-overlapping abbreviations only)
  TBL: '#002868', NYR: '#0038A8', CAR: '#CC0000', FLA: '#041E42',
  BUF: '#00338D', MTL: '#AF1E2D', OTT: '#C52032', CGY: '#C8102E',
  EDM: '#FF4C00', VAN: '#00205B', ANA: '#FC4C02', LAK: '#111111',
  SJS: '#006D75', NSH: '#FFB81C', WPG: '#041E42', DAL: '#006847',
  VGK: '#B4975A', CBJ: '#002654', NJD: '#CE1126', NYI: '#003087',
  // NBA
  GSW: '#006BB6', LAL: '#552583', PHX: '#1D1160', BKN: '#000000',
  OKC: '#007AC1', UTA: '#002B5C', DEN: '#0E2240', POR: '#E03A3E',
  SAC: '#5A2D81', MEM: '#5D76A9', NOP: '#0C2340', SAS: '#C4CED4',
}

function resolveColor(team) {
  return TEAM_COLORS[team?.abbreviation] || team?.color || null
}
import HockeyGameDetail from './hockey/HockeyGameDetail.jsx'
import BasketballGameDetail from './basketball/BasketballGameDetail.jsx'
import NFLGameDetail from './nfl/NFLGameDetail.jsx'
import LinescoreTable from './LinescoreTable.jsx'
import MatchupPanel from './MatchupPanel.jsx'
import LineupCard from './LineupCard.jsx'
import BoxScoreTable from './BoxScoreTable.jsx'
import WinProbabilityChart from './WinProbabilityChart.jsx'
import { formatInning, formatStartTime } from '../utils/formatters.js'

// ── Shared primitives ──────────────────────────────────────────────────────

function StatusBadge({ game }) {
  if (game.status === 'live') {
    return (
      <div className="chip" style={{ background: 'var(--live-soft)', color: 'var(--live)', borderColor: 'var(--live-line)', gap: 7 }}>
        <span className="pulsedot" style={{ width: 7, height: 7 }} />
        <span style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {formatInning(game.period)}
        </span>
      </div>
    )
  }
  if (game.status === 'delayed') {
    return (
      <div className="chip" style={{ background: 'var(--amber-soft)', color: 'var(--amber)', borderColor: '#E3CC9B' }}>
        <span style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          ⏸ Delayed · {formatInning(game.period)}
        </span>
      </div>
    )
  }
  if (game.status === 'final') {
    return (
      <span className="chip">
        <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Final</span>
      </span>
    )
  }
  return (
    <span className="chip">
      <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{formatStartTime(game.startTime)}</span>
    </span>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getGameClock(game) {
  if (game.league === 'nhl') return game.matchup?.period?.timeRemaining ?? null
  return game.period?.timeRemaining ?? null
}

function isClockPaused(game) {
  if (game.league === 'nhl') return !!(game.matchup?.period?.inIntermission)
  if (game.league === 'nba') return !!(game.period?.inHalftime)
  return false
}

// ── MatchupHero ────────────────────────────────────────────────────────────
// Three-column layout: [away logo + name + score] | [status] | [score + name + home logo]

function TeamLogoBlock({ team, size = 56 }) {
  const tc    = resolveColor(team)
  const bg    = tc ? tc + '20' : 'var(--bg-sunken)'
  const color = tc || 'var(--ink)'
  return (
    <div style={{
      width: size, height: size, borderRadius: 12,
      background: bg, border: '1px solid var(--line)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 18, fontWeight: 700, color, flexShrink: 0,
    }}>
      {team.abbreviation}
    </div>
  )
}

function MatchupHero({ game, onBack }) {
  const { homeTeam, awayTeam, score, status } = game
  const isLive      = status === 'live' || status === 'warmup'
  const isScheduled = status === 'scheduled'
  const isFinal     = status === 'final'
  const homeWins    = isFinal && score.home > score.away
  const awayWins    = isFinal && score.away > score.home
  const hasLiveClock = isLive && (game.league === 'nhl' || game.league === 'nba')
  const liveClock    = useLiveClock(getGameClock(game), hasLiveClock && !isClockPaused(game))

  return (
    <div className={`card${isLive ? ' live' : ''}`} style={{ padding: 24, marginBottom: 16 }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button
          onClick={onBack}
          className="chip"
          style={{ cursor: 'pointer', background: 'var(--bg-elev)', gap: 6 }}
        >
          <span style={{ fontSize: 13 }}>‹</span> Back to scores
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <StatusBadge game={game} />
          <span className="eyebrow">{(game.league || '').toUpperCase()}</span>
        </div>
      </div>

      {/* Score row: Away | period | Home */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 24 }}>
        {/* Away */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: homeWins ? 0.55 : 1 }}>
          <TeamLogoBlock team={awayTeam} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.015em', color: 'var(--ink)', lineHeight: 1.2 }}>
              {awayTeam.name || awayTeam.abbreviation}
            </div>
            {awayTeam.record && (
              <div className="mono" style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>{awayTeam.record}</div>
            )}
          </div>
          <span className="tabular" style={{
            fontSize: 52, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1,
            color: awayWins ? 'var(--ink)' : isScheduled ? 'var(--faint)' : 'var(--ink-soft)',
          }}>
            {isScheduled ? '—' : score.away}
          </span>
        </div>

        {/* Center period + live clock */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span className="eyebrow" style={{ color: 'var(--faint)', fontSize: 11 }}>
            {game.period?.short || game.period?.label || 'at'}
          </span>
          {hasLiveClock && liveClock && (
            <span
              className="mono tabular"
              style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--live)', lineHeight: 1 }}
            >
              {isClockPaused(game) ? 'INT' : liveClock}
            </span>
          )}
        </div>

        {/* Home */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexDirection: 'row-reverse', opacity: awayWins ? 0.55 : 1 }}>
          <TeamLogoBlock team={homeTeam} />
          <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.015em', color: 'var(--ink)', lineHeight: 1.2 }}>
              {homeTeam.name || homeTeam.abbreviation}
            </div>
            {homeTeam.record && (
              <div className="mono" style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>{homeTeam.record}</div>
            )}
          </div>
          <span className="tabular" style={{
            fontSize: 52, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1,
            color: homeWins ? 'var(--ink)' : isScheduled ? 'var(--faint)' : 'var(--ink-soft)',
          }}>
            {isScheduled ? '—' : score.home}
          </span>
        </div>
      </div>

      {/* Metadata row */}
      {(game.situation || game.venue || game.startTime || game.broadcast) && (
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line)', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {game.situation && (
            <div>
              <div className="eyebrow" style={{ marginBottom: 3 }}>Situation</div>
              <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{game.situation}</div>
            </div>
          )}
          {game.venue && (
            <div>
              <div className="eyebrow" style={{ marginBottom: 3 }}>Venue</div>
              <div style={{ fontSize: 13, color: 'var(--ink)' }}>{game.venue}</div>
            </div>
          )}
          {game.startTime && (
            <div>
              <div className="eyebrow" style={{ marginBottom: 3 }}>{game.league === 'mlb' ? 'First Pitch' : 'Game Time'}</div>
              <div className="mono" style={{ fontSize: 13, color: 'var(--ink)' }}>{formatStartTime(game.startTime)}</div>
            </div>
          )}
          {game.broadcast && (
            <div>
              <div className="eyebrow" style={{ marginBottom: 3 }}>Broadcast</div>
              <div style={{ fontSize: 13, color: 'var(--ink)' }}>{game.broadcast}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── LiveSituationPanel ─────────────────────────────────────────────────────

function BaseDiamondLg({ bases = {}, outs = 0, balls = 0, strikes = 0 }) {
  const on  = (b) => bases[b] ? 'var(--live)' : 'transparent'
  const str = (b) => bases[b] ? 'var(--live)' : 'var(--line-2)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg viewBox="0 0 60 60" width="72" height="72" style={{ display: 'block' }}>
        <rect x="23" y="5"  width="14" height="14" transform="rotate(45 30 12)" fill={on('second')} stroke={str('second')} strokeWidth="1.6" />
        <rect x="5"  y="23" width="14" height="14" transform="rotate(45 12 30)" fill={on('third')}  stroke={str('third')}  strokeWidth="1.6" />
        <rect x="41" y="23" width="14" height="14" transform="rotate(45 48 30)" fill={on('first')}  stroke={str('first')}  strokeWidth="1.6" />
        <rect x="23" y="41" width="14" height="14" transform="rotate(45 30 48)" fill="var(--bg-elev)" stroke="var(--line-2)" strokeWidth="1.6" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="eyebrow" style={{ width: 48 }}>Count</span>
          <span className="tabular mono" style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{balls}–{strikes}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="eyebrow" style={{ width: 48 }}>Outs</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                width: 9, height: 9, borderRadius: 999,
                background: i < outs ? 'var(--ink)' : 'transparent',
                border: i < outs ? '0' : '1px solid var(--line-2)',
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ClockDisplay({ clock, paused }) {
  if (!clock) return null
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 4 }}>Clock</div>
      <div className="mono tabular" style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1, color: paused ? 'var(--muted)' : 'var(--live)' }}>
        {paused ? 'INT' : clock}
      </div>
    </div>
  )
}

function FootballDriveLg({ down, distance, yardLine, redZone, possessionTeam, clock }) {
  const ord = n => n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        {clock && (
          <>
            <span className="mono tabular" style={{ fontSize: 22, fontWeight: 700, color: 'var(--live)', letterSpacing: '-0.02em' }}>{clock}</span>
            <span style={{ color: 'var(--line-2)', fontSize: 16 }}>|</span>
          </>
        )}
        <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: redZone ? 'var(--live)' : 'var(--ink)' }}>
          {down}{ord(down)} &amp; {distance}
        </span>
        <span style={{ color: 'var(--faint)' }}>·</span>
        <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>Ball at {yardLine}</span>
        <span style={{ color: 'var(--faint)' }}>·</span>
        <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{possessionTeam} possession</span>
        {redZone && (
          <span className="chip" style={{ height: 20, padding: '0 8px', fontSize: 10, fontWeight: 700, background: 'var(--live-soft)', color: 'var(--live)', borderColor: 'var(--live-line)', marginLeft: 'auto' }}>
            RED ZONE
          </span>
        )}
      </div>
      <div style={{
        position: 'relative', height: 18,
        background: 'repeating-linear-gradient(90deg, var(--bg-sunken) 0 9.99%, var(--line) 10% 10.01%)',
        border: '1px solid var(--line)', borderRadius: 4,
      }}>
        <span style={{ position: 'absolute', top: -14, left: `${yardLine}%`, transform: 'translateX(-50%)', fontSize: 12, color: redZone ? 'var(--live)' : 'var(--ink)' }}>▾</span>
        <span style={{ position: 'absolute', top: 0, bottom: 0, left: `${yardLine}%`, width: 2, background: redZone ? 'var(--live)' : 'var(--ink)' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: 'var(--faint)' }} className="mono">
        <span>Own</span><span>25</span><span>50</span><span>25</span><span>Opp</span>
      </div>
    </div>
  )
}

function HockeyStripLg({ shots, powerPlay, clock, paused }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 28, width: '100%' }}>
      <ClockDisplay clock={clock} paused={paused} />
      {shots && (
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Shots on goal</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="tabular mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-soft)' }}>{shots?.away ?? 0}</span>
            <span style={{ color: 'var(--faint)' }}>–</span>
            <span className="tabular mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-soft)' }}>{shots?.home ?? 0}</span>
          </div>
        </div>
      )}
      {powerPlay && (
        <div style={{ marginLeft: 'auto' }}>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Power play</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="chip" style={{ height: 22, padding: '0 10px', fontWeight: 700, fontSize: 11, background: 'var(--live-soft)', color: 'var(--live)', borderColor: 'var(--live-line)' }}>
              {powerPlay.team} · PP
            </span>
            <span className="tabular mono" style={{ fontSize: 13, color: 'var(--live)', fontWeight: 700 }}>{powerPlay.time}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function shortPlayerName(name) {
  if (!name) return ''
  const parts = name.trim().split(' ')
  if (parts.length <= 1) return name
  return parts[0][0] + '. ' + parts.slice(1).join(' ')
}

function NbaLineupStrip({ possession, bonus, fouls, clock, paused, lineup, homeTeam, awayTeam }) {
  const hasLineup = lineup && (lineup.home.length > 0 || lineup.away.length > 0)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <ClockDisplay clock={clock} paused={paused} />
        {possession && (
          <div>
            <div className="eyebrow" style={{ marginBottom: 4 }}>Possession</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{possession}</div>
          </div>
        )}
        {fouls && (
          <div>
            <div className="eyebrow" style={{ marginBottom: 4 }}>Fouls</div>
            <div className="tabular mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-soft)' }}>
              {fouls.away ?? 0}–{fouls.home ?? 0}
            </div>
          </div>
        )}
        {bonus && (
          <div style={{ marginLeft: 'auto' }}>
            <span className="chip" style={{ height: 22, padding: '0 10px', fontWeight: 700, fontSize: 11, background: 'var(--amber-soft)', color: 'var(--amber)', borderColor: '#E3CC9B' }}>
              BONUS · {bonus}
            </span>
          </div>
        )}
      </div>

      {hasLineup && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { team: awayTeam, players: lineup.away },
            { team: homeTeam, players: lineup.home },
          ].map(({ team, players }) => (
            <div key={team?.abbreviation}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>{team?.abbreviation} on court</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {players.map((p) => (
                  <div
                    key={p.jerseyNum + p.name}
                    style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 8px', borderRadius: 6, background: 'var(--bg-sunken)' }}
                  >
                    <span className="mono tabular" style={{ fontSize: 9.5, color: 'var(--faint)', width: 20, textAlign: 'right', flexShrink: 0 }}>
                      #{p.jerseyNum}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {shortPlayerName(p.name)}
                    </span>
                    <span className="mono tabular" style={{ fontSize: 10, color: 'var(--muted)', flexShrink: 0 }}>
                      {p.statistics.points}pt
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function LiveSituationPanel({ game }) {
  const isLive = game.status === 'live' || game.status === 'warmup'
  const hasCountdown = isLive && (game.league === 'nhl' || game.league === 'nba')
  const paused    = isClockPaused(game)
  const liveClock = useLiveClock(getGameClock(game), hasCountdown && !paused)
  if (!isLive) return null

  let inner = null

  if (game.league === 'mlb' && game.matchup) {
    const runners = game.matchup.runners || {}
    const outs    = game.matchup.count?.outs ?? 0
    const balls   = game.matchup.count?.balls ?? 0
    const strikes = game.matchup.count?.strikes ?? 0
    inner = <BaseDiamondLg bases={runners} outs={outs} balls={balls} strikes={strikes} />
  } else if (game.league === 'nfl' && game.nflExtras) {
    const posTeam = game.possession === 'home' ? game.homeTeam.abbreviation : game.awayTeam.abbreviation
    inner = (
      <FootballDriveLg
        down={game.nflExtras.down}
        distance={game.nflExtras.distance}
        yardLine={game.nflExtras.yardLine}
        redZone={game.nflExtras.isRedZone}
        possessionTeam={posTeam}
        clock={game.nflExtras.clock}
      />
    )
  } else if (game.league === 'nhl' && game.matchup) {
    const penalty = game.matchup.penalties?.[0]
    const pp = penalty ? (() => {
      const penalized = penalty.team
      const ppTeam = penalized === game.homeTeam?.abbreviation
        ? game.awayTeam?.abbreviation
        : game.homeTeam?.abbreviation
      return { team: ppTeam, time: penalty.timeRemaining }
    })() : null
    inner = <HockeyStripLg shots={game.matchup.shotsOnGoal} powerPlay={pp} clock={liveClock} paused={paused} />
  } else if (game.league === 'nba' && game.matchup) {
    const possession = game.matchup.possession === 'home'
      ? game.homeTeam.abbreviation
      : game.matchup.possession === 'away' ? game.awayTeam.abbreviation : null
    const bonus = game.matchup.homeInBonus ? game.homeTeam.abbreviation
      : game.matchup.awayInBonus ? game.awayTeam.abbreviation : null
    const fouls = (game.matchup.foulsHome != null || game.matchup.foulsAway != null)
      ? { home: game.matchup.foulsHome ?? 0, away: game.matchup.foulsAway ?? 0 }
      : null
    const lineup = game.boxScore ? {
      home: (game.boxScore.home?.players ?? []).filter(p => p.oncourt),
      away: (game.boxScore.away?.players ?? []).filter(p => p.oncourt),
    } : null
    inner = (
      <NbaLineupStrip
        possession={possession}
        bonus={bonus}
        fouls={fouls}
        lineup={lineup}
        homeTeam={game.homeTeam}
        awayTeam={game.awayTeam}
        clock={liveClock}
        paused={paused}
      />
    )
  }

  if (!inner) return null

  return (
    <div className="card live" style={{ padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span className="pulsedot" style={{ width: 7, height: 7 }} />
        <span className="eyebrow">Live situation</span>
        {game.period?.label && (
          <span className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 6 }}>{game.period.label}</span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>{inner}</div>
    </div>
  )
}

// ── TeamStatsBar ────────────────────────────────────────────────────────────

function TeamStatsBar({ game }) {
  const { homeTeam, awayTeam, boxScore } = game
  const bs = boxScore || {}

  const avgFmt = v => {
    if (v == null) return '—'
    const n = typeof v === 'string' ? parseFloat(v) : v
    return isNaN(n) ? '—' : n.toFixed(3).slice(1)
  }

  const rows = [
    { k: 'Hits',    a: bs.away?.hits,       h: bs.home?.hits,       fmt: v => v ?? '—' },
    { k: 'Errors',  a: bs.away?.errors,     h: bs.home?.errors,     fmt: v => v ?? '—' },
    { k: 'LOB',     a: bs.away?.leftOnBase, h: bs.home?.leftOnBase, fmt: v => v ?? '—' },
    { k: 'AVG',     a: bs.away?.avg,        h: bs.home?.avg,        fmt: avgFmt },
    { k: 'Pitches', a: bs.away?.pitches,    h: bs.home?.pitches,    fmt: v => v ?? '—' },
  ]

  const awayColor = resolveColor(awayTeam) || 'var(--ink)'
  const homeColor = resolveColor(homeTeam) || 'var(--muted-2)'

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span className="eyebrow">Team comparison</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span className="dot" style={{ background: awayColor }} />{awayTeam.abbreviation}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span className="dot" style={{ background: homeColor }} />{homeTeam.abbreviation}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map(r => {
          const a = typeof r.a === 'number' ? r.a : 0
          const h = typeof r.h === 'number' ? r.h : 0
          const total = (a + h) || 1
          const aPct = (a / total) * 100
          return (
            <div key={r.k} style={{ display: 'grid', gridTemplateColumns: '48px 1fr 48px 60px 48px', alignItems: 'center', gap: 10 }}>
              <span className="tabular mono" style={{ fontSize: 12, fontWeight: 700, textAlign: 'right' }}>{r.fmt(r.a)}</span>
              <div style={{ height: 6, borderRadius: 999, overflow: 'hidden', background: 'var(--bg-sunken)', border: '1px solid var(--line)', display: 'flex' }}>
                <div style={{ width: `${aPct}%`, background: awayColor }} />
                <div style={{ flex: 1, background: homeColor, opacity: 0.75 }} />
              </div>
              <span className="tabular mono" style={{ fontSize: 12, fontWeight: 700, textAlign: 'left' }}>{r.fmt(r.h)}</span>
              <span className="eyebrow" style={{ textAlign: 'center' }}>{r.k}</span>
              <span />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── ScoringPlays ────────────────────────────────────────────────────────────

function ScoringPlays({ game }) {
  const plays = game.scoringPlays?.length > 0
    ? game.scoringPlays
    : (game.timeline || []).filter(e =>
        e.type === 'score' || e.runs != null || e.scoringPlay
      )
  if (plays.length === 0) return null

  const { homeTeam, awayTeam } = game

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--line)' }}>
        <span className="eyebrow">Scoring plays</span>
      </div>
      <ol style={{ margin: 0, padding: '6px 0', listStyle: 'none' }}>
        {plays.map((p, i) => {
          const isHome   = p.team === 'home' || p.teamId === homeTeam?.id
          const team     = isHome ? homeTeam : awayTeam
          const tc       = team?.color || 'var(--muted)'
          const inningLbl = p.inning || p.period?.short || ''
          return (
            <li
              key={i}
              className={`row-hover${p.fresh ? ' flash' : ''}`}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px',
                borderTop: i === 0 ? 'none' : '1px solid var(--line)',
              }}
            >
              {inningLbl && (
                <span className="mono" style={{ fontSize: 11, color: 'var(--muted)', width: 32, flexShrink: 0, paddingTop: 2 }}>
                  {inningLbl}
                </span>
              )}
              <span className="chip" style={{
                height: 20, padding: '0 8px', fontSize: 10.5, fontWeight: 600, flexShrink: 0,
                background: tc + '18', color: tc, borderColor: tc + '40',
              }}>
                {team?.abbreviation || '?'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.45 }}>
                  {p.title || p.description || p.text || ''}
                </div>
                {p.detail && (
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2, lineHeight: 1.35 }}>{p.detail}</div>
                )}
              </div>
              {(p.awayScore != null || p.homeScore != null) && (
                <span className="tabular mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', flexShrink: 0 }}>
                  {p.awayScore}–{p.homeScore}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

// ── MLB Overview ────────────────────────────────────────────────────────────

function MlbOverview({ game }) {
  const { status } = game
  const isLive      = status === 'live' || status === 'warmup'
  const isFinal     = status === 'final'
  const hasTimeline = game.timeline?.length > 0
  const hasBoxScore = !!(game.boxScore?.away || game.boxScore?.home)
  const hasWinProb  = !!(game.winProbabilityTimeline?.length || game.winProbability)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Linescore — full width, always visible */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--line)' }}>
          <span className="eyebrow">Linescore</span>
        </div>
        {hasTimeline ? (
          <LinescoreTable game={game} />
        ) : (
          <div style={{ padding: '24px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--faint)' }}>Game hasn't started yet</p>
          </div>
        )}
      </div>

      {/* Two-column: Win Probability + Team Stats */}
      {(hasWinProb || isLive || isFinal) && (
        hasWinProb ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16, alignItems: 'stretch' }}>
            <WinProbabilityChart game={game} homeTeam={game.homeTeam} awayTeam={game.awayTeam} />
            <TeamStatsBar game={game} />
          </div>
        ) : (
          <TeamStatsBar game={game} />
        )
      )}

      {/* Matchup panel (pitcher/batter for MLB live) */}
      {isLive && game.matchup && <MatchupPanel matchup={game.matchup} />}

      <LineupCard
        lineup={game.lineup}
        probablePitchers={game.probablePitchers}
        status={status}
        homeTeam={game.homeTeam}
        awayTeam={game.awayTeam}
      />

      {/* Scoring Plays */}
      <ScoringPlays game={game} />

      {/* Box Score */}
      {(isLive || isFinal) && hasBoxScore && (
        <div className="card" style={{ padding: 16 }}>
          <BoxScoreTable boxScore={game.boxScore} homeTeam={game.homeTeam} awayTeam={game.awayTeam} />
        </div>
      )}
    </div>
  )
}

// ── Root GameDetail ─────────────────────────────────────────────────────────

export default function GameDetail({ game, onBack }) {
  if (!game) return null

  return (
    <div className="fadein">
      <MatchupHero game={game} onBack={onBack} />
      <LiveSituationPanel game={game} />

      {game.league === 'nhl' && <HockeyGameDetail game={game} isEmbedded />}
      {game.league === 'nba' && <BasketballGameDetail game={game} isEmbedded />}
      {game.league === 'nfl' && <NFLGameDetail game={game} isEmbedded />}
      {game.league !== 'nhl' && game.league !== 'nba' && game.league !== 'nfl' && (
        <MlbOverview game={game} />
      )}
    </div>
  )
}
