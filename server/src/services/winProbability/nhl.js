import { normalCDF } from './utils/normalCDF.js'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const weights = require('./weights/nhl.json')
const teamRatings = require('./teamRatings/nhl.json')

const c = weights.constants

export function predictNHL(gameEvent) {
  try {
    const lead = (gameEvent.score?.home ?? 0) - (gameEvent.score?.away ?? 0)
    const homeRating = teamRatings.ratings[gameEvent.homeTeam?.abbreviation] ?? 0
    const awayRating = teamRatings.ratings[gameEvent.awayTeam?.abbreviation] ?? 0
    const ratingDiff = homeRating - awayRating

    const period = gameEvent.period?.current ?? 1
    const isShootout = gameEvent.isShootout ?? false
    const isOvertime = gameEvent.isOvertime ?? (period > 3)

    if (isShootout) {
      return clamp(0.5 + c.shootoutRatingSlope * ratingDiff, 0.05, 0.95)
    }

    if (isOvertime) {
      if (lead > 0) return 1.0
      if (lead < 0) return 0.0
      return clamp(0.5 + c.otRatingSlope * ratingDiff, 0.1, 0.9)
    }

    const secondsRemaining = computeSecondsRemaining(gameEvent)
    const t = Math.max(secondsRemaining, 1) / c.totalSecondsReg

    const hia = c.homeIceGoals
    let expectedRemaining = (hia + ratingDiff) * t

    const pp = gameEvent.powerPlayState ?? derivePowerPlayStateFromLegacy(gameEvent)
    if (pp === 'home_pp')  expectedRemaining += c.ppBoost
    else if (pp === 'away_pp')  expectedRemaining -= c.ppBoost
    else if (pp === '5v3_home') expectedRemaining += c.ppBoost * 1.8
    else if (pp === '5v3_away') expectedRemaining -= c.ppBoost * 1.8

    let sigma = c.sigmaFullGame * Math.sqrt(t)

    const isEmptyNet = gameEvent.isEmptyNet ?? false
    if (isEmptyNet) {
      if (lead > 0) expectedRemaining += c.emptyNetLeadingBoost
      else expectedRemaining -= c.emptyNetTrailingBoost
      sigma *= c.emptyNetSigmaMult
    }

    if (sigma < 0.05) {
      if (lead > 0) return 0.998
      if (lead < 0) return 0.002
    }

    const mu = lead + expectedRemaining
    return clamp(normalCDF(mu / sigma), 0.001, 0.999)
  } catch {
    return 0.5
  }
}

function computeSecondsRemaining(gameEvent) {
  const period = gameEvent.period?.current ?? 1
  const clock = gameEvent.period?.clockSeconds ?? 0
  const periodsLeftAfterCurrent = Math.max(0, 3 - period)
  return clock + periodsLeftAfterCurrent * 1200
}

// Backward compat: convert legacy _powerPlayState number to string
function derivePowerPlayStateFromLegacy(gameEvent) {
  const ppState = gameEvent._powerPlayState
  if (ppState === 1)  return 'home_pp'
  if (ppState === -1) return 'away_pp'
  return 'even'
}

function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x))
}
