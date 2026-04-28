/**
 * Alert engine.
 * Detects: upset, comeback, blowout, no-hitter watch, momentum shift.
 *
 * Called on every game update with (previousGameEvent, currentGameEvent).
 * Returns an array of new Alert objects (may be empty).
 * Deduplicates: same alert type never fires twice for the same game per session.
 */

// Per-game state for comeback tracking — survives across polls
const gameState = new Map()  // gameId → { maxHomeDeficit: number, maxAwayDeficit: number }

// Dedup set — "type:gameId" keys prevent double-firing
const firedAlerts = new Set()

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseWinPct(record) {
  if (!record) return null
  const [w, l] = record.split('-').map(Number)
  if (isNaN(w) || isNaN(l) || w + l === 0) return null
  return w / (w + l)
}

function makeAlert(gameId, type, severity, title, message) {
  return {
    id: `${type}-${gameId}-${Date.now()}`,
    gameId,
    type,
    severity,
    title,
    message,
    timestamp: new Date().toISOString(),
  }
}

// ─── Rules ────────────────────────────────────────────────────────────────────

/**
 * Upset: underdog (by win% >= 0.05) leads by 3+ runs in inning 5+.
 */
function detectUpset(_prev, curr) {
  const { score, homeTeam, awayTeam, period, status } = curr
  if (status !== 'live') return null
  if (period.current < 5) return null

  const runDiff = score.home - score.away
  if (Math.abs(runDiff) < 3) return null

  const homeWinPct = parseWinPct(homeTeam.record)
  const awayWinPct = parseWinPct(awayTeam.record)
  if (homeWinPct === null || awayWinPct === null) return null

  const leadingTeam = runDiff > 0 ? homeTeam : awayTeam
  const leadingPct  = runDiff > 0 ? homeWinPct : awayWinPct
  const trailingPct = runDiff > 0 ? awayWinPct : homeWinPct

  // Leading team must be the underdog — at least 5pp lower win%
  if (leadingPct >= trailingPct - 0.05) return null

  return makeAlert(
    curr.gameId,
    'upset',
    'warning',
    'Upset Alert',
    `${leadingTeam.abbreviation} leads by ${Math.abs(runDiff)} in the ${period.label} as the underdog`,
  )
}

/**
 * Comeback: a team that trailed by 4+ now leads.
 * Uses per-game state to track the max deficit seen for each team.
 */
function detectComeback(_prev, curr) {
  const { score, homeTeam, awayTeam, status, gameId } = curr
  if (status !== 'live') return null

  const state = gameState.get(gameId) ?? { maxHomeDeficit: 0, maxAwayDeficit: 0 }

  // home deficit = how much home was behind (positive when away leads)
  const homeDeficit = score.away - score.home
  const awayDeficit = score.home - score.away

  if (homeDeficit > state.maxHomeDeficit) state.maxHomeDeficit = homeDeficit
  if (awayDeficit > state.maxAwayDeficit) state.maxAwayDeficit = awayDeficit
  gameState.set(gameId, state)

  // Comeback for home — was down 4+, now leads
  if (state.maxHomeDeficit >= 4 && score.home > score.away) {
    return makeAlert(
      gameId,
      'comeback',
      'critical',
      'Comeback Alert',
      `${homeTeam.abbreviation} overcame a ${state.maxHomeDeficit}-run deficit — now leads ${score.home}-${score.away}`,
    )
  }

  // Comeback for away — was down 4+, now leads
  if (state.maxAwayDeficit >= 4 && score.away > score.home) {
    return makeAlert(
      gameId,
      'comeback',
      'critical',
      'Comeback Alert',
      `${awayTeam.abbreviation} overcame a ${state.maxAwayDeficit}-run deficit — now leads ${score.away}-${score.home}`,
    )
  }

  return null
}

/**
 * Blowout: run differential reaches 10+.
 */
function detectBlowout(_prev, curr) {
  const { score, homeTeam, awayTeam, status } = curr
  if (status !== 'live') return null

  const diff = Math.abs(score.home - score.away)
  if (diff < 10) return null

  const leadingTeam  = score.home > score.away ? homeTeam : awayTeam
  const leadingScore = score.home > score.away ? score.home : score.away
  const trailingScore = score.home > score.away ? score.away : score.home

  return makeAlert(
    curr.gameId,
    'blowout',
    'info',
    'Blowout Alert',
    `${leadingTeam.abbreviation} leads ${leadingScore}-${trailingScore}`,
  )
}

