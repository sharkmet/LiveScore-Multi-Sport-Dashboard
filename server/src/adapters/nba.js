/**
 * NBA adapter — cdn.nba.com CDN (no auth, no rate limit).
 *
 * Endpoints:
 *   Scoreboard: https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json
 *   Box score:  https://cdn.nba.com/static/json/liveData/boxscore/boxscore_{gameId}.json
 *   Play-by-play: https://cdn.nba.com/static/json/liveData/playbyplay/playbyplay_{gameId}.json
 */

import { NBA_MOCK_GAMES } from '../mocks/nba-mock-data.js'
import {
  mapNbaStatus,
  buildQuarterLabel,
  buildFinalLabel,
  parseGameClock,
  parseMinutesPlayed,
} from '../utils/nba-normalize.js'

export const league = 'nba'

const CDN_BASE = 'https://cdn.nba.com/static/json/liveData'
const USE_MOCK = process.env.USE_MOCK_DATA === 'true'

// Primary brand colors for all 30 NBA teams
const NBA_TEAM_COLORS = {
  ATL: '#E03A3E', BOS: '#007A33', BKN: '#000000', CHA: '#00788C',
  CHI: '#CE1141', CLE: '#860038', DAL: '#00538C', DEN: '#0E2240',
  DET: '#C8102E', GSW: '#1D428A', HOU: '#CE1141', IND: '#002D62',
  LAC: '#C8102E', LAL: '#552583', MEM: '#5D76A9', MIA: '#98002E',
  MIL: '#00471B', MIN: '#0C2340', NOP: '#0C2340', NYK: '#006BB6',
  OKC: '#007AC1', ORL: '#0077C0', PHI: '#006BB6', PHX: '#1D1160',
  POR: '#E03A3E', SAC: '#5A2D81', SAS: '#C4CED4', TOR: '#CE1141',
  UTA: '#002B5C', WAS: '#002B5C',
}

const NBA_HEADERS = {
  'Accept': 'application/json',
  'Origin': 'https://www.nba.com',
  'Referer': 'https://www.nba.com/',
  'User-Agent': 'Mozilla/5.0 (compatible; SportsStatsDashboard/1.0)',
}

// ── HTTP helpers ─────────────────────────────────────────────────────────────

async function cdnGet(path) {
  const url = `${CDN_BASE}/${path}`
  const res = await fetch(url, { headers: NBA_HEADERS })
  if (!res.ok) throw new Error(`NBA CDN ${url} → ${res.status}`)
  return res.json()
}

// ── Normalization helpers ─────────────────────────────────────────────────────

function normalizeTeam(team, score) {
  const abbr = team.teamTricode ?? ''
  return {
    id: team.teamId?.toString() ?? abbr.toLowerCase(),
    name: team.teamName ?? team.teamCity,
    city: team.teamCity ?? '',
    abbreviation: abbr,
    score: typeof score === 'number' ? score : parseInt(score ?? 0, 10),
    record: team.wins != null ? `${team.wins}-${team.losses}` : '',
    color: NBA_TEAM_COLORS[abbr] ?? null,
  }
}

function detectHalftime(period, clockStr, statusText) {
  return (
    period === 2 &&
    (clockStr === 'PT00M00.00S' || clockStr === '') &&
    typeof statusText === 'string' &&
    statusText.toLowerCase().includes('halftime')
  )
}

function detectQuarterBreak(period, clockStr, halftime) {
  // Clock at zero, not halftime, game still live between Q1/Q2 or Q3/Q4
  return (
    !halftime &&
    period >= 1 && period <= 3 &&
    (clockStr === 'PT00M00.00S' || clockStr === '')
  )
}

function buildPeriodLabel(period, clockStr, statusText, status) {
  if (status === 'final') return buildFinalLabel(period)
  if (detectHalftime(period, clockStr, statusText)) return 'Halftime'
  if (status === 'scheduled') return 'Scheduled'
  return buildQuarterLabel(period)
}

function normalizeLinescore(periods) {
  if (!Array.isArray(periods)) return []
  return periods.map((p) => ({
    period: p.period,
    periodLabel: buildQuarterLabel(p.period),
    homeScore: parseInt(p.score?.split(' - ')?.[0] ?? p.scoreHome ?? 0, 10),
    awayScore: parseInt(p.score?.split(' - ')?.[1] ?? p.scoreAway ?? 0, 10),
  }))
}

