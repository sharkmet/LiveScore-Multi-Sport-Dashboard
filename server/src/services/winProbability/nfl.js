import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const weights = require('../../models/weights/nfl-weights.json')

const w = weights.in_game
const wp = weights.pregame

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x))
}

function clamp(p) {
  return Math.max(0.01, Math.min(0.99, p))
}

function parseClock(clockStr) {
  if (!clockStr) return 900
  const [m, s] = clockStr.split(':').map(Number)
  return ((m || 0) * 60) + (s || 0)
}

function parseWinPct(record) {
  if (!record) return 0.5
  const m = String(record).match(/(\d+)-(\d+)(?:-(\d+))?/)
  if (!m) return 0.5
  const wins = parseInt(m[1], 10)
  const losses = parseInt(m[2], 10)
  const ties = parseInt(m[3] ?? 0, 10)
  const gp = wins + losses + ties
  return gp > 0 ? (wins + 0.5 * ties) / gp : 0.5
}

export function predictNFL(gameEvent) {
  try {
    const status = gameEvent.status
    const extras = gameEvent.nflExtras ?? {}

    if (status === 'final') {
      const home = gameEvent.score?.home ?? 0
      const away = gameEvent.score?.away ?? 0
      if (home > away) return 1.0
      if (away > home) return 0.0
      return 0.5
    }

    if (status === 'scheduled' || status === 'warmup') {
      const homeWinPct = parseWinPct(gameEvent.homeTeam?.record)
      const awayWinPct = parseWinPct(gameEvent.awayTeam?.record)
      const z = wp.bias + wp.home_advantage + wp.win_pct_diff * (homeWinPct - awayWinPct)
      return clamp(sigmoid(z))
    }

    const homeScore = gameEvent.score?.home ?? 0
    const awayScore = gameEvent.score?.away ?? 0
    const scoreDiff = homeScore - awayScore
    const quarter = gameEvent.period?.current ?? 1
    const secsInQ = parseClock(extras.clock)
    const quartersLeft = Math.max(0, 4 - quarter)
    const secondsRemaining = Math.max(0, secsInQ + quartersLeft * 900)

    // Hard rules for extreme late-game states
    if (secondsRemaining < 120 && Math.abs(scoreDiff) >= 17) return scoreDiff > 0 ? 0.99 : 0.01
    if (secondsRemaining < 300 && Math.abs(scoreDiff) >= 25) return scoreDiff > 0 ? 0.99 : 0.01
    if (secondsRemaining < 30) {
      if (extras.possession === 'home' && scoreDiff > 0) return 0.99
      if (extras.possession === 'away' && scoreDiff < 0) return 0.01
    }

    const logSecsRemaining = Math.log(secondsRemaining + 1)
    const scoreDiffXTime   = scoreDiff * (1 - secondsRemaining / 3600)
    const possession       = extras.possession ?? null
    const possessionSign   = possession === 'home' ? 1 : possession === 'away' ? -1 : 0
    const fieldPosition    = extras.yardLine ?? 50
    const fieldPosSigned   = ((fieldPosition - 50) / 50) * possessionSign
    const down             = extras.down ?? 0
    const distance         = extras.distance ?? 0
    const isRedZone        = extras.isRedZone ? 1 : 0
    const isGoalToGo       = (isRedZone && distance > 0 && distance <= (extras.yardLine ?? 100)) ? 1 : 0
    const timeoutDiff      = (extras.timeoutsHome ?? 3) - (extras.timeoutsAway ?? 3)
    const isTwoMin         = (quarter === 2 && secondsRemaining <= 120 + quartersLeft * 900) || (quarter === 4 && secondsRemaining <= 120) ? 1 : 0
    const isOvertime       = quarter >= 5 ? 1 : 0

    const z = w.bias
      + w.score_diff            * scoreDiff
      + w.seconds_remaining     * secondsRemaining
      + w.log_seconds_remaining * logSecsRemaining
      + w.score_diff_x_time     * scoreDiffXTime
      + w.field_pos_signed      * fieldPosSigned
      + w.possession_sign       * possessionSign
      + w.down                  * down
      + w.distance_to_first     * distance
      + w.is_red_zone           * isRedZone
      + w.is_goal_to_go         * isGoalToGo
      + w.timeout_diff          * timeoutDiff
      + w.is_two_minute_warning * isTwoMin
      + w.is_overtime           * isOvertime
      + w.home_advantage        * 1

    return clamp(sigmoid(z))
  } catch {
    return 0.5
  }
}
