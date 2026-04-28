import { createRequire } from 'module'
import { extractInGameFeatures, extractPregameFeatures } from './features.js'

const require = createRequire(import.meta.url)
const weights = require('./weights.json')

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x))
}

function dot(w, features) {
  return Object.keys(w).reduce((sum, key) => {
    if (key === 'intercept') return sum + w[key]
    return sum + (w[key] * (features[key] ?? 0))
  }, 0)
}

function clamp(p, min = 0.01, max = 0.99) {
  return Math.min(max, Math.max(min, p))
}

// Predict home win probability [0,1] for the given mode and features
export function predictWinProb(mode, features) {
  const w = weights[mode]
  if (!w) return 0.5
  return clamp(sigmoid(dot(w, features)))
}

// Simple sigmoid fallback (from PRD spec)
export function calcSimpleFallback(homeRuns, awayRuns, inning, isTopHalf) {
  const runDiff = homeRuns - awayRuns
  const inningsRemaining = Math.max(9, inning) - inning + (isTopHalf ? 0.5 : 0)
  const inningsWeight = 1 + (inningsRemaining * 0.15)
  const k = 0.4
  return clamp(sigmoid(k * runDiff * inningsWeight))
}

// Three-tier win probability for a live/in-progress game
// Returns { home, away, source }
export function getLiveWinProbability(game, mlbProb) {
  if (mlbProb != null) {
    return { home: mlbProb, away: 1 - mlbProb, source: 'mlb' }
  }

  try {
    const features = extractInGameFeatures(game)
    const homeProb = predictWinProb('inGame', features)
    return { home: homeProb, away: 1 - homeProb, source: 'model' }
  } catch {
    const inning   = game.period?.inning ?? 1
    const isTop    = game.period?.isTopHalf !== false
    const homeProb = calcSimpleFallback(
      game.score?.home ?? 0,
      game.score?.away ?? 0,
      inning,
      isTop,
    )
    return { home: homeProb, away: 1 - homeProb, source: 'simple' }
  }
}

// Pregame win probability for a scheduled game
// Returns { home, away, source }
// Clamped to [0.30, 0.70] — no team should be below 30% before first pitch
export function getPregameWinProbability(homeTeam, awayTeam, homeStarter, awayStarter) {
  try {
    const features = extractPregameFeatures(homeTeam, awayTeam, homeStarter, awayStarter)
    const w = weights['pregame']
    const homeProb = clamp(sigmoid(dot(w, features)), 0.30, 0.70)
    return { home: homeProb, away: parseFloat((1 - homeProb).toFixed(4)), source: 'model' }
  } catch {
    return { home: 0.54, away: 0.46, source: 'simple' }
  }
}