function normalizePlayer(p) {
  const s = p.statistics ?? {}
  return {
    name: p.name,
    jerseyNum: p.jerseyNum ?? p.jersey ?? '',
    position: p.position ?? '',
    oncourt: p.oncourt === '1' || p.oncourt === true,
    statistics: {
      points: parseInt(s.points ?? 0, 10),
      rebounds: parseInt(s.reboundsTotal ?? s.rebounds ?? 0, 10),
      assists: parseInt(s.assists ?? 0, 10),
      steals: parseInt(s.steals ?? 0, 10),
      blocks: parseInt(s.blocks ?? 0, 10),
      fieldGoalsMade: parseInt(s.fieldGoalsMade ?? 0, 10),
      fieldGoalsAttempted: parseInt(s.fieldGoalsAttempted ?? 0, 10),
      threePointersMade: parseInt(s.threePointersMade ?? 0, 10),
      threePointersAttempted: parseInt(s.threePointersAttempted ?? 0, 10),
      freeThrowsMade: parseInt(s.freeThrowsMade ?? 0, 10),
      freeThrowsAttempted: parseInt(s.freeThrowsAttempted ?? 0, 10),
      turnovers: parseInt(s.turnovers ?? 0, 10),
      foulsPersonal: parseInt(s.foulsPersonal ?? 0, 10),
      minutes: parseMinutesPlayed(s.minutesCalculated ?? s.minutes ?? null),
    },
  }
}

function normalizeTeamBoxStats(t) {
  const s = t.statistics ?? {}
  return {
    points: parseInt(s.points ?? 0, 10),
    rebounds: parseInt(s.reboundsTotal ?? s.rebounds ?? 0, 10),
    assists: parseInt(s.assists ?? 0, 10),
    steals: parseInt(s.steals ?? 0, 10),
    blocks: parseInt(s.blocks ?? 0, 10),
    fieldGoalsMade: parseInt(s.fieldGoalsMade ?? 0, 10),
    fieldGoalsAttempted: parseInt(s.fieldGoalsAttempted ?? 0, 10),
    threePointersMade: parseInt(s.threePointersMade ?? 0, 10),
    threePointersAttempted: parseInt(s.threePointersAttempted ?? 0, 10),
    freeThrowsMade: parseInt(s.freeThrowsMade ?? 0, 10),
    freeThrowsAttempted: parseInt(s.freeThrowsAttempted ?? 0, 10),
    turnovers: parseInt(s.turnovers ?? 0, 10),
    foulsPersonal: parseInt(s.foulsPersonal ?? 0, 10),
  }
}

function extractBoxScore(home, away) {
  if (!home || !away) return null
  return {
    home: {
      players: (home.players ?? []).map(normalizePlayer),
      teamStats: normalizeTeamBoxStats(home),
    },
    away: {
      players: (away.players ?? []).map(normalizePlayer),
      teamStats: normalizeTeamBoxStats(away),
    },
  }
}

function extractGameLeaders(game) {
  const hl = game.gameLeaders?.homeLeaders
  const al = game.gameLeaders?.awayLeaders
  if (!hl && !al) return null
  return {
    home: hl
      ? { name: hl.name, points: hl.points, rebounds: hl.rebounds, assists: hl.assists }
      : null,
    away: al
      ? { name: al.name, points: al.points, rebounds: al.rebounds, assists: al.assists }
      : null,
  }
}

function clockStringToSeconds(clockStr) {
  if (!clockStr) return 0
  const [min, sec] = clockStr.split(':').map(Number)
  return (min || 0) * 60 + (sec || 0)
}

function extractMatchup(game) {
  const period = game.period ?? 0
  const homeTeam = game.homeTeam ?? {}
  const awayTeam = game.awayTeam ?? {}
  return {
    period,
    timeoutsHome: homeTeam.timeoutsRemaining ?? 0,
    timeoutsAway: awayTeam.timeoutsRemaining ?? 0,
    foulsHome: homeTeam.foulsPersonal ?? 0,
    foulsAway: awayTeam.foulsPersonal ?? 0,
    homeInBonus: homeTeam.inBonus === '1' || homeTeam.inBonus === true,
    awayInBonus: awayTeam.inBonus === '1' || awayTeam.inBonus === true,
    possession: game.possession
      ? game.possession === homeTeam.teamId?.toString()
        ? 'home'
        : 'away'
      : null,
  }
}

