import { normalCDF } from './utils/normalCDF.js'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const weights = require('./weights/nba.json')
const teamRatings = require('./teamRatings/nba.json')

const {
  totalSecondsRegulation,
  totalSecondsOT,
  sigmaFullGame,
  homeCourtAdvantagePoints,
  possessionValuePoints,
  garbageTimeSigmaThreshold,
} = weights.constants

export function predictNBA(gameEvent) {
  try {
    const lead = (gameEvent.score?.home ?? 0) - (gameEvent.score?.away ?? 0)
    const period = gameEvent.period?.current ?? 1
    const isOvertime = gameEvent.isOvertime ?? (period > 4)

    const totalSeconds = isOvertime
      ? totalSecondsOT * Math.max(1, period - 3)
      : totalSecondsRegulation

    const secondsRemaining = computeSecondsRemaining(gameEvent)
    const t = Math.max(secondsRemaining, 1) / totalSeconds

    const homeRating = teamRatings.ratings[gameEvent.homeTeam?.abbreviation] ?? 0
    const awayRating = teamRatings.ratings[gameEvent.awayTeam?.abbreviation] ?? 0
    // Net rating is per 100 possessions; ~0.55 converts to expected per-game point margin
    const ratingDiff = (homeRating - awayRating) * 0.55

    const hca = homeCourtAdvantagePoints
    const expectedRemaining = (hca + ratingDiff) * t

    // Possession most valuable in final minutes; scale linearly with (1 - t)
    const homePossession = gameEvent.homePossession ?? 0.5
    const possessionAdj = (homePossession - 0.5) * possessionValuePoints * Math.min(1, (1 - t) * 4)

    const mu = lead + expectedRemaining + possessionAdj
    const sigma = sigmaFullGame * Math.sqrt(t)

    if (sigma < garbageTimeSigmaThreshold) {
      if (lead > 0) return 0.999
      if (lead < 0) return 0.001
      return 0.5
    }

    return normalCDF(mu / sigma)
  } catch {
    return 0.5
  }
}

function computeSecondsRemaining(gameEvent) {
  const period = gameEvent.period?.current ?? 1
  // Prefer explicit clockSeconds; fall back to 0 (assumes period start)
  const clock = gameEvent.period?.clockSeconds ?? 0
  if (period > 4) return clock
  const periodsLeftAfterCurrent = Math.max(0, 4 - period)
  return clock + periodsLeftAfterCurrent * 720
}
