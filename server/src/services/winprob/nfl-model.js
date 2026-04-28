/**
 * NFL logistic regression win probability model.
 * 15-feature pure JS implementation — no ML libraries.
 * Weights loaded from nfl-weights.json at module load time.
 *
 * Priority order in the adapter:
 *   1. ESPN predictor field (if present)
 *   2. This model (predict())
 *   3. nfl-fallback.js (defensive only)
 */

import { createRequire } from 'module'
import { fallbackWinProb } from './nfl-fallback.js'

// Load weights synchronously at module init
const require = createRequire(import.meta.url)
const weights = require('./weights/nfl-weights.json')

function sigmoid(z) {
  return 1 / (1 + Math.exp(-z))
}

function clamp(val, lo, hi) {
  return Math.min(hi, Math.max(lo, val))
}

/**
 * Extract the 15-feature vector from a GameEvent.
 * Every missing value defaults to 0 (or its documented default).
 */
function extractFeatures(gameEvent) {
  const status    = gameEvent.status ?? 'scheduled'
  const score     = gameEvent.score  ?? {}
  const period    = gameEvent.period ?? {}
  const extras    = gameEvent.nflExtras ?? {}

  const homeScore = score.home ?? 0
  const awayScore = score.away ?? 0
  const scoreDiff = homeScore - awayScore

  const quarter = period.current ?? 1

  // Parse clock string "MM:SS" → seconds remaining in current quarter
  const clockStr = extras.clock ?? '15:00'
  const colonIdx = clockStr.indexOf(':')
  const clockMins = colonIdx >= 0 ? parseInt(clockStr.slice(0, colonIdx), 10) : 15
  const clockSecs = colonIdx >= 0 ? parseInt(clockStr.slice(colonIdx + 1), 10) : 0
  const secsInQuarter = (isNaN(clockMins) ? 15 : clockMins) * 60 + (isNaN(clockSecs) ? 0 : clockSecs)

  const quartersLeft     = Math.max(0, 4 - quarter)
  const secondsRemaining = clamp(secsInQuarter + quartersLeft * 900, 0, 3600)
  const logSecondsRemaining = Math.log(secondsRemaining + 1)
  const scoreDiffXTime   = scoreDiff * (1 - secondsRemaining / 3600)

  const possession      = extras.possession ?? null   // 'home' | 'away' | null
  const possessionSign  = possession === 'home' ? 1 : possession === 'away' ? -1 : 0

  const fieldPosition   = extras.yardLine ?? 50      // 0-100 from possessing team's perspective
  const fieldPosSigned  = ((fieldPosition - 50) / 50) * possessionSign

  const down           = extras.down ?? 0
  const distanceToFirst = extras.distance ?? 0
  const isRedZone      = extras.isRedZone ? 1 : 0
  const isGoalToGo     = (isRedZone && distanceToFirst <= (extras.yardLine ?? 100)) ? 1 : 0
  const timeoutDiff    = (extras.timeoutsHome ?? 3) - (extras.timeoutsAway ?? 3)

  const isTwoMinuteWarning = (
    (quarter === 2 && secondsRemaining <= 120 + (quartersLeft * 900)) ||
    (quarter === 4 && secondsRemaining <= 120)
  ) ? 1 : 0

  const isOvertime  = quarter >= 5 ? 1 : 0
  const homeField   = 1

  return {
    status,
    secondsRemaining,
    scoreDiff,
    scoreDiffXTime,
    logSecondsRemaining,
    fieldPosSigned,
    possessionSign,
    down,
    distanceToFirst,
    isRedZone,
    isGoalToGo,
    timeoutDiff,
    isTwoMinuteWarning,
    isOvertime,
    homeField,
    // raw values for special-case overrides
    homeScore,
    awayScore,
    possession,
    quarter,
    secsInQuarter,
  }
}

/**
 * Predict win probability for home and away teams.
 * @param {object} gameEvent - Normalized GameEvent object
 * @returns {{ home: number, away: number }}
 */
export function predict(gameEvent) {
  try {
    const f = extractFeatures(gameEvent)

    // Special case: scheduled games
    if (f.status === 'scheduled') {
      return { home: 0.55, away: 0.45 }
    }

    // Special case: final games
    if (f.status === 'final') {
      if (f.homeScore > f.awayScore) return { home: 1.0, away: 0.0 }
      if (f.awayScore > f.homeScore) return { home: 0.0, away: 1.0 }
      return { home: 0.5, away: 0.5 }
    }

    // Special case: extreme score differential late in game (2 possessions with < 2 min)
    if (f.secondsRemaining < 120 && f.scoreDiff >= 17) return { home: 0.99, away: 0.01 }
    if (f.secondsRemaining < 120 && f.scoreDiff <= -17) return { home: 0.01, away: 0.99 }

    // Special case: 3+ possession lead with < 5 min
    if (f.secondsRemaining < 300 && f.scoreDiff >= 25) return { home: 0.99, away: 0.01 }
    if (f.secondsRemaining < 300 && f.scoreDiff <= -25) return { home: 0.01, away: 0.99 }

    // Special case: ball-holder leading with < 30 seconds
    if (f.secondsRemaining < 30 && f.possession === 'home' && f.scoreDiff > 0) return { home: 0.99, away: 0.01 }
    if (f.secondsRemaining < 30 && f.possession === 'away' && f.scoreDiff < 0) return { home: 0.01, away: 0.99 }

    // Logistic regression
    const z = weights.b_0
      + weights.w_score_diff    * f.scoreDiff
      + weights.w_seconds       * f.secondsRemaining
      + weights.w_log_seconds   * f.logSecondsRemaining
      + weights.w_score_x_time  * f.scoreDiffXTime
      + weights.w_field_pos     * f.fieldPosSigned
      + weights.w_possession    * f.possessionSign
      + weights.w_down          * f.down
      + weights.w_distance      * f.distanceToFirst
      + weights.w_red_zone      * f.isRedZone
      + weights.w_goal_to_go    * f.isGoalToGo
      + weights.w_timeout       * f.timeoutDiff
      + weights.w_two_min       * f.isTwoMinuteWarning
      + weights.w_ot            * f.isOvertime
      + weights.w_home_field    * f.homeField

    const homeWinProb = clamp(sigmoid(z), 0.01, 0.99)
    return { home: homeWinProb, away: clamp(1 - homeWinProb, 0.01, 0.99) }
  } catch {
    return fallbackWinProb(gameEvent)
  }
}

export function getModelVersion() {
  return weights._metadata?.version ?? '1.0.0'
}