// Inline Stern probit for historical quarter-end WP points.
// Uses HCA only (no team ratings) — consistent with live model math, just no team-specific tilt.
function nbaQuarterEndWP(lead, completedPeriod) {
  const secondsRemaining = Math.max(0, (4 - completedPeriod) * 720)
  if (secondsRemaining === 0) {
    if (lead > 0) return 0.999
    if (lead < 0) return 0.001
    return 0.5
  }
  const t = secondsRemaining / 2880
  const mu = lead + 2.7 * t
  const sigma = 13.5 * Math.sqrt(t)
  return Math.max(0.01, Math.min(0.99, normalCDFInline(mu / sigma)))
}

function normalCDFInline(z) {
  const sign = z < 0 ? -1 : 1
  const x = Math.abs(z) / Math.SQRT2
  const t = 1 / (1 + 0.3275911 * x)
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return 0.5 * (1 + sign * y)
}

function buildWinProbTimeline(linescore) {
  let homeTotal = 0, awayTotal = 0
  const timeline = [{ home: 0.5, period: 0, periodLabel: 'Start', gameProgress: 0 }]
  for (const period of linescore) {
    homeTotal += period.homeScore ?? 0
    awayTotal += period.awayScore ?? 0
    const completedPeriod = period.period ?? 1
    timeline.push({
      home: parseFloat(nbaQuarterEndWP(homeTotal - awayTotal, completedPeriod).toFixed(3)),
      period: completedPeriod,
      periodLabel: period.periodLabel ?? `Q${completedPeriod}`,
      gameProgress: Math.min(1, completedPeriod / 4),
    })
  }
  return timeline
}

function buildScoringPlays(actions) {
  if (!Array.isArray(actions)) return []
  return actions
    .filter((a) => a.shotResult === 'Made' || a.actionType === 'freethrow')
    .map((a) => ({
      period: a.period,
      clock: parseGameClock(a.clock),
      teamAbbrev: a.teamTricode ?? '',
      playerName: a.playerNameI ?? a.playerName ?? '',
      actionType: a.actionType === 'freethrow' ? 'free throw' : a.subType ?? a.actionType,
      description: a.description ?? '',
      scoreHome: parseInt(a.scoreHome ?? 0, 10),
      scoreAway: parseInt(a.scoreAway ?? 0, 10),
    }))
}

/**
 * Build a normalized GameEvent from box-score + play-by-play data.
 */
