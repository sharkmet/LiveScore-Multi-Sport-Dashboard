/**
 * MLBModel — logistic regression win probability for MLB games.
 *
 * Priority cascade for live games:
 *   1. MLB API `_apiWinProbability` (from play endWinProbability)
 *   2. Logistic regression (this model)
 *   3. Closed-form sigmoid fallback (handled by WinProbabilityService)
 */
import { createRequire } from 'module'
import { BaseWinProbabilityModel } from './base-model.js'

const require = createRequire(import.meta.url)
const weights = require('./weights/mlb-weights.json')

// Run expectancy by base state index
const RUN_EXPECTANCY = [0.48, 0.86, 1.10, 1.30, 1.48, 1.78, 1.96, 2.29]

function ipToFloat(ipStr) {
  if (ipStr == null) return 0
  const s = String(ipStr)
  const [whole, outs] = s.split('.')
  return parseInt(whole, 10) + (parseInt(outs || '0', 10) / 3)
}

function winPctFromRecord(record) {
  if (!record) return 0.5
  const m = String(record).match(/(\d+)-(\d+)/)
  if (!m) return 0.5
  const w = parseInt(m[1], 10)
  const l = parseInt(m[2], 10)
  const total = w + l
  return total > 0 ? w / total : 0.5
}

function calcBaseRunnerIndex(runners) {
  if (!runners) return 0
  const first  = runners.first  ? 1 : 0
  const second = runners.second ? 1 : 0
  const third  = runners.third  ? 1 : 0
  return first | (second << 1) | (third << 2)
}

function calcLeverage(inning, runDiff, baseRunnerIdx) {
  const lateInning = inning >= 7 ? 1 : 0
  const closeGame  = Math.abs(runDiff) <= 1 ? 1 : 0
  const runners    = baseRunnerIdx > 0 ? 0.5 : 0
  return lateInning * 1.5 + closeGame * 1.0 + runners
}

function calcFatigue(pitcherStats) {
  if (!pitcherStats) return 0
  const ip = ipToFloat(pitcherStats.ip || pitcherStats.inningsPitched || '0')
  return Math.min(1, ip / 9)
}

export class MLBModel extends BaseWinProbabilityModel {
  constructor() {
    super(weights)
  }

  predict(game, statsCache) {
    // Priority 1: MLB API win probability
    if (game._apiWinProbability != null && !isNaN(game._apiWinProbability)) {
      return this.clamp(game._apiWinProbability)
    }

    const status = game.status?.state
    const isLive = status === 'live' || status === 'in_progress'

    if (isLive) {
      const features = this._extractInGameFeatures(game, statsCache)
      return this.clamp(this.computeProbability(features, weights.in_game))
    }

    return this.predictPregame(game, statsCache)
  }

  predictPregame(game, statsCache) {
    const features = this._extractPregameFeatures(game, statsCache)
    return this.clamp(this.computeProbability(features, weights.pregame))
  }

  _extractPregameFeatures(game, statsCache) {
    const homeWinPct = winPctFromRecord(game.homeTeam?.record)
    const awayWinPct = winPctFromRecord(game.awayTeam?.record)

    const homeStarterId = game._starterIds?.home
    const awayStarterId = game._starterIds?.away
    const homeStats = (homeStarterId && statsCache?.get(`mlb_pitcher_${homeStarterId}`)) || {}
    const awayStats = (awayStarterId && statsCache?.get(`mlb_pitcher_${awayStarterId}`)) || {}

    const homeEra  = parseFloat(homeStats.era  ?? 4.50)
    const awayEra  = parseFloat(awayStats.era  ?? 4.50)
    const homeWhip = parseFloat(homeStats.whip ?? 1.30)
    const awayWhip = parseFloat(awayStats.whip ?? 1.30)
    const homeK9   = parseFloat(homeStats.k9   ?? 8.00)
    const awayK9   = parseFloat(awayStats.k9   ?? 8.00)

    const homeTeamStats = statsCache?.get(`mlb_team_${game.homeTeam?.id}`) || {}
    const awayTeamStats = statsCache?.get(`mlb_team_${game.awayTeam?.id}`) || {}
    const homeOps = parseFloat(homeTeamStats.ops ?? 0.720)
    const awayOps = parseFloat(awayTeamStats.ops ?? 0.720)
    const homeBullpenEra = parseFloat(homeTeamStats.bullpenEra ?? 4.00)
    const awayBullpenEra = parseFloat(awayTeamStats.bullpenEra ?? 4.00)

    return {
      home_advantage:    1,
      record_diff:       homeWinPct - awayWinPct,
      starter_era_diff:  homeEra  - awayEra,
      starter_whip_diff: homeWhip - awayWhip,
      starter_k9_diff:   homeK9   - awayK9,
      team_ops_diff:     homeOps  - awayOps,
      bullpen_era_diff:  homeBullpenEra - awayBullpenEra,
    }
  }

