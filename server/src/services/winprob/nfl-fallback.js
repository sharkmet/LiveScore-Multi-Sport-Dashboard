/**
 * Closed-form NFL win probability fallback.
 * Used only when the ML model throws unexpectedly.
 */

function sigmoid(z) {
  return 1 / (1 + Math.exp(-z))
}

/**
 * Simple closed-form WP using score differential and time remaining.
 * @param {object} gameEvent
 * @returns {{ home: number, away: number }}
 */
export function fallbackWinProb(gameEvent) {
  try {
    const status = gameEvent.status
    if (status === 'scheduled') return { home: 0.55, away: 0.45 }
    if (status === 'final') {
      const homeScore = gameEvent.score?.home ?? 0
      const awayScore = gameEvent.score?.away ?? 0
      if (homeScore > awayScore) return { home: 1.0, away: 0.0 }
      if (awayScore > homeScore) return { home: 0.0, away: 1.0 }
      return { home: 0.5, away: 0.5 }
    }

    const scoreDiff    = (gameEvent.score?.home ?? 0) - (gameEvent.score?.away ?? 0)
    const quarter      = gameEvent.period?.current ?? 1
    const extras       = gameEvent.nflExtras ?? {}
    const clockStr     = extras.clock ?? '15:00'
    const [mins = 15, secs = 0] = clockStr.split(':').map(Number)
    const secsInQuarter = mins * 60 + secs
    const quartersLeft  = Math.max(0, 4 - quarter)
    const secondsRemaining = secsInQuarter + quartersLeft * 900

    const timeRatio = 1 - secondsRemaining / 3600
    const z = 0.14 * scoreDiff + 0.22 * scoreDiff * timeRatio + 0.20

    const homeWinProb = Math.min(0.99, Math.max(0.01, sigmoid(z)))
    return { home: homeWinProb, away: 1 - homeWinProb }
  } catch {
    return { home: 0.5, away: 0.5 }
  }
}
