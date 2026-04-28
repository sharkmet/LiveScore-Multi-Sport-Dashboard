import { predictNBA } from './nba.js'
import { predictNHL } from './nhl.js'
import { predictMLB } from './mlb.js'
import { predictNFL } from './nfl.js'

const ROUTES = {
  nba: predictNBA,
  nhl: predictNHL,
  mlb: predictMLB,
  nfl: predictNFL,
}

const DEV = process.env.NODE_ENV !== 'production'

/**
 * Predict home-team win probability for a normalized GameEvent.
 * Returns a number in [0, 1]. Never throws.
 *
 * Final games return 1.0/0.0. Scheduled/warmup games use team-strength prior only.
 * Live games use the sport-specific Stern/Poisson probit model.
 */
export function predictWinProbability(gameEvent) {
  try {
    if (gameEvent.status === 'final') {
      const home = gameEvent.score?.home ?? 0
      const away = gameEvent.score?.away ?? 0
      if (home > away) return 1.0
      if (away > home) return 0.0
      return 0.5
    }

    const fn = ROUTES[gameEvent.league?.toLowerCase()]
    if (!fn) return simpleFallback(gameEvent)

    // Pre-game: run model with 0-0 score, full time remaining = team strength + HCA only
    if (gameEvent.status === 'scheduled' || gameEvent.status === 'warmup') {
      return fn({ ...gameEvent, score: { home: 0, away: 0 } })
    }

    const result = fn(gameEvent)

    if (DEV && gameEvent.status === 'live') {
      const lead = (gameEvent.score?.home ?? 0) - (gameEvent.score?.away ?? 0)
      console.log(
        `[WP] ${gameEvent.league} ${gameEvent.awayTeam?.abbreviation}@${gameEvent.homeTeam?.abbreviation}` +
        ` lead=${lead >= 0 ? '+' : ''}${lead} p_home=${result.toFixed(3)}`
      )
    }

    return result
  } catch (err) {
    console.warn('[WP] predict error:', err.message)
    return simpleFallback(gameEvent)
  }
}

function simpleFallback(gameEvent) {
  const diff = (gameEvent.score?.home ?? 0) - (gameEvent.score?.away ?? 0)
  const x = 0.4 * diff
  const clamped = Math.max(-10, Math.min(10, x))
  return Math.max(0.02, Math.min(0.98, 1 / (1 + Math.exp(-clamped))))
}