  _extractInGameFeatures(game, statsCache) {
    const homeRuns = game.score?.home ?? 0
    const awayRuns = game.score?.away ?? 0
    const runDiff  = homeRuns - awayRuns

    const inning    = game.period?.inning ?? game.period?.current ?? 1
    const isTop     = game.period?.isTopHalf !== false
    const outs      = game.matchup?.count?.outs ?? game._currentOuts ?? 0

    const outsUsed     = Math.max(0, (inning - 1) * 6 + (isTop ? 0 : 3) + outs)
    const gameProgress = Math.min(1, outsUsed / 54)

    const runners       = game.matchup?.runners || game._baseRunners || {}
    const baseRunnerIdx = calcBaseRunnerIndex(runners)
    const leverage      = calcLeverage(inning, runDiff, baseRunnerIdx)

    const runnerValue   = RUN_EXPECTANCY[baseRunnerIdx] ?? 0
    const homeBatting   = !isTop
    const baseRunnersHome = homeBatting ? runnerValue : 0
    const baseRunnersAway = homeBatting ? 0 : runnerValue

    const homeWinPct = winPctFromRecord(game.homeTeam?.record)
    const awayWinPct = winPctFromRecord(game.awayTeam?.record)

    const homeStarterId = game._starterIds?.home
    const awayStarterId = game._starterIds?.away
    const homeStarterStats = (homeStarterId && statsCache?.get(`mlb_pitcher_${homeStarterId}`)) || {}
    const awayStarterStats = (awayStarterId && statsCache?.get(`mlb_pitcher_${awayStarterId}`)) || {}
    const homeStarterEra = parseFloat(homeStarterStats.era ?? 4.50)
    const awayStarterEra = parseFloat(awayStarterStats.era ?? 4.50)

    const fatigue  = calcFatigue(game.matchup?.pitcher)
    const momentum = this._calcMomentum(game)

    const boxscore = game._boxscore || {}
    const homeHits = boxscore.homeHits ?? game.hits?.home ?? 0
    const awayHits = boxscore.awayHits ?? game.hits?.away ?? 0

    return {
      run_diff:                runDiff,
      run_diff_x_progress:     runDiff * gameProgress,
      leverage,
      home_advantage:          1,
      record_diff:             homeWinPct - awayWinPct,
      starter_quality_diff:    homeStarterEra - awayStarterEra,
      current_pitcher_fatigue: fatigue,
      base_runners_home:       baseRunnersHome,
      base_runners_away:       baseRunnersAway,
      momentum,
      hit_diff:                homeHits - awayHits,
    }
  }

  /**
   * Extract the feature vector used for the last prediction.
   * Returns a FeatureVector with features, weights, bias, rawScore, probability.
   * Useful for debugging and logging.
   *
   * @param {object} game
   * @param {object} statsCache
   * @returns {object} FeatureVector
   */
  extractFeatures(game, statsCache) {
    if (game._apiWinProbability != null && !isNaN(game._apiWinProbability)) {
      return this._buildFeatureVector(
        { api_win_probability: game._apiWinProbability },
        { bias: 0, api_win_probability: 1.0 }
      )
    }

    const status = game.status?.state
    const isLive = status === 'live' || status === 'in_progress'

    if (isLive) {
      const features = this._extractInGameFeatures(game, statsCache)
      return this._buildFeatureVector(features, weights.in_game)
    }

    const features = this._extractPregameFeatures(game, statsCache)
    return this._buildFeatureVector(features, weights.pregame)
  }

  _calcMomentum(game) {
    const timeline = game.timeline || []
    const scoring = timeline.filter(e => e.homeScore !== undefined).slice(-5)
    if (scoring.length < 2) return 0

    let momentum = 0
    for (let i = 1; i < scoring.length; i++) {
      const weight = i / scoring.length
      const homeDelta = (scoring[i].homeScore ?? 0) - (scoring[i - 1].homeScore ?? 0)
      const awayDelta = (scoring[i].awayScore ?? 0) - (scoring[i - 1].awayScore ?? 0)
      if (homeDelta > 0) momentum += weight
      else if (awayDelta > 0) momentum -= weight
    }
    return Math.max(-1, Math.min(1, momentum))
  }
}
