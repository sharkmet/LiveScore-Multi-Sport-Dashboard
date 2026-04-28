/**
 * NFL adapter — ESPN public API.
 * No API key required. Endpoint: site.api.espn.com
 *
 * Implements LeagueAdapter: { league, fetchSchedule, fetchLiveGame, getPollingIntervalMs }
 */

import { NFL_MOCK_GAMES } from '../mocks/nfl-mock-data.js'

const USE_MOCK = process.env.USE_MOCK_DATA === 'true'

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toYYYYMMDD(date) {
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

async function espnFetch(url) {
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'LiveScoreDashboard/1.0' },
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`ESPN ${res.status} for ${url}`)
  return res.json()
}

function mapStatus(espnEvent) {
  const typeId = espnEvent.status?.type?.id
  const state  = espnEvent.status?.type?.state ?? ''
  const name   = espnEvent.status?.type?.name  ?? ''

  if (state === 'pre')  return 'scheduled'
  if (state === 'post') return 'final'
  if (name === 'STATUS_HALFTIME') return 'live'
  if (name === 'STATUS_DELAYED' || name === 'STATUS_POSTPONED') return 'delayed'
  if (state === 'in')   return 'live'
  return 'scheduled'
}

function mapPeriod(espnEvent) {
  const period = espnEvent.status?.period ?? 0
  const displayClock = espnEvent.status?.displayClock ?? ''
  const typeName = espnEvent.status?.type?.name ?? ''
  const state    = espnEvent.status?.type?.state ?? ''

  if (state === 'post') {
    const isOT = period >= 5 || typeName.includes('OT')
    return { current: period || 4, label: isOT ? 'Final/OT' : 'Final' }
  }

  if (typeName === 'STATUS_HALFTIME') {
    return { current: 2, label: 'Halftime' }
  }

  if (state === 'pre') {
    return { current: 0, label: 'Scheduled' }
  }

  let label = 'Q1'
  if (period === 1) label = 'Q1'
  else if (period === 2) label = 'Q2'
  else if (period === 3) label = 'Q3'
  else if (period === 4) label = 'Q4'
  else if (period >= 5)  label = 'OT'

  return { current: period || 1, label }
}

function resolveTeam(competitor) {
  if (!competitor) return null
  return {
    id:           competitor.id ?? competitor.team?.id ?? '',
    name:         competitor.team?.name ?? competitor.team?.displayName ?? '',
    abbreviation: competitor.team?.abbreviation ?? '',
    city:         competitor.team?.location ?? '',
    record:       competitor.records?.[0]?.summary ?? '',
    seed:         competitor.curatedRank?.current ?? null,
  }
}

function resolveScore(competitor) {
  return parseInt(competitor?.score ?? '0', 10) || 0
}

function resolveWinProbability(espnEvent) {
  try {
    const comp = espnEvent.competitions?.[0]
    const predictor = comp?.predictor
    if (predictor?.homeTeam?.gameProjection != null && predictor?.awayTeam?.gameProjection != null) {
      const home = parseFloat(predictor.homeTeam.gameProjection) / 100
      const away = parseFloat(predictor.awayTeam.gameProjection) / 100
      if (!isNaN(home) && !isNaN(away) && home > 0 && away > 0) {
        return { home: Math.min(0.99, Math.max(0.01, home)), away: Math.min(0.99, Math.max(0.01, away)) }
      }
    }
  } catch {
    // not available
  }
  return null
}

function normalizeScheduleEvent(espnEvent) {
  const comp  = espnEvent.competitions?.[0]
  if (!comp) return null

  const homeComp  = comp.competitors?.find((c) => c.homeAway === 'home')
  const awayComp  = comp.competitors?.find((c) => c.homeAway === 'away')
  if (!homeComp || !awayComp) return null

  const status    = mapStatus(espnEvent)
  const period    = mapPeriod(espnEvent)
  const isHalftime = espnEvent.status?.type?.name === 'STATUS_HALFTIME'

  const winProb = resolveWinProbability(espnEvent) ?? { home: 0.5, away: 0.5 }

  return {
    gameId:    `nfl-${espnEvent.id}`,
    league:    'nfl',
    status,
    startTime: espnEvent.date,
    period,
    homeTeam:  resolveTeam(homeComp),
    awayTeam:  resolveTeam(awayComp),
    score: {
      home: resolveScore(homeComp),
      away: resolveScore(awayComp),
    },
    timeline:               [],
    lastPlay:               null,
    winProbability:         winProb,
    winProbabilityTimeline: [],
    nflExtras: {
      clock:        isHalftime ? 'Halftime' : (espnEvent.status?.displayClock ?? '15:00'),
      possession:   null,
      down:         null,
      distance:     null,
      yardLine:     null,
      yardLineText: null,
      isRedZone:    false,
      timeoutsHome: 3,
      timeoutsAway: 3,
      currentDrive: null,
    },
  }
}

