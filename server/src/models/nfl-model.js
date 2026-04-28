/**
 * NFLModel — logistic regression win probability for NFL games.
 * 15-feature model using score differential, time remaining, field position,
 * possession, down/distance, and situational factors.
 *
 * Priority cascade:
 *   1. ESPN predictor field (set on gameEvent.winProbability before predict() is called)
 *   2. Special-case hard rules (final, extreme late score, etc.)
 *   3. Logistic regression (this model)
 *   4. Simple fallback from base class
 */
import { createRequire } from 'module'
import { BaseWinProbabilityModel } from './base-model.js'

const require = createRequire(import.meta.url)
const weights = require('./weights/nfl-weights.json')

function parseWinPct(record) {
  if (!record) return 0.5
  const m = String(record).match(/(\d+)-(\d+)(?:-(\d+))?/)
  if (!m) return 0.5
  const w = parseInt(m[1], 10)
  const l = parseInt(m[2], 10)
  const t = parseInt(m[3] ?? 0, 10)
  const gp = w + l + t
  if (gp === 0) return 0.5
  return (w + 0.5 * t) / gp
}

function parseClock(clockStr) {
  if (!clockStr) return 900 // default 15:00
  const colonIdx = clockStr.indexOf(':')
  if (colonIdx < 0) return 900
  const mins = parseInt(clockStr.slice(0, colonIdx), 10)
  const secs = parseInt(clockStr.slice(colonIdx + 1), 10)
  return (isNaN(mins) ? 15 : mins) * 60 + (isNaN(secs) ? 0 : secs)
}

export class NFLModel extends BaseWinProbabilityModel {
  constructor() {
    super(weights)
  }

  predict(game, _statsCache) {
    const status = game.status
    const extras = game.nflExtras ?? {}

    // Final game: definitive result
    if (status === 'final') {
      const home = game.score?.home ?? 0
      const away = game.score?.away ?? 0
      if (home > away) return 1.0
      if (away > home) return 0.0
      return 0.5
    }

    const homeScore = game.score?.home ?? 0
    const awayScore = game.score?.away ?? 0
    const scoreDiff = homeScore - awayScore
    const quarter   = game.period?.current ?? 1
    const secsInQ   = parseClock(extras.clock)
    const quartersLeft = Math.max(0, 4 - quarter)
    const secondsRemaining = Math.max(0, secsInQ + quartersLeft * 900)

    // Hard rule: extreme lead in final 2 minutes
    if (secondsRemaining < 120 && Math.abs(scoreDiff) >= 17) {
      return scoreDiff > 0 ? 0.99 : 0.01
    }
    // Hard rule: 3+ possession lead in final 5 minutes
    if (secondsRemaining < 300 && Math.abs(scoreDiff) >= 25) {
      return scoreDiff > 0 ? 0.99 : 0.01
    }
    // Hard rule: possessing team leading with < 30 seconds
    if (secondsRemaining < 30) {
      const possession = extras.possession ?? null
      if (possession === 'home' && scoreDiff > 0) return 0.99
      if (possession === 'away' && scoreDiff < 0) return 0.01
    }

    const features = this._extractInGameFeatures(game)
    return this.clamp(this.computeProbability(features, weights.in_game))
  }

  predictPregame(game, _statsCache) {
    const features = this._extractPregameFeatures(game)
    return this.clamp(this.computeProbability(features, weights.pregame))
  }

  extractFeatures(game, statsCache) {
    const status = game.status
    const isLive = status === 'live' || status === 'warmup'
    if (isLive) {
      const features = this._extractInGameFeatures(game)
      return this._buildFeatureVector(features, weights.in_game)
    }
    const features = this._extractPregameFeatures(game)
    return this._buildFeatureVector(features, weights.pregame)
  }

  _extractPregameFeatures(game) {
    const homeWinPct = parseWinPct(game.homeTeam?.record)
    const awayWinPct = parseWinPct(game.awayTeam?.record)
    return {
      home_advantage: 1,
      win_pct_diff:   homeWinPct - awayWinPct,
    }
  }

  _extractInGameFeatures(game) {
    const extras    = game.nflExtras ?? {}
    const homeScore = game.score?.home ?? 0
    const awayScore = game.score?.away ?? 0
    const scoreDiff = homeScore - awayScore
    const quarter   = game.period?.current ?? 1
    const secsInQ   = parseClock(extras.clock)
    const quartersLeft = Math.max(0, 4 - quarter)
    const secondsRemaining = Math.max(0, secsInQ + quartersLeft * 900)
    const logSecondsRemaining = Math.log(secondsRemaining + 1)
    const scoreDiffXTime   = scoreDiff * (1 - secondsRemaining / 3600)

    const possession     = extras.possession ?? null
    const possessionSign = possession === 'home' ? 1 : possession === 'away' ? -1 : 0
    const fieldPosition  = extras.yardLine ?? 50
    const fieldPosSigned = ((fieldPosition - 50) / 50) * possessionSign

    const down           = extras.down ?? 0
    const distanceToFirst = extras.distance ?? 0
    const isRedZone      = extras.isRedZone ? 1 : 0
    const isGoalToGo     = (isRedZone && distanceToFirst > 0 && distanceToFirst <= (extras.yardLine ?? 100)) ? 1 : 0
    const timeoutDiff    = (extras.timeoutsHome ?? 3) - (extras.timeoutsAway ?? 3)
    const isTwoMinuteWarning = (
      (quarter === 2 && secondsRemaining <= (120 + quartersLeft * 900)) ||
      (quarter === 4 && secondsRemaining <= 120)
    ) ? 1 : 0
    const isOvertime = quarter >= 5 ? 1 : 0

    return {
      score_diff:              scoreDiff,
      seconds_remaining:       secondsRemaining,
      log_seconds_remaining:   logSecondsRemaining,
      score_diff_x_time:       scoreDiffXTime,
      field_pos_signed:        fieldPosSigned,
      possession_sign:         possessionSign,
      down,
      distance_to_first:       distanceToFirst,
      is_red_zone:             isRedZone,
      is_goal_to_go:           isGoalToGo,
      timeout_diff:            timeoutDiff,
      is_two_minute_warning:   isTwoMinuteWarning,
      is_overtime:             isOvertime,
      home_advantage:          1,
    }
  }
}
