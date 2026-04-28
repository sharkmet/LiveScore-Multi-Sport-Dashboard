/**
 * NBAModel — logistic regression win probability for NBA games.
 * Includes clutch-time multiplier when progress > 0.9 and |point_diff| ≤ 5.
 */
import { createRequire } from 'module'
import { BaseWinProbabilityModel } from './base-model.js'

const require = createRequire(import.meta.url)
const weights = require('./weights/nba-weights.json')

const REGULATION_SECONDS = 2880 // 4 quarters × 12 min

function winPctFromRecord(record) {
  if (!record) return 0.5
  const m = String(record).match(/(\d+)-(\d+)/)
  if (!m) return 0.5
  const w = parseInt(m[1], 10)
  const l = parseInt(m[2], 10)
  const total = w + l
  return total > 0 ? w / total : 0.5
}

export class NBAModel extends BaseWinProbabilityModel {
  constructor() {
    super(weights)
  }

  predict(game, statsCache) {
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

    const homeStats = statsCache?.get(`nba_team_${game.homeTeam?.id}`) || {}
    const awayStats = statsCache?.get(`nba_team_${game.awayTeam?.id}`) || {}

    const homeNetRtg = parseFloat(homeStats.netRating ?? 0)
    const awayNetRtg = parseFloat(awayStats.netRating ?? 0)
    const homePpg    = parseFloat(homeStats.ppg       ?? 112)
    const awayPpg    = parseFloat(awayStats.ppg       ?? 112)
    const homeOppPpg = parseFloat(homeStats.oppPpg    ?? 112)
    const awayOppPpg = parseFloat(awayStats.oppPpg    ?? 112)
    const homePace   = parseFloat(homeStats.pace      ?? 100)
    const awayPace   = parseFloat(awayStats.pace      ?? 100)

    const homeRest = game.homeTeam?.daysRest ?? 1
    const awayRest = game.awayTeam?.daysRest ?? 1
    const restAdv  = Math.min(2, Math.max(-2, homeRest - awayRest))

    const starPlayerAvailable = game._starPlayerAvailable ?? 0

    return {
      home_advantage:        1,
      win_pct_diff:          homeWinPct - awayWinPct,
      net_rating_diff:       homeNetRtg - awayNetRtg,
      ppg_diff:              homePpg    - awayPpg,
      opp_ppg_diff:          homeOppPpg - awayOppPpg,
      pace_diff:             homePace   - awayPace,
      rest_advantage:        restAdv,
      star_player_available: starPlayerAvailable,
    }
  }

  _extractInGameFeatures(game, statsCache) {
    const homePoints = game.score?.home ?? 0
    const awayPoints = game.score?.away ?? 0
    const pointDiff  = homePoints - awayPoints

    const quarter     = game.period?.quarter ?? game.period?.current ?? 1
    const quarterSecs = game.period?.timeElapsed ?? 0
    const secondsElapsed = Math.min(
      REGULATION_SECONDS,
      ((Math.min(quarter, 4) - 1) * 720) + quarterSecs
    )
    const gameProgress = Math.min(1, secondsElapsed / REGULATION_SECONDS)

    const boxscore   = game._boxscore || {}
    const homeFgPct  = game._fgPct?.home   ?? parseFloat(boxscore.homeFgPct  ?? 0.45)
    const awayFgPct  = game._fgPct?.away   ?? parseFloat(boxscore.awayFgPct  ?? 0.45)
    const home3ptPct = game._3ptPct?.home  ?? parseFloat(boxscore.home3ptPct ?? 0.35)
    const away3ptPct = game._3ptPct?.away  ?? parseFloat(boxscore.away3ptPct ?? 0.35)

    const homeReb = game._rebounds?.home  ?? boxscore.homeReb ?? 0
    const awayReb = game._rebounds?.away  ?? boxscore.awayReb ?? 0
    const homeTov = game._turnovers?.home ?? boxscore.homeTov ?? 0
    const awayTov = game._turnovers?.away ?? boxscore.awayTov ?? 0

    const homeFtRate = boxscore.homeFtRate ?? 0.25
    const awayFtRate = boxscore.awayFtRate ?? 0.25

    const foulTrouble   = game._foulTrouble ?? 0
    const timeouts      = game.period?.timeouts
    const timeoutFactor = timeouts ? (timeouts.home ?? 0) - (timeouts.away ?? 0) : 0
    const momentum      = this._calcMomentum(game)

    const homeWinPct = winPctFromRecord(game.homeTeam?.record)
    const awayWinPct = winPctFromRecord(game.awayTeam?.record)

    let features = {
      point_diff:               pointDiff,
      point_diff_x_progress:    pointDiff * gameProgress,
      point_diff_x_progress_sq: pointDiff * gameProgress * gameProgress,
      home_advantage:           1,
      win_pct_diff:             homeWinPct - awayWinPct,
      fg_pct_diff:              homeFgPct  - awayFgPct,
      three_pt_diff:            home3ptPct - away3ptPct,
      ft_rate_diff:             homeFtRate - awayFtRate,
      rebound_diff:             homeReb    - awayReb,
      turnover_diff:            homeTov    - awayTov,
      momentum,
      foul_trouble:             foulTrouble,
      timeout_factor:           timeoutFactor,
    }

    // Clutch multiplier: late game, close score
    if (gameProgress > 0.9 && Math.abs(pointDiff) <= 5) {
      features = {
        ...features,
        momentum:     features.momentum     * 1.5,
        ft_rate_diff: features.ft_rate_diff * 1.5,
      }
    }

    return features
  }

  /**
   * Extract the feature vector used for the last prediction.
   * Returns a FeatureVector with features, weights, bias, rawScore, probability.
   *
   * @param {object} game
   * @param {object} statsCache
   * @returns {object} FeatureVector
   */
  extractFeatures(game, statsCache) {
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
    const scoring  = timeline.filter(e => e.homeScore !== undefined).slice(-6)
    if (scoring.length < 2) return 0

    let momentum = 0
    for (let i = 1; i < scoring.length; i++) {
      const weight    = i / scoring.length
      const homeDelta = (scoring[i].homeScore ?? 0) - (scoring[i - 1].homeScore ?? 0)
      const awayDelta = (scoring[i].awayScore ?? 0) - (scoring[i - 1].awayScore ?? 0)
      if (homeDelta > awayDelta) momentum += weight
      else if (awayDelta > homeDelta) momentum -= weight
    }
    return Math.max(-1, Math.min(1, momentum))
  }
}