/**
 * No-hitter watch: one team has 0 hits through inning 6+.
 * Requires `hits: { home, away }` on the GameEvent (set by the adapter).
 */
function detectNoHitter(_prev, curr) {
  const { status, period, homeTeam, awayTeam, hits } = curr
  if (status !== 'live') return null
  if (period.current < 6) return null
  if (!hits) return null

  // hits.away = away team's hit total; 0 means home pitcher has no-hit bid
  if (hits.away === 0) {
    return makeAlert(
      curr.gameId,
      'no_hitter',
      'critical',
      'No-Hitter Watch',
      `${awayTeam.abbreviation} has no hits through ${period.current} innings`,
    )
  }

  if (hits.home === 0) {
    return makeAlert(
      curr.gameId,
      'no_hitter',
      'critical',
      'No-Hitter Watch',
      `${homeTeam.abbreviation} has no hits through ${period.current} innings`,
    )
  }

  return null
}

/**
 * Momentum shift: a team scored 3+ runs in the latest inning and the overall
 * margin is now within 1 run.
 */
function detectMomentumShift(prev, curr) {
  if (!prev) return null
  const { score, homeTeam, awayTeam, status, timeline } = curr
  if (status !== 'live') return null
  if (!timeline || timeline.length === 0) return null

  const lastEntry = timeline[timeline.length - 1]
  const margin = Math.abs(score.home - score.away)

  if (lastEntry.homeScore >= 3 && margin <= 1) {
    return makeAlert(
      curr.gameId,
      'momentum_shift',
      'warning',
      'Momentum Shift',
      `${homeTeam.abbreviation} scored ${lastEntry.homeScore} in the ${lastEntry.periodLabel} — margin now ${margin}`,
    )
  }

  if (lastEntry.awayScore >= 3 && margin <= 1) {
    return makeAlert(
      curr.gameId,
      'momentum_shift',
      'warning',
      'Momentum Shift',
      `${awayTeam.abbreviation} scored ${lastEntry.awayScore} in the ${lastEntry.periodLabel} — margin now ${margin}`,
    )
  }

  return null
}

// ─── Public API ───────────────────────────────────────────────────────────────

import { detectNhlAlerts } from './nhl-alerts.js'
import { detectNbaAlerts } from './nba-alerts.js'

/**
 * Run all alert rules against a game update.
 * @param {object|null} prev - Previous GameEvent snapshot (null on first poll)
 * @param {object} curr - Current GameEvent
 * @returns {object[]} New Alert objects to broadcast and store
 */
export function detectAlerts(prev, curr) {
  if (!curr) return []
  // Route league-specific games to their own alert engines
  if (curr.league === 'nhl') return detectNhlAlerts(prev, curr)
  if (curr.league === 'nba') return detectNbaAlerts(prev, curr)
  // Skip games that can't produce alerts
  if (curr.status === 'scheduled' || curr.status === 'final') return []

  const rules = [
    () => detectUpset(prev, curr),
    () => detectComeback(prev, curr),
    () => detectBlowout(prev, curr),
    () => detectNoHitter(prev, curr),
    () => detectMomentumShift(prev, curr),
  ]

  const newAlerts = []

  for (const rule of rules) {
    const alert = rule()
    if (!alert) continue

    const key = `${alert.type}:${curr.gameId}`
    if (firedAlerts.has(key)) continue

    firedAlerts.add(key)
    newAlerts.push(alert)
  }

  return newAlerts
}

/**
 * Clear per-game state (useful for testing or daily reset).
 * @param {string} [gameId] - If omitted, clears all state.
 */
export function clearAlertState(gameId) {
  if (gameId) {
    gameState.delete(gameId)
    for (const key of firedAlerts) {
      if (key.endsWith(`:${gameId}`)) firedAlerts.delete(key)
    }
  } else {
    gameState.clear()
    firedAlerts.clear()
  }
}