function buildGameEvent(game, boxData, pbpData) {
  const period = game.period ?? 0
  const clockStr = game.gameClock ?? ''
  const statusCode = game.gameStatus ?? 1
  const status = mapNbaStatus(statusCode)
  const statusText = game.gameStatusText ?? ''
  const halftime = detectHalftime(period, clockStr, statusText)

  const homeScore = parseInt(game.homeTeam?.score ?? 0, 10)
  const awayScore = parseInt(game.awayTeam?.score ?? 0, 10)

  const clock = parseGameClock(clockStr)
  const periodLabel = buildPeriodLabel(period, clockStr, statusText, status)

  // Quarter-by-quarter linescore from period data
  const homePeriods = game.homeTeam?.periods ?? []
  const awayPeriods = game.awayTeam?.periods ?? []
  const linescore = homePeriods.map((hp, i) => {
    const ap = awayPeriods[i] ?? {}
    return {
      period: hp.period,
      periodLabel: buildQuarterLabel(hp.period),
      homeScore: parseInt(hp.score ?? 0, 10),
      awayScore: parseInt(ap.score ?? 0, 10),
    }
  })

  // Box score
  const boxScore = boxData
    ? extractBoxScore(boxData.homeTeam, boxData.awayTeam)
    : null

  // Scoring plays from play-by-play
  const scoringPlays = pbpData
    ? buildScoringPlays(pbpData.actions ?? [])
    : []

  // Win probability timeline from quarter-by-quarter linescore
  const winProbabilityTimeline = linescore.length > 0
    ? buildWinProbTimeline(linescore)
    : []

  const quarterBreak = detectQuarterBreak(period, clockStr, halftime)
  const clockSeconds = status === 'live' && !halftime && !quarterBreak ? clockStringToSeconds(clock) : 0
  const matchupData = status === 'live' ? extractMatchup(game) : null
  const homePossession = game.possession
    ? (game.possession === game.homeTeam?.teamId?.toString() ? 1.0 : 0.0)
    : 0.5
  const isOvertime = period > 4

  return {
    gameId: `nba_${game.gameId}`,
    league: 'nba',
    status,
    startTime: game.gameTimeUTC ?? new Date().toISOString(),
    venue: game.arenaName ?? '',
    homeTeam: normalizeTeam(game.homeTeam, homeScore),
    awayTeam: normalizeTeam(game.awayTeam, awayScore),
    score: { home: homeScore, away: awayScore },
    period: {
      current: period,
      label: periodLabel,
      totalPeriods: period > 4 ? period : 4,
      timeRemaining: status === 'live'
        ? (halftime ? 'Halftime' : quarterBreak ? `Q${period} End` : clock)
        : null,
      clockSeconds,
      inHalftime: halftime,
    },
    homePossession,
    isOvertime,
    matchup: matchupData,
    linescore,
    winProbabilityTimeline,
    scoringPlays,
    gameLeaders: extractGameLeaders(game),
    boxScore,
    alerts: [],
    lastUpdated: new Date().toISOString(),
    _fgPct: boxData ? {
      home: boxData.homeTeam?.statistics?.fieldGoalsAttempted > 0
        ? boxData.homeTeam.statistics.fieldGoalsMade / boxData.homeTeam.statistics.fieldGoalsAttempted
        : null,
      away: boxData.awayTeam?.statistics?.fieldGoalsAttempted > 0
        ? boxData.awayTeam.statistics.fieldGoalsMade / boxData.awayTeam.statistics.fieldGoalsAttempted
        : null,
    } : null,
    _3ptPct: boxData ? {
      home: boxData.homeTeam?.statistics?.threePointersAttempted > 0
        ? boxData.homeTeam.statistics.threePointersMade / boxData.homeTeam.statistics.threePointersAttempted
        : null,
      away: boxData.awayTeam?.statistics?.threePointersAttempted > 0
        ? boxData.awayTeam.statistics.threePointersMade / boxData.awayTeam.statistics.threePointersAttempted
        : null,
    } : null,
    _rebounds: boxData ? {
      home: parseInt(boxData.homeTeam?.statistics?.reboundsTotal ?? boxData.homeTeam?.statistics?.rebounds ?? 0, 10),
      away: parseInt(boxData.awayTeam?.statistics?.reboundsTotal ?? boxData.awayTeam?.statistics?.rebounds ?? 0, 10),
    } : null,
    _turnovers: boxData ? {
      home: parseInt(boxData.homeTeam?.statistics?.turnovers ?? 0, 10),
      away: parseInt(boxData.awayTeam?.statistics?.turnovers ?? 0, 10),
    } : null,
    _foulTrouble: boxData ? (() => {
      const homeFouls = parseInt(boxData.homeTeam?.statistics?.foulsPersonal ?? 0, 10)
      const awayFouls = parseInt(boxData.awayTeam?.statistics?.foulsPersonal ?? 0, 10)
      // Positive = home in foul trouble, negative = away in foul trouble
      return homeFouls - awayFouls
    })() : 0,
  }
}

// ── Schedule & Live fetchers ──────────────────────────────────────────────────

/**
 * Fetch NBA schedule for a given day.
 * The CDN only provides today's data — return [] for yesterday/tomorrow (no date param exists).
 * @param {Date} _date
 * @param {'yesterday'|'today'|'tomorrow'} [scheduleDay='today']
 */
function withWinProb(games) {
  return games.map((g) => ({
    ...g,
    winProbabilityTimeline: g.winProbabilityTimeline?.length > 0
      ? g.winProbabilityTimeline
      : buildWinProbTimeline(g.linescore ?? []),
  }))
}

const ESPN_NBA_SCOREBOARD = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard'

async function fetchEspnNbaSchedule(date, scheduleDay) {
  const d = date.toISOString().slice(0, 10).replace(/-/g, '')
  const res = await fetch(`${ESPN_NBA_SCOREBOARD}?dates=${d}&limit=20`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`ESPN NBA scoreboard ${res.status}`)
  const data = await res.json()
  return (data.events ?? []).map(ev => normalizeEspnNbaEvent(ev, scheduleDay)).filter(Boolean)
}

