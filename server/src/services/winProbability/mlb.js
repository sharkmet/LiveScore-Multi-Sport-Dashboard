import { createRequire } from 'module'
import { predictMLBLogistic } from './mlb-logistic-fallback.js'

const require = createRequire(import.meta.url)
const winExpectancy = require('./lookupTables/mlb-win-expectancy.json')

export function predictMLB(gameEvent) {
  try {
    // Priority 1: MLB API win probability (already 0-1, from buildWinProbTimeline)
    const apiWP = gameEvent.apiWinProbability ?? gameEvent._apiWinProbability
    if (apiWP != null && Number.isFinite(apiWP)) {
      return Math.max(0.001, Math.min(0.999, apiWP))
    }

    // Priority 2: Tango win expectancy lookup table
    const stateKey = buildStateKey(gameEvent)
    if (stateKey && winExpectancy[stateKey] != null) {
      return Math.max(0.001, Math.min(0.999, winExpectancy[stateKey]))
    }

    // Priority 3: Logistic fallback
    return predictMLBLogistic(gameEvent)
  } catch {
    return 0.5
  }
}

function buildStateKey(gameEvent) {
  const p = gameEvent.period
  if (!p || p.current == null) return null
  const inning = Math.min(9, p.current)
  // isTopHalf true = top of inning = away batting = "T"
  const half = p.isTopHalf === false ? 'B' : 'T'
  const outs = gameEvent.outs ?? gameEvent._currentOuts ?? 0
  const baseState = gameEvent.baseState ?? deriveBaseState(gameEvent._baseRunners)
  const runDiffRaw = (gameEvent.score?.home ?? 0) - (gameEvent.score?.away ?? 0)
  const runDiff = Math.max(-10, Math.min(10, runDiffRaw))
  return `${inning}_${half}_${outs}_${baseState}_${runDiff}`
}

function deriveBaseState(runners) {
  if (!runners) return '000'
  return (runners.first ? '1' : '0') + (runners.second ? '1' : '0') + (runners.third ? '1' : '0')
}
