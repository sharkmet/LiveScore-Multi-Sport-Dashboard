import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const weights = require('./weights/mlb.json')

const { intercept, runDiff: wRunDiff, inning: wInning, runDiffXInning: wCross } =
  weights.constants.logisticFallbackCoefficients

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x))
}

export function predictMLBLogistic(gameEvent) {
  try {
    const runDiff = (gameEvent.score?.home ?? 0) - (gameEvent.score?.away ?? 0)
    const inning = gameEvent.period?.current ?? 1
    const x = intercept + wRunDiff * runDiff + wInning * inning + wCross * runDiff * inning
    return Math.max(0.001, Math.min(0.999, sigmoid(Math.max(-10, Math.min(10, x)))))
  } catch {
    return 0.5
  }
}