function resolveNflExtras(summaryData) {
  try {
    const situation = summaryData.situation ?? {}
    const drives    = summaryData.drives    ?? {}

    const downDistTxt = situation.downDistanceText ?? ''
    const ddMatch     = downDistTxt.match(/^(\d+)(?:st|nd|rd|th)\s*&\s*(\d+|Goal)/i)
    const down        = ddMatch ? parseInt(ddMatch[1], 10) : null
    const distance    = ddMatch ? (ddMatch[2].toLowerCase() === 'goal' ? 0 : parseInt(ddMatch[2], 10)) : null
    const isGoalToGo  = downDistTxt.toLowerCase().includes('goal')

    const yardLineRaw = situation.yardLine ?? null
    const yardLine    = yardLineRaw != null ? parseInt(yardLineRaw, 10) : null
    const yardLineTxt = situation.shortDownDistanceText ?? null

    const possTeamId  = situation.possession?.id ?? null
    const isRedZone   = situation.isRedZone ?? (yardLine != null && yardLine >= 80)

    // Timeouts — try to get from each competitor's timeouts
    let timeoutsHome = 3
    let timeoutsAway = 3
    const boxtimeouts = summaryData.boxscore?.teams ?? []
    for (const t of boxtimeouts) {
      const to = t.team?.timeouts ?? t.statistics?.find?.((s) => s.name === 'timeoutsRemaining')?.value
      if (t.homeAway === 'home' && to != null) timeoutsHome = parseInt(to, 10)
      if (t.homeAway === 'away' && to != null) timeoutsAway = parseInt(to, 10)
    }

    // Current drive
    let currentDrive = null
    const curDrive = drives.current ?? drives.previous ?? null
    if (curDrive) {
      currentDrive = {
        startYardLine:    curDrive.start?.yardLine ?? 0,
        plays:            curDrive.plays ?? 0,
        yards:            curDrive.yards ?? 0,
        timeOfPossession: curDrive.timeElapsed ?? '0:00',
      }
    }

    return {
      clock:        summaryData.header?.competitions?.[0]?.status?.type?.name === 'STATUS_HALFTIME'
                    ? 'Halftime'
                    : (situation.displayClock ?? '15:00'),
      possession:   null, // resolved below per event competitor lookup
      possTeamId,
      down,
      distance,
      yardLine,
      yardLineText: yardLineTxt,
      isRedZone,
      isGoalToGo,
      timeoutsHome,
      timeoutsAway,
      currentDrive,
    }
  } catch {
    return {
      clock: '15:00', possession: null, possTeamId: null,
      down: null, distance: null, yardLine: null, yardLineText: null,
      isRedZone: false, isGoalToGo: false, timeoutsHome: 3, timeoutsAway: 3, currentDrive: null,
    }
  }
}

function buildTimeline(summaryData, homeId) {
  try {
    const scoring = summaryData.scoringPlays ?? []
    if (!scoring.length) return []

    const byPeriod = {}
    for (const play of scoring) {
      const qtr = play.period?.number ?? 1
      if (!byPeriod[qtr]) byPeriod[qtr] = { home: 0, away: 0 }
      const isHome = play.team?.id === homeId
      const pts = parseInt(play.pointsAfter?.total ?? play.scoringType?.point ?? 0, 10)
      if (!isNaN(pts)) {
        if (isHome) byPeriod[qtr].home += pts
        else        byPeriod[qtr].away += pts
      }
    }

    return Object.entries(byPeriod)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([qtr, scores]) => {
        const q = Number(qtr)
        const label = q === 1 ? 'Q1' : q === 2 ? 'Q2' : q === 3 ? 'Q3' : q === 4 ? 'Q4' : 'OT'
        return {
          period:      q,
          periodLabel: label,
          homeScore:   scores.home,
          awayScore:   scores.away,
        }
      })
  } catch {
    return []
  }
}