function normalizeEspnNbaEvent(ev, scheduleDay) {
  const comp = ev.competitions?.[0]
  if (!comp) return null
  const home = comp.competitors?.find(c => c.homeAway === 'home')
  const away = comp.competitors?.find(c => c.homeAway === 'away')
  if (!home || !away) return null

  const statusName = ev.status?.type?.name ?? ''
  const isFinal    = ev.status?.type?.completed === true || statusName === 'STATUS_FINAL'
  const isLive     = statusName === 'STATUS_IN_PROGRESS'
  const status     = isFinal ? 'final' : isLive ? 'live' : 'scheduled'
  const periodNum  = ev.status?.period ?? 0

  return {
    gameId:    `nba_espn_${ev.id}`,
    league:    'nba',
    status,
    scheduleDay,
    startTime: ev.date ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    homeTeam:  { id: home.team?.abbreviation ?? '', name: home.team?.displayName ?? '', abbreviation: home.team?.abbreviation ?? '', record: home.records?.[0]?.summary ?? '' },
    awayTeam:  { id: away.team?.abbreviation ?? '', name: away.team?.displayName ?? '', abbreviation: away.team?.abbreviation ?? '', record: away.records?.[0]?.summary ?? '' },
    score:     { home: parseInt(home.score ?? 0, 10), away: parseInt(away.score ?? 0, 10) },
    period:    { current: periodNum, label: isFinal ? 'Final' : isLive ? `Q${periodNum}` : 'Scheduled', timeRemaining: ev.status?.displayClock ?? '' },
    linescore: [],
    winProbabilityTimeline: [],
    scoringPlays: [],
    boxScore:  null,
  }
}

export async function fetchSchedule(_date, scheduleDay = 'today') {
  if (USE_MOCK) {
    return scheduleDay === 'today' ? withWinProb(NBA_MOCK_GAMES) : []
  }

  if (scheduleDay !== 'today') {
    try {
      return await fetchEspnNbaSchedule(_date, scheduleDay)
    } catch (err) {
      console.warn(`[NBA] ESPN schedule fetch failed for ${scheduleDay}:`, err.message)
      return []
    }
  }

  let data
  try {
    data = await cdnGet('scoreboard/todaysScoreboard_00.json')
  } catch (err) {
    console.warn('[NBA] CDN scoreboard fetch failed:', err.message)
    return []
  }

  const games = data?.scoreboard?.games ?? []
  return games.map((g) => buildGameEvent(g, null, null))
}

/**
 * Fetch live detail for one NBA game (box score + pbp).
 */
export async function fetchLiveGame(rawGameId) {
  // ESPN-sourced games (yesterday/tomorrow) have no CDN live data — skip hydration
  if (rawGameId.startsWith('nba_espn_')) return null

  // Strip our "nba_" prefix if present
  const gameId = rawGameId.replace(/^nba_/, '')

  if (USE_MOCK) {
    const mock = NBA_MOCK_GAMES.find((g) => g.gameId === `nba_${gameId}`) ?? null
    if (!mock) return null
    return withWinProb([mock])[0]
  }

  let scoreboard
  try {
    scoreboard = await cdnGet('scoreboard/todaysScoreboard_00.json')
  } catch (err) {
    console.warn('[NBA] CDN scoreboard fetch failed for live game:', err.message)
    return null
  }

  const games = scoreboard?.scoreboard?.games ?? []
  const game = games.find((g) => g.gameId === gameId)
  if (!game) return null

  let boxData = null
  let pbpData = null

  const status = mapNbaStatus(game.gameStatus)
  if (status !== 'scheduled') {
    try {
      const [boxRes, pbpRes] = await Promise.all([
        cdnGet(`boxscore/boxscore_${gameId}.json`),
        cdnGet(`playbyplay/playbyplay_${gameId}.json`),
      ])
      boxData = boxRes?.game ?? null
      pbpData = pbpRes?.game ?? null
    } catch (err) {
      console.warn(`[NBA] Failed to fetch box/pbp for ${gameId}:`, err.message)
    }
  }

  return buildGameEvent(game, boxData, pbpData)
}

/**
 * NBA games update every 30 s during live periods, every 5 min otherwise.
 */
export function getPollingIntervalMs() {
  return 30_000
}
