/**
 * StatsFetcher — per-league free API clients for stats prefetching.
 * All fetches are fire-and-forget via prefetchGameStats().
 * Never called in the hot prediction path.
 */
import { statsCache } from './stats-cache.js'

const MLB_API   = 'https://statsapi.mlb.com/api/v1'
const NHL_API   = 'https://api-web.nhle.com/v1'
const NBA_STATS = 'https://stats.nba.com/stats'

/**
 * Fetch JSON from a URL with a timeout.
 */
async function fetchJson(url, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
    return await res.json()
  } finally {
    clearTimeout(timeout)
  }
}

// ─── MLB ────────────────────────────────────────────────────────────────────

export async function fetchMlbPitcherStats(pitcherId) {
  const key = `mlb_pitcher_${pitcherId}`
  return statsCache.fetchWithDedup(key, async () => {
    const data = await fetchJson(
      `${MLB_API}/people/${pitcherId}/stats?stats=season&group=pitching&season=2025`
    )
    const stats = data?.stats?.[0]?.splits?.[0]?.stat || {}
    return {
      era:  parseFloat(stats.era                ?? 4.50),
      whip: parseFloat(stats.whip               ?? 1.30),
      k9:   parseFloat(stats.strikeoutsPer9Inn  ?? 8.00),
      ip:   parseFloat(stats.inningsPitched     ?? 0),
    }
  })
}

export async function fetchMlbTeamStats(teamId) {
  const key = `mlb_team_${teamId}`
  return statsCache.fetchWithDedup(key, async () => {
    const [hitting, pitching] = await Promise.all([
      fetchJson(`${MLB_API}/teams/${teamId}/stats?stats=season&group=hitting&season=2025`),
      fetchJson(`${MLB_API}/teams/${teamId}/stats?stats=season&group=pitching&season=2025`),
    ])
    const hitStats = hitting?.stats?.[0]?.splits?.[0]?.stat  || {}
    const pitStats = pitching?.stats?.[0]?.splits?.[0]?.stat || {}
    return {
      ops:        parseFloat(hitStats.ops ?? 0.720),
      avg:        parseFloat(hitStats.avg ?? 0.250),
      bullpenEra: parseFloat(pitStats.era ?? 4.00),
    }
  })
}

// ─── NHL ────────────────────────────────────────────────────────────────────

export async function fetchNhlGoalieStats(playerId) {
  const key = `nhl_goalie_${playerId}`
  return statsCache.fetchWithDedup(key, async () => {
    const data = await fetchJson(`${NHL_API}/player/${playerId}/landing`)
    const stats = data?.featuredStats?.regularSeason?.subSeason || {}
    return {
      svPct: parseFloat(stats.savePctg       ?? 0.910),
      gaa:   parseFloat(stats.goalsAgainstAvg ?? 3.00),
      gp:    parseInt(stats.gamesPlayed       ?? 0, 10),
    }
  })
}

export async function fetchNhlTeamStats(teamAbbrev) {
  const key = `nhl_team_${teamAbbrev}`
  return statsCache.fetchWithDedup(key, async () => {
    const data = await fetchJson(`${NHL_API}/club-stats/${teamAbbrev}/now`)
    const stats = data || {}
    return {
      goalsPerGame: parseFloat(stats.goalsForPerGame     ?? 3.00),
      goalsAgainst: parseFloat(stats.goalsAgainstPerGame ?? 3.00),
      ppPct:        parseFloat(stats.powerPlayPct        ?? 0.20),
      pkPct:        parseFloat(stats.penaltyKillPct      ?? 0.80),
    }
  })
}

// ─── NBA ────────────────────────────────────────────────────────────────────

const NBA_HEADERS = {
  'User-Agent':          'Mozilla/5.0 (compatible; SportsTracker/1.0)',
  'Referer':             'https://www.nba.com/',
  'Origin':              'https://www.nba.com',
  'x-nba-stats-origin': 'stats',
  'x-nba-stats-token':  'true',
}

export async function fetchNbaPlayerStats(playerId) {
  const key = `nba_player_${playerId}`
  return statsCache.fetchWithDedup(key, async () => {
    const url = `${NBA_STATS}/playerprofilev2?PlayerID=${playerId}&PerMode=PerGame&LeagueID=00`
    const data = await fetchJson(url, { headers: NBA_HEADERS })
    const resultSet = data?.resultSets?.find(r => r.name === 'SeasonTotalsRegularSeason')
    const headers   = resultSet?.headers || []
    const row       = resultSet?.rowSet?.at(-1) || [] // most recent season row
    const idx       = h => headers.indexOf(h)

    return {
      ppg:      parseFloat(row[idx('PTS')]       ?? 0),
      rpg:      parseFloat(row[idx('REB')]       ?? 0),
      apg:      parseFloat(row[idx('AST')]       ?? 0),
      plusMinus: parseFloat(row[idx('PLUS_MINUS')] ?? 0),
      gp:       parseInt(row[idx('GP')]          ?? 0, 10),
    }
  })
}

