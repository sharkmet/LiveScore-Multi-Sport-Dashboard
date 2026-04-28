/**
 * WinProbabilityService — top-level dispatcher.
 * Routes to sport-specific models by game.league.
 *
 * Priority cascade (per spec):
 *   1. Final games  → definitive 1.0 / 0.0 / 0.5
 *   2. MLB API win probability (startWinProbability from play feed)
 *   3. ML logistic regression (pregame or in-game model)
 *   4. Simple sigmoid fallback if model throws
 *
 * Hard constraint: predict() is SYNCHRONOUS and completes in <5ms.
 * Stats are pre-fetched into statsCache; no async work in the hot path.
 */
import { MLBModel } from './mlb-model.js'
import { NHLModel } from './nhl-model.js'
import { NBAModel } from './nba-model.js'
import { NFLModel } from './nfl-model.js'
import { statsCache } from '../services/stats-cache.js'
import { prefetchGameStats } from '../services/stats-fetcher.js'
import { predictWinProbability } from '../services/winProbability/index.js'

const mlbModel = new MLBModel()
const nhlModel = new NHLModel()
const nbaModel = new NBAModel()
const nflModel = new NFLModel()

export class WinProbabilityService {
  /**
   * Predict home team win probability for a normalized GameEvent.
   * Returns a number in [0, 1]. Never throws.
   *
   * @param {object} game - normalized GameEvent
   * @returns {number} home win probability
   */
  predict(game) {
    try {
      return predictWinProbability(game)
    } catch (err) {
      console.warn('[WinProbabilityService] predict error:', err.message)
      return this._simpleFallback(game)
    }
  }

  /**
   * Extract the full feature vector for a game (for debugging/logging).
   * Returns null if the league is unsupported.
   *
   * @param {object} game
   * @returns {object|null} FeatureVector
   */
  extractFeatures(game) {
    try {
      const league = (game.league || '').toUpperCase()
      const model  = this._getModel(league)
      if (!model) return null
      return model.extractFeatures(game, statsCache)
    } catch (err) {
      console.warn('[WinProbabilityService] extractFeatures error:', err.message)
      return null
    }
  }

  /**
   * Non-blocking stats prefetch for a list of games.
   * Call on schedule fetch — never awaited in the update loop.
   *
   * @param {Array} games - array of normalized GameEvent objects
   */
  prefetchStats(games) {
    if (!Array.isArray(games)) return
    prefetchGameStats(games)
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  _getModel(league) {
    switch (league) {
      case 'MLB': return mlbModel
      case 'NHL': return nhlModel
      case 'NBA': return nbaModel
      case 'NFL': return nflModel
      default:    return null
    }
  }

  /**
   * Simple sigmoid fallback for unknown leagues or error recovery.
   * Matches the spec's _simpleFallback formula:
   *   x = 0.4 × scoreDiff × (1 + gameProgress)
   *
   * @param {object} game
   * @returns {number}
   */
  _simpleFallback(game) {
    const diff     = (game.score?.home ?? 0) - (game.score?.away ?? 0)
    const progress = this._gameProgress(game)
    const x        = 0.4 * diff * (1 + progress)
    const clamped  = Math.max(-10, Math.min(10, x))
    const prob     = 1 / (1 + Math.exp(-clamped))
    return Math.max(0.02, Math.min(0.98, prob))
  }

  _gameProgress(game) {
    const league = (game.league || '').toUpperCase()
    const period = game.period?.current ?? game.period?.period ?? game.period?.quarter ?? 1

    switch (league) {
      case 'MLB': return Math.min(1, (period - 1) / 9)
      case 'NHL': return Math.min(1, (period - 1) / 3)
      case 'NBA': return Math.min(1, (period - 1) / 4)
      case 'NFL': return Math.min(1, (period - 1) / 4)
      default:    return Math.min(1, (period - 1) / 4)
    }
  }
}

export const winProbService = new WinProbabilityService()
