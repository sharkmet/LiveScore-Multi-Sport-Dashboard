/**
 * MLB Stats API adapter.
 * Exports: { league, fetchSchedule, fetchLiveGame, getPollingIntervalMs }
 *
 * Falls back to bundled mock data when:
 *   - USE_MOCK_DATA=true env variable is set
 *   - The API returns an error
 *   - The API returns zero games for today
 */

import { mapMlbStatus, parseRecord, formatDate, buildInningLabel, ordinal } from '../utils/normalize.js'
import { mockGames, mockGamesByDay } from '../mocks/mlb-mock-data.js'
import { getPlayerStats, setPlayerStats } from '../services/cache.js'

const BASE_V1 = 'https://statsapi.mlb.com/api/v1'
const BASE_V1_1 = 'https://statsapi.mlb.com/api/v1.1'

export const league = 'mlb'

export function getPollingIntervalMs() {
  return 15_000
}

// ─── Pitcher stats TTL cache ─────────────────────────────────────────────────
// Keyed by MLB person ID → { stats, fetchedAt }
const PITCHER_STATS_TTL_MS = 30 * 60 * 1000  // 30 minutes
const pitcherStatsCache = new Map()

async function fetchPitcherStats(personId) {
  const cached = pitcherStatsCache.get(personId)
  if (cached && Date.now() - cached.fetchedAt < PITCHER_STATS_TTL_MS) {
    return cached.stats
  }

  try {
    const url = `${BASE_V1}/people/${personId}?hydrate=stats(group=[pitching],type=[season],currentSeason=true)`
    const res = await fetch(url, { signal: AbortSignal.timeout(8_000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()

    const person = data.people?.[0]
    const seasonStats = person?.stats?.[0]?.splits?.[0]?.stat

    const stats = {
      id: String(personId),
      name: person?.fullName ?? '',
      era: seasonStats?.era ?? '--',
      wins: seasonStats?.wins ?? 0,
      losses: seasonStats?.losses ?? 0,
      ip: seasonStats?.inningsPitched ?? '0.0',
      seasonStats: seasonStats ? {
        era: seasonStats.era ?? '--',
        wins: seasonStats.wins ?? 0,
        losses: seasonStats.losses ?? 0,
        ip: seasonStats.inningsPitched ?? '0.0',
        k: seasonStats.strikeOuts ?? 0,
        bb: seasonStats.baseOnBalls ?? 0,
        whip: seasonStats.whip ?? '--',
      } : null,
    }

    pitcherStatsCache.set(personId, { stats, fetchedAt: Date.now() })
    return stats
  } catch {
    return null
  }
}

async function fetchPitcherLast10(personId) {
  try {
    const url = `${BASE_V1}/people/${personId}/stats?stats=lastXGames&group=pitching&limit=10`
    const res = await fetch(url, { signal: AbortSignal.timeout(8_000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const stat = data.stats?.[0]?.splits?.[0]?.stat
    if (!stat) return null
    return {
      era: stat.era ?? '--',
      wins: stat.wins ?? 0,
      losses: stat.losses ?? 0,
      ip: stat.inningsPitched ?? '0.0',
      k: stat.strikeOuts ?? 0,
      bb: stat.baseOnBalls ?? 0,
    }
  } catch {
    return null
  }
}

/**
 * Batch-fetch season stats for multiple person IDs.
 * Checks cache first; only fetches IDs missing from cache.
 * Stores both hitting and pitching per person.
 * @param {(string|number)[]} personIds
 */
async function batchFetchSeasonStats(personIds) {
  const missing = personIds.filter((id) => !getPlayerStats(id))
  if (missing.length === 0) return

  try {
    const url = `${BASE_V1}/people?personIds=${missing.join(',')}&hydrate=stats(group=[hitting,pitching],type=season)`
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()

    for (const person of data.people ?? []) {
      const hitting = person.stats?.find((s) => s.group?.displayName === 'hitting')?.splits?.[0]?.stat ?? null
      const pitching = person.stats?.find((s) => s.group?.displayName === 'pitching')?.splits?.[0]?.stat ?? null
      setPlayerStats(person.id, { hitting, pitching })
    }
  } catch (err) {
    console.warn(`[mlb] batchFetchSeasonStats failed: ${err.message}`)
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch schedule for a given date and return normalized GameEvent[].
 * @param {Date} date
 * @param {'yesterday'|'today'|'tomorrow'} [scheduleDay='today']
 * @returns {Promise<object[]>}
 */
export async function fetchSchedule(date, scheduleDay = 'today') {
  if (process.env.USE_MOCK_DATA === 'true') {
    console.warn('[mlb] USE_MOCK_DATA=true — using bundled mock schedule')
    return mockGamesByDay[scheduleDay] ?? mockGames
  }

  const dateStr = formatDate(date)
  const url = `${BASE_V1}/schedule?sportId=1&date=${dateStr}&hydrate=team,linescore,probablePitcher`

  let raw
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    raw = await res.json()
  } catch (err) {
    console.warn(`[mlb] fetchSchedule(${scheduleDay}) failed:`, err.message)
    return []
  }

  const gameDates = raw?.dates ?? []
  const games = gameDates.flatMap((d) => d.games ?? [])

  const normalized = await Promise.all(
    games.map((g) => normalizeScheduleGame(g, scheduleDay))
  )
  return normalized
}

/**
 * Fetch a live game feed and return a normalized GameEvent.
 * @param {string} gameId - numeric MLB gamePk
 * @returns {Promise<object>}
 */
export async function fetchLiveGame(gameId) {
  if (process.env.USE_MOCK_DATA === 'true') {
    const allMock = Object.values(mockGamesByDay).flat()
    const found = allMock.find((g) => g.gameId === gameId)
    return found ?? mockGames[0]
  }

  const url = `${BASE_V1_1}/game/${gameId}/feed/live`

  let raw
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    raw = await res.json()
  } catch (err) {
    console.warn(`[mlb] fetchLiveGame(${gameId}) failed:`, err.message)
    throw new Error(`MLB: failed to fetch live data for gameId ${gameId}: ${err.message}`)
  }

  return await normalizeLiveGame(raw)
}

// ─── Private normalizers ──────────────────────────────────────────────────────

async function normalizeScheduleGame(g, scheduleDay) {
  const abstractState = g.status?.abstractGameState ?? 'Preview'
  const detailedState = g.status?.detailedState ?? ''
  const status = mapMlbStatus(abstractState, detailedState)

  const linescore = g.linescore ?? {}
  const innings = linescore.innings ?? []

  const homeRuns = linescore.teams?.home?.runs ?? 0
  const awayRuns = linescore.teams?.away?.runs ?? 0

  const currentInning = linescore.currentInning ?? 0
  const isTopHalf = linescore.isTopInning ?? true

  const periodLabel = status === 'final'
    ? 'Final'
    : status === 'scheduled'
    ? 'Scheduled'
    : status === 'delayed'
    ? `Delayed - ${ordinal(currentInning)}`
    : buildInningLabel(currentInning, isTopHalf)

  // Probable pitchers (schedule-only; enriched with stats if available)
  let probablePitchers
  if (status === 'scheduled') {
    const homeProbable = g.teams?.home?.probablePitcher
    const awayProbable = g.teams?.away?.probablePitcher
    if (homeProbable || awayProbable) {
      const [homeStats, awayStats, homeLast10, awayLast10] = await Promise.all([
        homeProbable?.id ? fetchPitcherStats(homeProbable.id) : null,
        awayProbable?.id ? fetchPitcherStats(awayProbable.id) : null,
        homeProbable?.id ? fetchPitcherLast10(homeProbable.id) : null,
        awayProbable?.id ? fetchPitcherLast10(awayProbable.id) : null,
      ])
      const fallbackPitcher = (probable) => probable
        ? { id: String(probable.id), name: probable.fullName ?? '', era: '--', wins: 0, losses: 0, ip: '0.0', seasonStats: null, last10: null }
        : null
      probablePitchers = {
        home: homeStats ? { ...homeStats, last10: homeLast10 } : fallbackPitcher(homeProbable),
        away: awayStats ? { ...awayStats, last10: awayLast10 } : fallbackPitcher(awayProbable),
      }
    }
  }

  const homeTeam = {
    id: String(g.teams?.home?.team?.id ?? ''),
    name: g.teams?.home?.team?.teamName ?? g.teams?.home?.team?.name ?? '',
    abbreviation: g.teams?.home?.team?.abbreviation ?? '',
    record: parseRecord(g.teams?.home?.leagueRecord),
  }
  const awayTeam = {
    id: String(g.teams?.away?.team?.id ?? ''),
    name: g.teams?.away?.team?.teamName ?? g.teams?.away?.team?.name ?? '',
    abbreviation: g.teams?.away?.team?.abbreviation ?? '',
    record: parseRecord(g.teams?.away?.leagueRecord),
  }

  const homeProbable = g.teams?.home?.probablePitcher
  const awayProbable = g.teams?.away?.probablePitcher

  return {
    gameId: String(g.gamePk),
    league: 'mlb',
    status,
    scheduleDay,
    startTime: g.gameDate ?? new Date().toISOString(),
    homeTeam,
    awayTeam,
    score: { home: homeRuns, away: awayRuns },
    period: { current: currentInning, label: periodLabel, isTopHalf },
    _starterIds: {
      home: homeProbable?.id ? String(homeProbable.id) : null,
      away: awayProbable?.id ? String(awayProbable.id) : null,
    },
    timeline: innings.map((inn) => ({
      period: inn.num,
      periodLabel: ordinal(inn.num),
      homeScore: inn.home?.runs ?? 0,
      awayScore: inn.away?.runs ?? 0,
    })),
    ...(probablePitchers ? { probablePitchers } : {}),
    updatedAt: new Date().toISOString(),
  }
}

async function normalizeLiveGame(raw) {
  const gd = raw.gameData ?? {}
  const ld = raw.liveData ?? {}

  const abstractState = gd.status?.abstractGameState ?? 'Preview'
  const detailedState = gd.status?.detailedState ?? ''
  const status = mapMlbStatus(abstractState, detailedState)

  const linescore = ld.linescore ?? {}
  const innings = linescore.innings ?? []

  const homeRuns = linescore.teams?.home?.runs ?? 0
  const awayRuns = linescore.teams?.away?.runs ?? 0

  const currentInning = linescore.currentInning ?? 0
  const isTopHalf = linescore.isTopInning ?? true

  const periodLabel = status === 'final'
    ? 'Final'
    : buildInningLabel(currentInning, isTopHalf)

  const allPlays = ld.plays?.allPlays ?? []
  const lastPlayObj = allPlays[allPlays.length - 1]
  const lastPlay = lastPlayObj?.result?.description ?? undefined

  const apiTimeline = buildWinProbTimeline(allPlays)
  // Fall back to linescore-based timeline when the API doesn't provide per-play WP values.
  // This ensures the chart fills in correctly even when the server starts mid-game.
  const winProbabilityTimeline = apiTimeline.length >= 2
    ? apiTimeline
    : buildWpTimelineFromInnings(innings)

  // Use current play's WP if available (more current than last half-inning boundary)
  const currentPlayWP = ld.plays?.currentPlay?.about?.startWinProbability
  const latestMlbProb = currentPlayWP != null
    ? currentPlayWP / 100
    : (winProbabilityTimeline[winProbabilityTimeline.length - 1]?.home ?? null)

  const matchup = extractMatchup(ld)
  const lineup = await extractLineupWithStats(ld)
  const boxScore = (status === 'live' || status === 'final') ? extractBoxScore(ld) : undefined
  const scoringPlays = extractScoringPlays(ld)

  const homeHits = ld.boxscore?.teams?.home?.teamStats?.batting?.hits ?? null
  const awayHits = ld.boxscore?.teams?.away?.teamStats?.batting?.hits ?? null
  const hits = homeHits !== null && awayHits !== null
    ? { home: homeHits, away: awayHits }
    : undefined

  return {
    gameId: String(gd.game?.pk ?? raw.gamePk ?? 'unknown'),
    league: 'mlb',
    status,
    scheduleDay: 'today',
    startTime: gd.datetime?.dateTime ?? new Date().toISOString(),
    homeTeam: {
      id: String(gd.teams?.home?.id ?? ''),
      name: gd.teams?.home?.teamName ?? gd.teams?.home?.name ?? '',
      abbreviation: gd.teams?.home?.abbreviation ?? '',
      record: parseRecord(gd.teams?.home?.record),
    },
    awayTeam: {
      id: String(gd.teams?.away?.id ?? ''),
      name: gd.teams?.away?.teamName ?? gd.teams?.away?.name ?? '',
      abbreviation: gd.teams?.away?.abbreviation ?? '',
      record: parseRecord(gd.teams?.away?.record),
    },
    score: { home: homeRuns, away: awayRuns },
    period: { current: currentInning, label: periodLabel, isTopHalf },
    winProbabilityTimeline: winProbabilityTimeline.length > 0 ? winProbabilityTimeline : undefined,
    _apiWinProbability: latestMlbProb ?? null,
    _starterIds: {
      home: ld.boxscore?.teams?.home?.pitchers?.[0] ? String(ld.boxscore.teams.home.pitchers[0]) : null,
      away: ld.boxscore?.teams?.away?.pitchers?.[0] ? String(ld.boxscore.teams.away.pitchers[0]) : null,
    },
    _boxscore: homeHits !== null && awayHits !== null ? { homeHits, awayHits } : null,
    _baseRunners: {
      first:  !!(ld.linescore?.offense?.first),
      second: !!(ld.linescore?.offense?.second),
      third:  !!(ld.linescore?.offense?.third),
    },
    _currentOuts: linescore.outs ?? 0,
    timeline: innings.map((inn) => ({
      period: inn.num,
      periodLabel: ordinal(inn.num),
      homeScore: inn.home?.runs ?? 0,
      awayScore: inn.away?.runs ?? 0,
    })),
    lastPlay,
    ...(hits ? { hits } : {}),
    ...(matchup ? { matchup } : {}),
    ...(lineup ? { lineup } : {}),
    ...(boxScore ? { boxScore } : {}),
    ...(scoringPlays.length > 0 ? { scoringPlays } : {}),
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Extract current at-bat matchup from live data.
 * @param {object} ld - liveData
 * @returns {object|null}
 */
function extractMatchup(ld) {
  const currentPlay = ld.plays?.currentPlay
  if (!currentPlay) return null

  const batter = currentPlay.matchup?.batter
  const pitcher = currentPlay.matchup?.pitcher
  const count = currentPlay.count

  if (!batter || !pitcher) return null

  // Last pitch: last play event flagged as a pitch
  const pitchIndices = currentPlay.pitchIndex ?? []
  const lastPitchIdx = pitchIndices[pitchIndices.length - 1]
  const lastPitchEvent = lastPitchIdx != null
    ? currentPlay.playEvents?.[lastPitchIdx]
    : null

  // Runner locations from linescore.offense
  const offense = ld.linescore?.offense ?? {}

  // Batter season stats (from boxscore if available)
  const batterKey = `ID${batter.id}`
  const batterData = ld.boxscore?.teams
    ? (ld.boxscore.teams.home?.players?.[batterKey] ?? ld.boxscore.teams.away?.players?.[batterKey])
    : null
  const batterStats = batterData?.seasonStats?.batting

  // Pitcher season stats (current pitcher on mound)
  const pitcherKey = `ID${pitcher.id}`
  const pitcherData = ld.boxscore?.teams
    ? (ld.boxscore.teams.home?.players?.[pitcherKey] ?? ld.boxscore.teams.away?.players?.[pitcherKey])
    : null
  const pitcherStats = pitcherData?.seasonStats?.pitching

  return {
    batter: {
      id: String(batter.id),
      name: batter.fullName ?? '',
      avg: batterStats?.avg ?? '.000',
      ops: batterStats?.ops ?? '.000',
      hrThisSeason: batterStats?.homeRuns ?? 0,
    },
    pitcher: {
      id: String(pitcher.id),
      name: pitcher.fullName ?? '',
      era: pitcherStats?.era ?? '--',
      wins: pitcherStats?.wins ?? 0,
      losses: pitcherStats?.losses ?? 0,
      ip: pitcherStats?.inningsPitched ?? '0.0',
    },
    count: {
      balls: count?.balls ?? 0,
      strikes: count?.strikes ?? 0,
      outs: count?.outs ?? 0,
    },
    runners: {
      first: !!offense.first,
      second: !!offense.second,
      third: !!offense.third,
    },
    lastPitch: lastPitchEvent ? {
      type: lastPitchEvent.details?.type?.code ?? '',
      speed: lastPitchEvent.pitchData?.startSpeed ? Math.round(lastPitchEvent.pitchData.startSpeed) : null,
      description: lastPitchEvent.details?.description ?? '',
    } : null,
  }
}

/**
 * Extract batting lineups from boxscore with enriched game + season stats.
 * @param {object} ld - liveData
 * @returns {Promise<object|null>}
 */
async function extractLineupWithStats(ld) {
  const boxTeams = ld.boxscore?.teams
  if (!boxTeams) return null

  // Pre-fetch season stats for all players in one batch (best-effort)
  const allIds = [
    ...Object.keys(boxTeams.home?.players ?? {}),
    ...Object.keys(boxTeams.away?.players ?? {}),
  ].map((k) => k.replace('ID', '')).filter(Boolean)
  await batchFetchSeasonStats(allIds)

  function buildBattingOrder(teamBox) {
    return Object.values(teamBox.players ?? {})
      .filter((p) => p.battingOrder && Number(p.battingOrder) < 1000)
      .sort((a, b) => Number(a.battingOrder) - Number(b.battingOrder))
      .slice(0, 9)
      .map((p) => {
        const gb = p.stats?.batting ?? {}
        const sb = p.seasonStats?.batting ?? {}
        return {
          order: Math.floor(Number(p.battingOrder) / 100),
          id: String(p.person?.id ?? ''),
          name: p.person?.fullName ?? '',
          position: p.position?.abbreviation ?? '',
          avg: sb.avg ?? '.000',
          gameStats: {
            atBats: gb.atBats ?? 0,
            hits: gb.hits ?? 0,
            runs: gb.runs ?? 0,
            rbi: gb.rbi ?? 0,
            homeRuns: gb.homeRuns ?? 0,
            strikeOuts: gb.strikeOuts ?? 0,
            walks: gb.baseOnBalls ?? 0,
          },
          seasonStats: {
            avg: sb.avg ?? '.000',
            ops: sb.ops ?? '.000',
            homeRuns: sb.homeRuns ?? 0,
            rbi: sb.rbi ?? 0,
            obp: sb.obp ?? '.000',
            slg: sb.slg ?? '.000',
          },
        }
      })
  }

  function buildPitchersList(teamBox) {
    return (teamBox.pitchers ?? []).map((pid) => {
      const p = teamBox.players?.[`ID${pid}`]
      if (!p) return null
      const gp = p.stats?.pitching ?? {}
      const sp = p.seasonStats?.pitching ?? {}
      return {
        id: String(p.person?.id ?? ''),
        name: p.person?.fullName ?? '',
        gameStats: {
          inningsPitched: gp.inningsPitched ?? '0.0',
          hits: gp.hits ?? 0,
          runs: gp.runs ?? 0,
          earnedRuns: gp.earnedRuns ?? 0,
          walks: gp.baseOnBalls ?? 0,
          strikeOuts: gp.strikeOuts ?? 0,
          pitchesThrown: gp.numberOfPitches ?? 0,
        },
        seasonStats: {
          era: sp.era ?? '--',
          wins: sp.wins ?? 0,
          losses: sp.losses ?? 0,
          ip: sp.inningsPitched ?? '0.0',
          whip: sp.whip ?? '--',
        },
      }
    }).filter(Boolean)
  }

  function buildStartingPitcher(teamBox) {
    const pitcherIds = teamBox.pitchers ?? []
    if (pitcherIds.length === 0) return null
    const starter = teamBox.players?.[`ID${pitcherIds[0]}`]
    if (!starter) return null
    const stats = starter.seasonStats?.pitching
    return {
      id: String(starter.person?.id ?? ''),
      name: starter.person?.fullName ?? '',
      era: stats?.era ?? '--',
      wins: stats?.wins ?? 0,
      losses: stats?.losses ?? 0,
      ip: stats?.inningsPitched ?? '0.0',
    }
  }

  const homeOrder = buildBattingOrder(boxTeams.home)
  const awayOrder = buildBattingOrder(boxTeams.away)

  if (homeOrder.length === 0 && awayOrder.length === 0) return null

  return {
    home: homeOrder,
    away: awayOrder,
    homePitcher: buildStartingPitcher(boxTeams.home),
    awayPitcher: buildStartingPitcher(boxTeams.away),
    homePitchers: buildPitchersList(boxTeams.home),
    awayPitchers: buildPitchersList(boxTeams.away),
  }
}

/**
 * Extract full box score for a final game.
 * @param {object} ld - liveData
 * @returns {object|null}
 */
function extractBoxScore(ld) {
  const boxTeams = ld.boxscore?.teams
  if (!boxTeams) return null

  function buildBatters(teamBox) {
    return Object.values(teamBox.players ?? {})
      .filter((p) => p.battingOrder && Number(p.battingOrder) < 1000)
      .sort((a, b) => Number(a.battingOrder) - Number(b.battingOrder))
      .map((p) => {
        const g = p.stats?.batting ?? {}
        const s = p.seasonStats?.batting ?? {}
        return {
          id: String(p.person?.id ?? ''),
          name: p.person?.fullName ?? '',
          position: p.position?.abbreviation ?? '',
          battingOrder: Math.floor(Number(p.battingOrder) / 100),
          batSide: p.batSide?.code ?? '',
          gameStats: {
            atBats: g.atBats ?? 0,
            runs: g.runs ?? 0,
            hits: g.hits ?? 0,
            doubles: g.doubles ?? 0,
            triples: g.triples ?? 0,
            homeRuns: g.homeRuns ?? 0,
            rbi: g.rbi ?? 0,
            walks: g.baseOnBalls ?? 0,
            strikeOuts: g.strikeOuts ?? 0,
            stolenBases: g.stolenBases ?? 0,
            avg: g.avg ?? '.000',
          },
          seasonStats: {
            avg: s.avg ?? '.000',
            obp: s.obp ?? '.000',
            slg: s.slg ?? '.000',
            ops: s.ops ?? '.000',
            gamesPlayed: s.gamesPlayed ?? 0,
            atBats: s.atBats ?? 0,
            hits: s.hits ?? 0,
            homeRuns: s.homeRuns ?? 0,
            rbi: s.rbi ?? 0,
            runs: s.runs ?? 0,
            doubles: s.doubles ?? 0,
            triples: s.triples ?? 0,
            stolenBases: s.stolenBases ?? 0,
            strikeouts: s.strikeOuts ?? 0,
            walks: s.baseOnBalls ?? 0,
          },
        }
      })
  }

  function buildPitchers(teamBox) {
    return (teamBox.pitchers ?? []).map((pid) => {
      const p = teamBox.players?.[`ID${pid}`]
      if (!p) return null
      const g = p.stats?.pitching ?? {}
      const s = p.seasonStats?.pitching ?? {}
      return {
        id: String(p.person?.id ?? ''),
        name: p.person?.fullName ?? '',
        pitchHand: p.pitchHand?.code ?? '',
        gameStats: {
          inningsPitched: g.inningsPitched ?? '0.0',
          hits: g.hits ?? 0,
          runs: g.runs ?? 0,
          earnedRuns: g.earnedRuns ?? 0,
          walks: g.baseOnBalls ?? 0,
          strikeOuts: g.strikeOuts ?? 0,
          pitchesThrown: g.numberOfPitches ?? 0,
        },
        seasonStats: {
          wins: s.wins ?? 0,
          losses: s.losses ?? 0,
          saves: s.saves ?? 0,
          holds: s.holds ?? 0,
          era: s.era ?? '--',
          whip: s.whip ?? '--',
          strikeouts: s.strikeOuts ?? 0,
          inningsPitched: s.inningsPitched ?? '0.0',
          gamesPlayed: s.gamesPitched ?? 0,
          gamesStarted: s.gamesStarted ?? 0,
          strikeoutsPer9: s.strikeoutsPer9Inn ?? '--',
          walksPer9: s.walksPer9Inn ?? '--',
          hitsPer9: s.hitsPer9Inn ?? '--',
        },
        decision: null,
      }
    }).filter(Boolean)
  }

  function enrichDecision(raw, allPitchers) {
    if (!raw) return null
    const pitcher = allPitchers.find((p) => p.id === String(raw.id))
    return {
      id: String(raw.id),
      name: raw.fullName ?? '',
      record: pitcher ? `${pitcher.seasonStats.wins}-${pitcher.seasonStats.losses}` : '',
      era: pitcher?.seasonStats.era ?? '--',
    }
  }

  const homePitchers = buildPitchers(boxTeams.home)
  const awayPitchers = buildPitchers(boxTeams.away)
  const allPitchers = [...homePitchers, ...awayPitchers]

  const decisions = ld.decisions ?? {}
  if (decisions.winner) {
    const w = allPitchers.find((p) => p.id === String(decisions.winner.id))
    if (w) w.decision = 'W'
  }
  if (decisions.loser) {
    const l = allPitchers.find((p) => p.id === String(decisions.loser.id))
    if (l) l.decision = 'L'
  }
  if (decisions.save) {
    const sv = allPitchers.find((p) => p.id === String(decisions.save.id))
    if (sv) sv.decision = 'S'
  }

  const gameInfoArr = ld.boxscore?.info ?? []
  const duration = gameInfoArr.find((i) => i.label === 'T')?.value ?? null
  const attendance = gameInfoArr.find((i) => i.label === 'Att')?.value ?? null
  const hpUmpire = (ld.boxscore?.officials ?? [])
    .find((u) => u.officialType === 'Home Plate')?.official?.fullName ?? null

  function teamStats(teamBox) {
    const bat = teamBox?.teamStats?.batting ?? {}
    const fld = teamBox?.teamStats?.fielding ?? {}
    const pit = teamBox?.teamStats?.pitching ?? {}
    return {
      hits:       bat.hits       ?? null,
      errors:     fld.errors     ?? null,
      leftOnBase: bat.leftOnBase ?? null,
      avg:        bat.avg        ?? null,
      pitches:    pit.numberOfPitches ?? null,
    }
  }

  return {
    home: { batters: buildBatters(boxTeams.home), pitchers: homePitchers, ...teamStats(boxTeams.home) },
    away: { batters: buildBatters(boxTeams.away), pitchers: awayPitchers, ...teamStats(boxTeams.away) },
    decisions: {
      winner: enrichDecision(decisions.winner, allPitchers),
      loser:  enrichDecision(decisions.loser, allPitchers),
      save:   enrichDecision(decisions.save, allPitchers),
    },
    gameInfo: { duration, attendance, hpUmpire },
  }
}

/**
 * Extract individual scoring plays from live data using the scoringPlays index.
 * @param {object} ld - liveData
 * @returns {object[]}
 */
function extractScoringPlays(ld) {
  const allPlays = ld.plays?.allPlays ?? []
  const scoringIndices = new Set(ld.plays?.scoringPlays ?? [])
  if (scoringIndices.size === 0) return []

  let homeScore = 0
  let awayScore = 0
  const result = []

  for (let i = 0; i < allPlays.length; i++) {
    const play = allPlays[i]
    if (!play.about?.isComplete) continue

    const runnerScores = (play.runners ?? []).filter(r => r.movement?.end === 'score').length

    if (scoringIndices.has(i)) {
      const isTop = play.about?.halfInning === 'top'
      const runs = runnerScores > 0 ? runnerScores : Math.max(1, play.result?.rbi ?? 1)

      if (isTop) awayScore += runs
      else homeScore += runs

      result.push({
        scoringPlay: true,
        inning: `${isTop ? 'T' : 'B'}${play.about?.inning ?? ''}`,
        team: isTop ? 'away' : 'home',
        title: play.result?.event ?? '',
        description: play.result?.description ?? '',
        homeScore,
        awayScore,
      })
    } else if (runnerScores > 0) {
      const isTop = play.about?.halfInning === 'top'
      if (isTop) awayScore += runnerScores
      else homeScore += runnerScores
    }
  }

  return result
}

/**
 * Fallback WP timeline from innings linescore using the logistic formula.
 * Used when the API's per-play startWinProbability is absent.
 * Gives one point per completed half-inning so the chart fills in
 * regardless of when the server started.
 */
function buildWpTimelineFromInnings(innings) {
  if (!innings?.length) return []
  const sig = (x) => 1 / (1 + Math.exp(-Math.max(-10, Math.min(10, x))))
  let homeTotal = 0, awayTotal = 0
  const points = [{ period: 0, periodLabel: 'Start', home: 0.5, gameProgress: 0 }]

  for (const inn of innings) {
    const n = inn.num ?? 1
    // End of top half — away team finished batting
    awayTotal += inn.away?.runs ?? 0
    const diffTop = homeTotal - awayTotal
    const xTop = 0.55 * diffTop + 0.12 * n + 0.04 * diffTop * n
    points.push({
      period: n,
      periodLabel: `Top ${ordinal(n)}`,
      home: Math.max(0.01, Math.min(0.99, sig(xTop))),
      gameProgress: (2 * n - 1) / 18,
    })
    // End of bottom half — home team finished batting
    homeTotal += inn.home?.runs ?? 0
    const diffBot = homeTotal - awayTotal
    const xBot = 0.55 * diffBot + 0.12 * n + 0.04 * diffBot * n
    points.push({
      period: n,
      periodLabel: `Bot ${ordinal(n)}`,
      home: Math.max(0.01, Math.min(0.99, sig(xBot))),
      gameProgress: (2 * n) / 18,
    })
  }
  return points
}

/**
 * Builds a per-inning win probability timeline from allPlays.
 * @param {object[]} allPlays
 * @returns {{ period: number, home: number }[]}
 */
function buildWinProbTimeline(allPlays) {
  // Key by half-inning ("3_T" = top 3rd, "3_B" = bottom 3rd) so both halves are kept.
  // Overwrite within each half-inning so we get the final WP at end of each half.
  const byHalfInning = new Map()

  for (const play of allPlays) {
    const inning = play.about?.inning
    const isTop  = play.about?.isTopInning ?? true
    // Prefer endWinProbability (after play completes); fall back to start.
    const homeProb = play.about?.endWinProbability ?? play.about?.startWinProbability
    if (inning == null || homeProb == null) continue

    const key = `${inning}_${isTop ? 'T' : 'B'}`
    byHalfInning.set(key, { inning, isTop, home: homeProb / 100 })
  }

  // Sort by inning then top-before-bottom, produce chart points
  return Array.from(byHalfInning.values())
    .sort((a, b) => a.inning !== b.inning ? a.inning - b.inning : (a.isTop ? -1 : 1))
    .map(({ inning, isTop, home }) => ({
      period: inning,
      periodLabel: `${isTop ? 'Top' : 'Bot'} ${ordinal(inning)}`,
      home,
    }))
}