export async function fetchNbaTeamStats(teamId) {
  const key = `nba_team_${teamId}`
  return statsCache.fetchWithDedup(key, async () => {
    const url = `${NBA_STATS}/teamdashboardbygeneralsplits?TeamID=${teamId}&Season=2024-25&SeasonType=Regular+Season&MeasureType=Advanced&PerMode=PerGame&LastNGames=0&Month=0&OpponentTeamID=0&PaceAdjust=N&PlusMinus=N&Rank=N&DateFrom=&DateTo=`
    const data = await fetchJson(url, { headers: NBA_HEADERS })
    const row     = data?.resultSets?.[0]?.rowSet?.[0]  || []
    const headers = data?.resultSets?.[0]?.headers       || []
    const idx = h => headers.indexOf(h)

    return {
      netRating: parseFloat(row[idx('NET_RATING')] ?? 0),
      pace:      parseFloat(row[idx('PACE')]        ?? 100),
      offRtg:    parseFloat(row[idx('OFF_RATING')]  ?? 112),
      defRtg:    parseFloat(row[idx('DEF_RATING')]  ?? 112),
      ppg:       parseFloat(row[idx('PTS')]         ?? 112),
      oppPpg:    parseFloat(row[idx('OPP_PTS')]     ?? 112),
    }
  })
}

// ─── Prefetch Orchestration ─────────────────────────────────────────────────

/**
 * Fire-and-forget prefetch for all games in a schedule.
 * Never awaited in the hot path. Errors are swallowed with a warning log.
 *
 * @param {Array} games - normalized GameEvent array from the schedule
 */
export function prefetchGameStats(games) {
  if (!Array.isArray(games)) return

  for (const game of games) {
    const league = game.league?.toUpperCase()

    if (league === 'MLB')      _prefetchMlb(game)
    else if (league === 'NHL') _prefetchNhl(game)
    else if (league === 'NBA') _prefetchNba(game)
  }
}

function _prefetchMlb(game) {
  const homeId        = game.homeTeam?.id
  const awayId        = game.awayTeam?.id
  const homeStarterId = game._starterIds?.home
  const awayStarterId = game._starterIds?.away

  const tasks = []
  if (homeId)        tasks.push(fetchMlbTeamStats(homeId).catch(warn))
  if (awayId)        tasks.push(fetchMlbTeamStats(awayId).catch(warn))
  if (homeStarterId) tasks.push(fetchMlbPitcherStats(homeStarterId).catch(warn))
  if (awayStarterId) tasks.push(fetchMlbPitcherStats(awayStarterId).catch(warn))

  Promise.allSettled(tasks) // intentionally not awaited
}

function _prefetchNhl(game) {
  const homeAbbrev  = game.homeTeam?.abbreviation || game.homeTeam?.id
  const awayAbbrev  = game.awayTeam?.abbreviation || game.awayTeam?.id
  const homeGoalieId = game._goalieIds?.home
  const awayGoalieId = game._goalieIds?.away

  const tasks = []
  if (homeAbbrev)   tasks.push(fetchNhlTeamStats(homeAbbrev).catch(warn))
  if (awayAbbrev)   tasks.push(fetchNhlTeamStats(awayAbbrev).catch(warn))
  if (homeGoalieId) tasks.push(fetchNhlGoalieStats(homeGoalieId).catch(warn))
  if (awayGoalieId) tasks.push(fetchNhlGoalieStats(awayGoalieId).catch(warn))

  Promise.allSettled(tasks)
}

function _prefetchNba(game) {
  const homeId      = game.homeTeam?.id
  const awayId      = game.awayTeam?.id
  const starPlayerId = game._starPlayerId // top player ID if available from adapter

  const tasks = []
  if (homeId)       tasks.push(fetchNbaTeamStats(homeId).catch(warn))
  if (awayId)       tasks.push(fetchNbaTeamStats(awayId).catch(warn))
  if (starPlayerId) tasks.push(fetchNbaPlayerStats(starPlayerId).catch(warn))

  Promise.allSettled(tasks)
}

function warn(err) {
  console.warn('[StatsFetcher] prefetch error:', err.message)
}
