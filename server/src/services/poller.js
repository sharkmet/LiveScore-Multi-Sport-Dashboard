/**
 * Polling service.
 * - MLB live: 5s  (no client-side clock, every pitch matters)
 * - NHL/NBA/NFL live: 10s  (client countdown handles clock display)
 * - Any league, no live games: 5min
 * - Yesterday/Tomorrow: once on startup, refreshed every 30min.
 */

import adapters from '../adapters/index.js'
import { getGame, setGame, getAllTodayGames, setDayGames, setPlayoffBracket } from './cache.js'
import { winProbService } from '../models/index.js'
import { fetchPlayoffs } from './standings.js'

const MLB_LIVE_INTERVAL_MS      = 5_000        // 5s — MLB has no client clock
const CLOCK_LIVE_INTERVAL_MS    = 10_000       // 10s — client countdown handles clock
const SCHEDULE_POLL_INTERVAL_MS = 300_000      // 5min when no live games
const STATIC_DAYS_INTERVAL_MS   = 30 * 60_000  // 30min for yesterday/tomorrow
const PLAYOFFS_POLL_INTERVAL_MS = 10 * 60_000  // 10min for playoff brackets

// Per-league last-poll timestamp (ms). Starts at 0 so all adapters poll immediately.
const lastPollAt = {}

// Intra-period win probability samples keyed by gameId.
// Accumulates live samples between period-end commits so the chart shows a dense curve.
const winProbAccumulator = new Map()

let pollTimer = null
let staticDaysTimer = null
let playoffsPollTimer = null

/**
 * Start the polling loop.
 * @param {function} onUpdate        - Called with (prev, GameEvent) whenever a game changes.
 * @param {function} onSnapshotReady - Called once after static days are loaded (for initial WS push).
 * @param {function} [onPlayoffUpdate] - Called with (league, bracket) whenever a playoff bracket updates.
 */
export async function startPolling(onUpdate, onSnapshotReady, onPlayoffUpdate) {
  console.log('[poller] Starting polling loop...')
  // Fetch yesterday and tomorrow once up front, then schedule repeats
  await fetchStaticDays(onUpdate)
  // Fetch all playoff brackets up front
  await pollAllPlayoffs(onPlayoffUpdate)
  if (onSnapshotReady) onSnapshotReady()
  staticDaysTimer = setInterval(() => fetchStaticDays(onUpdate), STATIC_DAYS_INTERVAL_MS)
  // Today's live loop
  await poll(onUpdate)
}

/**
 * Stop all polling.
 */
export function stopPolling() {
  if (pollTimer) {
    clearTimeout(pollTimer)
    pollTimer = null
  }
  if (staticDaysTimer) {
    clearInterval(staticDaysTimer)
    staticDaysTimer = null
  }
  if (playoffsPollTimer) {
    clearTimeout(playoffsPollTimer)
    playoffsPollTimer = null
  }
  console.log('[poller] Stopped')
}

// ─── Today loop ───────────────────────────────────────────────────────────────

async function poll(onUpdate) {
  const now = Date.now()
  for (const adapter of adapters) {
    if (isAdapterDue(adapter, now)) {
      await pollTodayGames(adapter, onUpdate)
      lastPollAt[adapter.league] = Date.now()
    }
  }

  const tickMs = nextTickMs()
  console.log(`[poller] Next tick in ${tickMs / 1000}s`)
  pollTimer = setTimeout(() => poll(onUpdate), tickMs)
}

function liveIntervalFor(league) {
  return league === 'mlb' ? MLB_LIVE_INTERVAL_MS : CLOCK_LIVE_INTERVAL_MS
}

function isAdapterDue(adapter, now) {
  const games = getAllTodayGames().filter(g => g.league === adapter.league)
  const hasLive = games.some(g => g.status === 'live' || g.status === 'warmup')
  const interval = hasLive ? liveIntervalFor(adapter.league) : SCHEDULE_POLL_INTERVAL_MS
  return (now - (lastPollAt[adapter.league] ?? 0)) >= interval
}

