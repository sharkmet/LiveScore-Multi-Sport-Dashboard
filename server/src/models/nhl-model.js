/**
 * NHLModel — logistic regression win probability for NHL games.
 * Special handling: tied game at end of regulation → ~52% home (OT home advantage).
 */
import { createRequire } from 'module'
import { BaseWinProbabilityModel } from './base-model.js'

const require = createRequire(import.meta.url)
const weights = require('./weights/nhl-weights.json')

const REGULATION_SECONDS = 3600 // 3 periods × 20 min

function parseNhlRecord(record) {
  if (!record) return { w: 0, l: 0, otl: 0 }
  const m = String(record).match(/(\d+)-(\d+)-(\d+)/)
  if (!m) return { w: 0, l: 0, otl: 0 }
  return { w: parseInt(m[1], 10), l: parseInt(m[2], 10), otl: parseInt(m[3], 10) }
}

function pointsPctFromRecord(record) {
  const { w, l, otl } = parseNhlRecord(record)
  const gp = w + l + otl
  if (gp === 0) return 0.5
  const pts = w * 2 + otl
  return pts / (gp * 2)
}

export class NHLModel extends BaseWinProbabilityModel {
  constructor() {
    super(weights)
  }

  predict(game, statsCache) {
    const status = game.status?.state
    const isLive = status === 'live' || status === 'in_progress'

    if (isLive) {
      const period     = game.period?.period ?? game.period?.current ?? 1
      const homeGoals  = game.score?.home ?? 0
      const awayGoals  = game.score?.away ?? 0
      const tied       = homeGoals === awayGoals

      // OT / shootout tied → slight home advantage
      if (period > 3 && tied) return 0.52

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
    const homePtsPct = pointsPctFromRecord(game.homeTeam?.record)
    const awayPtsPct = pointsPctFromRecord(game.awayTeam?.record)

    const homeGoalieId = game._goalieIds?.home
    const awayGoalieId = game._goalieIds?.away
    const homeGoalie   = (homeGoalieId && statsCache?.get(`nhl_goalie_${homeGoalieId}`)) || {}
    const awayGoalie   = (awayGoalieId && statsCache?.get(`nhl_goalie_${awayGoalieId}`)) || {}

    const homeSvPct = parseFloat(homeGoalie.svPct ?? 0.910)
    const awaySvPct = parseFloat(awayGoalie.svPct ?? 0.910)
    const homeGaa   = parseFloat(homeGoalie.gaa   ?? 3.00)
    const awayGaa   = parseFloat(awayGoalie.gaa   ?? 3.00)

    const homeTeamStats = statsCache?.get(`nhl_team_${game.homeTeam?.abbreviation || game.homeTeam?.id}`) || {}
    const awayTeamStats = statsCache?.get(`nhl_team_${game.awayTeam?.abbreviation || game.awayTeam?.id}`) || {}
    const homeGpg  = parseFloat(homeTeamStats.goalsPerGame  ?? 3.00)
    const awayGpg  = parseFloat(awayTeamStats.goalsPerGame  ?? 3.00)
    const homeGapg = parseFloat(homeTeamStats.goalsAgainst  ?? 3.00)
    const awayGapg = parseFloat(awayTeamStats.goalsAgainst  ?? 3.00)
    const homePpPct = parseFloat(homeTeamStats.ppPct ?? 0.20)
    const awayPpPct = parseFloat(awayTeamStats.ppPct ?? 0.20)
    const homePkPct = parseFloat(homeTeamStats.pkPct ?? 0.80)
    const awayPkPct = parseFloat(awayTeamStats.pkPct ?? 0.80)

    return {
      home_advantage:      1,
      points_pct_diff:     homePtsPct  - awayPtsPct,
      goalie_sv_pct_diff:  homeSvPct   - awaySvPct,
      goalie_gaa_diff:     homeGaa     - awayGaa,
      goals_per_game_diff: homeGpg     - awayGpg,
      goals_against_diff:  homeGapg    - awayGapg,
      pp_pct_diff:         homePpPct   - awayPpPct,
      pk_pct_diff:         homePkPct   - awayPkPct,
    }
  }

  _extractInGameFeatures(game, statsCache) {
    const homeGoals = game.score?.home ?? 0
    const awayGoals = game.score?.away ?? 0
    const goalDiff  = homeGoals - awayGoals

    const period       = game.period?.period ?? game.period?.current ?? 1
    const periodTime   = game.period?.timeElapsed ?? 0
    const secondsElapsed = Math.min(
      REGULATION_SECONDS,
      ((Math.min(period, 3) - 1) * 1200) + periodTime
    )
    const gameProgress = Math.min(1, secondsElapsed / REGULATION_SECONDS)

    const shots     = game._shotsOnGoal || {}
    const homeShots = shots.home ?? game.homeTeam?.shotsOnGoal ?? 0
    const awayShots = shots.away ?? game.awayTeam?.shotsOnGoal ?? 0

    const ppState = game._powerPlayState ?? 0

    const homeGoalieId = game._goalieIds?.home
    const awayGoalieId = game._goalieIds?.away
    const homeGoalie   = (homeGoalieId && statsCache?.get(`nhl_goalie_${homeGoalieId}`)) || {}
    const awayGoalie   = (awayGoalieId && statsCache?.get(`nhl_goalie_${awayGoalieId}`)) || {}
    const homeSvPct = parseFloat(homeGoalie.svPct ?? 0.910)
    const awaySvPct = parseFloat(awayGoalie.svPct ?? 0.910)

    const momentum = this._calcMomentum(game)

    const situationCode = game._situationCode || ''
    const emptyNet = situationCode.includes('EN') ? 1 : 0

    const homePtsPct = pointsPctFromRecord(game.homeTeam?.record)
    const awayPtsPct = pointsPctFromRecord(game.awayTeam?.record)

    return {
      goal_diff:            goalDiff,
      goal_diff_x_progress: goalDiff * gameProgress,
      home_advantage:       1,
      points_pct_diff:      homePtsPct  - awayPtsPct,
      shot_diff:            homeShots   - awayShots,
      power_play_state:     ppState,
      goalie_sv_pct_diff:   homeSvPct   - awaySvPct,
      momentum,
      empty_net:            emptyNet,
    }
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
      const period    = game.period?.period ?? game.period?.current ?? 1
      const homeGoals = game.score?.home ?? 0
      const awayGoals = game.score?.away ?? 0
      const tied      = homeGoals === awayGoals

      if (period > 3 && tied) {
        return this._buildFeatureVector(
          { ot_home_advantage: 1 },
          { bias: 0.08, ot_home_advantage: 0 }
        )
      }

      const features = this._extractInGameFeatures(game, statsCache)
      return this._buildFeatureVector(features, weights.in_game)
    }

    const features = this._extractPregameFeatures(game, statsCache)
    return this._buildFeatureVector(features, weights.pregame)
  }

  _calcMomentum(game) {
    const timeline = game.timeline || []
    const goals = timeline.filter(e => e.type === 'goal' || e.type === 'score').slice(-4)
    if (goals.length === 0) return 0

    let momentum = 0
    goals.forEach((g, i) => {
      const weight = (i + 1) / goals.length
      if (g.scoringTeam === 'home') momentum += weight
      else momentum -= weight
    })
    return Math.max(-1, Math.min(1, momentum))
  }
}
