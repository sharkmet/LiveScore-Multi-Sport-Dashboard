/**
 * In-memory cache backed by JS Map.
 * Interface mirrors a Redis wrapper so swapping is a one-file change.
 */

const games = new Map()           // gameId → GameEvent (today, for backward compat)
const gamesByDay = new Map()      // 'yesterday'|'today'|'tomorrow' → GameEvent[]
const alerts = []                 // Alert[]

const ALERT_TTL_MS = 60 * 60 * 1000  // 1 hour
const STATUS_ORDER = { live: 0, warmup: 1, delayed: 2, scheduled: 3, final: 4 }

function sortByStatus(arr) {
  return arr.slice().sort((a, b) => {
    const pa = STATUS_ORDER[a.status] ?? 5
    const pb = STATUS_ORDER[b.status] ?? 5
    if (pa !== pb) return pa - pb
    return new Date(a.startTime) - new Date(b.startTime)
  })
}

// ─── Flat game cache (today) ──────────────────────────────────────────────────

/**
 * @param {string} id
 * @returns {object | undefined}
 */
export function getGame(id) {
  return games.get(id)
}

/**
 * @param {string} id
 * @param {object} data - GameEvent
 */
export function setGame(id, data) {
  games.set(id, data)
}

/**
 * @returns {object[]} All cached today-games sorted live → scheduled → final
 */
export function getAllTodayGames() {
  return sortByStatus(Array.from(games.values()))
}

// ─── Day-keyed game cache ─────────────────────────────────────────────────────

/**
 * Replace all games for a given day.
 * @param {'yesterday'|'today'|'tomorrow'} day
 * @param {object[]} gamesArray
 */
export function setDayGames(day, gamesArray) {
  gamesByDay.set(day, gamesArray)
}

/**
 * @param {'yesterday'|'today'|'tomorrow'} day
 * @returns {object[]}
 */
export function getGamesByDay(day) {
  return sortByStatus(gamesByDay.get(day) ?? [])
}

/**
 * @returns {{ yesterday: object[], today: object[], tomorrow: object[] }}
 */
export function getAllGamesByDay() {
  return {
    yesterday: getGamesByDay('yesterday'),
    // Use the flat games Map for today — it's updated per-game and never overwritten
    // by subsequent adapter polls (unlike the gamesByDay bucket).
    today:     getAllTodayGames(),
    tomorrow:  getGamesByDay('tomorrow'),
  }
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

/**
 * @param {object} alert - Alert object with a `timestamp` ISO string
 */
export function addAlert(alert) {
  alerts.push(alert)
}

/**
 * Returns alerts from the last hour, newest first.
 * @returns {object[]}
 */
export function getRecentAlerts() {
  const cutoff = Date.now() - ALERT_TTL_MS
  return alerts
    .filter((a) => new Date(a.timestamp).getTime() > cutoff)
    .slice()
    .reverse()
}

// ─── Player stats cache ──────────────────────────────────────────────────────

const PLAYER_STATS_TTL_MS = 10 * 60 * 1000  // 10 minutes
const playerStats = new Map()                // id → { stats, expiresAt }

/**
 * @param {string|number} id - MLB person ID
 * @returns {object|null} Cached stats or null if missing/expired
 */
export function getPlayerStats(id) {
  const entry = playerStats.get(String(id))
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    playerStats.delete(String(id))
    return null
  }
  return entry.stats
}

/**
 * @param {string|number} id - MLB person ID
 * @param {object} stats - Stats to cache ({ hitting?, pitching? })
 * @param {number} [ttlMs] - TTL in ms (default 10 min)
 */
export function setPlayerStats(id, stats, ttlMs = PLAYER_STATS_TTL_MS) {
  playerStats.set(String(id), { stats, expiresAt: Date.now() + ttlMs })
}

// ─── Playoffs cache ───────────────────────────────────────────────────────────

const playoffs = new Map()  // league → { bracket, expiresAt }
const PLAYOFFS_CACHE_TTL_MS = 10 * 60 * 1000

/**
 * @param {'mlb'|'nhl'|'nba'} league
 * @returns {object|null} Cached PlayoffBracket or null if missing/expired
 */
export function getPlayoffBracket(league) {
  const entry = playoffs.get(league)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    playoffs.delete(league)
    return null
  }
  return entry.bracket
}

/**
 * @param {'mlb'|'nhl'|'nba'} league
 * @param {object} bracket - PlayoffBracket to cache
 * @param {number} [ttlMs] - TTL in ms (default 10 min)
 */
export function setPlayoffBracket(league, bracket, ttlMs = PLAYOFFS_CACHE_TTL_MS) {
  playoffs.set(league, { bracket, expiresAt: Date.now() + ttlMs })
}

/**
 * @returns {{ mlb: object|null, nhl: object|null, nba: object|null }}
 */
export function getAllPlayoffs() {
  return {
    mlb: getPlayoffBracket('mlb'),
    nhl: getPlayoffBracket('nhl'),
    nba: getPlayoffBracket('nba'),
  }
}

/**
 * Clears all game cache (useful for testing).
 */
export function clearCache() {
  games.clear()
  gamesByDay.clear()
  alerts.length = 0
  playerStats.clear()
  playoffs.clear()
}