function nextTickMs() {
  const hasLive = getAllTodayGames().some(g => g.status === 'live' || g.status === 'warmup')
  return hasLive ? MLB_LIVE_INTERVAL_MS : SCHEDULE_POLL_INTERVAL_MS
}

async function pollTodayGames(adapter, onUpdate) {
  try {
    const games = await adapter.fetchSchedule(new Date(), 'today')
    const updatedGames = []

    for (const game of games) {
      const prev = getGame(game.gameId)

      let current = { ...game, scheduleDay: 'today' }

      const wentFinal = prev && prev.status === 'live' && game.status === 'final'
      // Also hydrate final games that have no box score yet (e.g. server restarted after game ended)
      const needsHydration = game.status === 'final' && !prev?.boxScore
      if (game.status === 'live' || game.status === 'warmup' || wentFinal || needsHydration) {
        try {
          const live = await adapter.fetchLiveGame(game.gameId)
          current = { ...live, scheduleDay: 'today' }
        } catch (err) {
          console.warn(`[poller] fetchLiveGame(${game.gameId}) error: ${err.message}`)
        }
      }

      // Preserve lineup/boxScore if schedule re-fetch no longer includes it
      if (!current.lineup && prev?.lineup) {
        current = { ...current, lineup: prev.lineup }
      }
      if (!current.boxScore && prev?.boxScore) {
        current = { ...current, boxScore: prev.boxScore }
      }

      // Compute win probability synchronously (reads from stats cache)
      const winProb = winProbService.predict(current)
      const timeline = buildLiveTimeline(current, winProb)
      current = {
        ...current,
        winProbability: { home: winProb, away: parseFloat((1 - winProb).toFixed(3)) },
        winProbabilityTimeline: timeline,
      }

      setGame(current.gameId, current)
      updatedGames.push(current)

      if (hasChanged(prev, current)) {
        onUpdate(prev ?? null, current)
      }
    }

    setDayGames('today', updatedGames)
  } catch (err) {
    console.error(`[poller] ${adapter.league} today poll error: ${err.message}`)
  }
}

// ─── Playoffs ─────────────────────────────────────────────────────────────────

async function pollAllPlayoffs(onPlayoffUpdate) {
  for (const league of ['nhl', 'nba', 'mlb', 'nfl']) {
    try {
      const bracket = await fetchPlayoffs(league)
      setPlayoffBracket(league, bracket)
      if (onPlayoffUpdate) onPlayoffUpdate(league, bracket)
      console.log(`[poller] ${league} playoffs loaded (${bracket.rounds.length} rounds)`)
    } catch (err) {
      console.error(`[poller] ${league} playoffs fetch error: ${err.message}`)
    }
  }
  playoffsPollTimer = setTimeout(() => pollAllPlayoffs(onPlayoffUpdate), PLAYOFFS_POLL_INTERVAL_MS)
}

// ─── Yesterday / Tomorrow ─────────────────────────────────────────────────────