function buildDriveTimeline(summaryData) {
  try {
    const driveList = summaryData.drives?.previous ?? []
    return driveList.map((d) => ({
      team:             d.team?.abbreviation ?? '?',
      result:           d.result ?? '',
      plays:            d.plays ?? 0,
      yards:            d.yards ?? 0,
      timeOfPossession: d.timeElapsed ?? '0:00',
      endYardLine:      d.end?.yardLine ?? null,
    }))
  } catch {
    return []
  }
}

function buildWpTimeline(summaryData, homeId) {
  try {
    const plays = summaryData.winprobability ?? summaryData.plays ?? []
    if (!plays.length) return []
    // Sample one point per quarter transition
    const quarterPoints = {}
    for (const p of plays) {
      const qtr = p.period?.number ?? p.period ?? 1
      const prob = p.homeWinPercentage ?? p.tiePercentage
      if (prob != null) {
        quarterPoints[qtr] = parseFloat(prob) / (prob > 1 ? 100 : 1)
      }
    }
    return Object.entries(quarterPoints)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([qtr, homeWinProb]) => ({ period: Number(qtr), homeWinProb }))
  } catch {
    return []
  }
}

async function enrichLiveGame(gameId, base) {
  try {
    const espnId  = gameId.replace('nfl-', '')
    const summary = await espnFetch(`${ESPN_BASE}/summary?event=${espnId}`)

    const homeId  = base.homeTeam?.id ?? ''
    const extras  = resolveNflExtras(summary)

    // Resolve possession using competitor IDs from header
    const comp = summary.header?.competitions?.[0]
    if (comp) {
      const possId = summary.situation?.possession?.id ?? null
      if (possId) {
        const homeComp = comp.competitors?.find((c) => c.homeAway === 'home')
        extras.possession = homeComp?.team?.id === possId ? 'home' : 'away'
      }
    }

    const lastPlays = summary.drives?.current?.plays ?? summary.plays ?? []
    const lastPlay  = lastPlays.length
      ? (lastPlays[lastPlays.length - 1]?.text ?? null)
      : summary.situation?.lastPlay?.text ?? null

    const wpRaw = resolveWinProbability({ competitions: [summary.header?.competitions?.[0] ?? {}] })
    const winProbability = wpRaw ?? base.winProbability

    const timeline    = buildTimeline(summary, homeId)
    const wpTimeline  = buildWpTimeline(summary, homeId)
    const driveTimeline = buildDriveTimeline(summary)

    const { possTeamId, isGoalToGo, ...nflExtras } = extras

    return {
      ...base,
      lastPlay,
      winProbability,
      winProbabilityTimeline: wpTimeline,
      timeline,
      nflExtras: {
        ...nflExtras,
        driveTimeline,
      },
    }
  } catch (err) {
    console.warn(`[nfl] enrichLiveGame(${gameId}) failed: ${err.message}`)
    return base
  }
}

// ─── Adapter exports ──────────────────────────────────────────────────────────

export const league = 'nfl'

export async function fetchSchedule(date, _scheduleDay) {
  if (USE_MOCK) return NFL_MOCK_GAMES

  try {
    const dateStr = toYYYYMMDD(date)
    const data    = await espnFetch(`${ESPN_BASE}/scoreboard?dates=${dateStr}`)
    const events  = data.events ?? []

    const games = []
    for (const event of events) {
      try {
        const game = normalizeScheduleEvent(event)
        if (game) games.push(game)
      } catch (err) {
        console.warn(`[nfl] normalizeScheduleEvent failed: ${err.message}`)
      }
    }
    return games
  } catch (err) {
    console.error(`[nfl] fetchSchedule error: ${err.message}`)
    return []
  }
}

export async function fetchLiveGame(gameId) {
  if (USE_MOCK) {
    return NFL_MOCK_GAMES.find((g) => g.gameId === gameId) ?? null
  }

  try {
    const espnId = gameId.replace('nfl-', '')
    const data   = await espnFetch(`${ESPN_BASE}/scoreboard?event=${espnId}`)
    const event  = data.events?.[0] ?? null
    if (!event) throw new Error(`No event found for ${gameId}`)

    const base = normalizeScheduleEvent(event)
    if (!base) throw new Error(`Failed to normalize event ${gameId}`)

    return await enrichLiveGame(gameId, base)
  } catch (err) {
    console.error(`[nfl] fetchLiveGame(${gameId}) error: ${err.message}`)
    return null
  }
}

export function getPollingIntervalMs(hasLiveGames) {
  return hasLiveGames ? 20_000 : 300_000
}