async function fetchStaticDays(onUpdate) {
  // Collect games from ALL adapters for each day before storing,
  // so adapters don't overwrite each other's data.
  for (const day of ['yesterday', 'tomorrow']) {
    const date = new Date()
    if (day === 'yesterday') date.setDate(date.getDate() - 1)
    if (day === 'tomorrow')  date.setDate(date.getDate() + 1)

    const allGames = []
    for (const adapter of adapters) {
      try {
        const games = await adapter.fetchSchedule(date, day)
        const hydrated = []
        for (const g of games) {
          let game = { ...g, scheduleDay: day }
          // Hydrate final games with box score / scoring plays
          if (game.status === 'final' && !game.boxScore) {
            try {
              const live = await adapter.fetchLiveGame(game.gameId)
              if (live) game = { ...live, scheduleDay: day }
            } catch (err) {
              console.warn(`[poller] ${adapter.league} ${day} hydrate(${game.gameId}): ${err.message}`)
            }
          }
          hydrated.push(game)
        }
        allGames.push(...hydrated)
        // Fire-and-forget stats prefetch for model warm-up
        winProbService.prefetchStats(hydrated)
        console.log(`[poller] ${adapter.league} ${day}: ${hydrated.length} games loaded`)
      } catch (err) {
        console.error(`[poller] ${adapter.league} ${day} fetch error: ${err.message}`)
      }
    }
    setDayGames(day, allGames)
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a win-probability timeline for the chart.
 *
 * - MLB: return the adapter's timeline unchanged (MLB API provides per-play data).
 * - NHL/NBA/NFL live: merge the adapter's authoritative period-end points with
 *   intra-period samples accumulated across polls, then append the new sample.
 * - Non-live: return the adapter's timeline as-is.
 */
function buildLiveTimeline(game, winProb) {
  const adapterTimeline = game.winProbabilityTimeline ?? []

  // If the adapter already provides a rich per-play timeline (MLB with API WP data), use it
  if (game.status !== 'live') {
    if (game.status === 'final') winProbAccumulator.delete(game.gameId)
    return adapterTimeline
  }
  if (adapterTimeline.length > 5) {
    // Adapter has authoritative per-play data — use it directly
    return adapterTimeline
  }

  const gameId = game.gameId
  const currentPeriod = game.period?.current ?? 0
  const clock = game.period?.timeRemaining ?? null

  // Don't accumulate new WP points during intermission — score is frozen and the
  // model would just add identical points at the period boundary every 10 seconds.
  const inIntermission = game.matchup?.period?.inIntermission || game.period?.inHalftime
  const baseline = adapterTimeline.filter(p => p.period < currentPeriod)
  const accumulated = (winProbAccumulator.get(gameId) ?? []).filter(p => p.period >= currentPeriod)

  if (inIntermission) {
    return [...baseline, ...accumulated].slice(-400)
  }

  // Build a readable label: "Q3 5:24" or just "Q3" if no clock
  const periodLabel = clock
    ? `${game.period?.label ?? `P${currentPeriod}`} ${clock}`
    : (game.period?.label ?? `P${currentPeriod}`)

  const newPoint = {
    home: parseFloat(winProb.toFixed(3)),
    period: currentPeriod,
    periodLabel,
    gameProgress: computeLiveGameProgress(game, currentPeriod),
  }

  const newAccumulated = [...accumulated, newPoint].slice(-200)
  winProbAccumulator.set(gameId, newAccumulated)

  return [...baseline, ...newAccumulated].slice(-400)
}

function computeLiveGameProgress(game, period) {
  const league = game.league?.toLowerCase()
  const clockSecs = game.period?.clockSeconds ?? 0
  if (league === 'nba') {
    if (period > 4) return 1.0
    return Math.min(1, ((period - 1) * 720 + Math.max(0, 720 - clockSecs)) / 2880)
  }
  if (league === 'nfl') {
    if (period > 4) return 1.0
    return Math.min(1, ((period - 1) * 900 + Math.max(0, 900 - clockSecs)) / 3600)
  }
  if (league === 'nhl') {
    if (period > 3) return 1.0
    return Math.min(1, ((period - 1) * 1200 + Math.max(0, 1200 - clockSecs)) / 3600)
  }
  // MLB and unknown: return null so chart falls back to inning-based calculation
  return null
}

function hasChanged(prev, curr) {
  if (!prev) return true
  return (
    prev.updatedAt !== curr.updatedAt ||
    prev.status !== curr.status ||
    prev.score.home !== curr.score.home ||
    prev.score.away !== curr.score.away ||
    prev.period.current !== curr.period.current ||
    prev.period.label !== curr.period.label
  )
}
