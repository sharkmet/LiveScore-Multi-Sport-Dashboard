/**
 * NBA-specific normalization utilities.
 */

const NBA_STATUS_MAP = {
  1: 'scheduled',
  2: 'live',
  3: 'final',
}

export function mapNbaStatus(gameStatus) {
  return NBA_STATUS_MAP[gameStatus] ?? 'scheduled'
}

const QUARTER_LABELS = { 1: 'Q1', 2: 'Q2', 3: 'Q3', 4: 'Q4' }

export function buildQuarterLabel(period) {
  if (period <= 0) return 'Scheduled'
  if (period <= 4) return QUARTER_LABELS[period] ?? `Q${period}`
  if (period === 5) return 'OT'
  return `${period - 4}OT`
}

export function buildFinalLabel(period) {
  if (!period || period <= 4) return 'Final'
  if (period === 5) return 'Final/OT'
  return `Final/${period - 4}OT`
}

/**
 * Parse ISO 8601 duration to "M:SS" clock string.
 * "PT09M46.00S" → "9:46"
 * "PT00M00.00S" → "0:00"
 */
export function parseGameClock(clockStr) {
  if (!clockStr) return '0:00'
  const match = clockStr.match(/PT(\d+)M([\d.]+)S/)
  if (!match) return '0:00'
  const mins = parseInt(match[1], 10)
  const secs = Math.floor(parseFloat(match[2]))
  return `${mins}:${String(secs).padStart(2, '0')}`
}

/**
 * Parse ISO 8601 duration to "MM:SS" minutes played string.
 * "PT32M00.00S" → "32:00"
 */
export function parseMinutesPlayed(clockStr) {
  if (!clockStr) return null
  // ISO 8601: "PT29M46.00S"
  const iso = clockStr.match(/PT(\d+)M([\d.]+)S/)
  if (iso) {
    const mins = parseInt(iso[1], 10)
    const secs = Math.floor(parseFloat(iso[2]))
    if (mins === 0 && secs === 0) return null
    return `${mins}:${String(secs).padStart(2, '0')}`
  }
  // "MM:SS" or "MM:SS.xx" variants
  const simple = clockStr.match(/^(\d+):(\d+)/)
  if (simple) {
    const mins = parseInt(simple[1], 10)
    const secs = parseInt(simple[2], 10)
    if (mins === 0 && secs === 0) return null
    return `${mins}:${String(secs).padStart(2, '0')}`
  }
  return null
}

/**
 * Parse "M:SS" clock string to total seconds.
 */
function clockToSeconds(clockStr) {
  if (!clockStr) return 0
  const [min, sec] = clockStr.split(':').map(Number)
  return (min || 0) * 60 + (sec || 0)
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x))
}

/**
 * Basketball win probability model.
 * homeWinProb ≈ sigmoid(k * pointDiff / sqrt(minutesRemaining + 1)) + homeCourtAdj
 */
export function calcBasketballWinProb(pointDiff, period, gameClock) {
  const QUARTER_MINS = 12
  const OT_MINS = 5

  const clockSecs = clockToSeconds(gameClock ?? '0:00')
  const clockMins = clockSecs / 60

  let minsRemaining
  if (period <= 4) {
    minsRemaining = (4 - period) * QUARTER_MINS + clockMins
  } else {
    // OT — remaining time in current OT period only
    minsRemaining = clockMins
  }

  const k = 0.35
  const raw = sigmoid(k * pointDiff / Math.sqrt(minsRemaining + 1))
  // Slight home-court bump (tapers near 0/1)
  const homeAdj = 0.03 * (1 - 2 * Math.abs(raw - 0.5))
  return parseFloat(Math.min(0.97, Math.max(0.03, raw + homeAdj)).toFixed(3))
}

/**
 * Build win probability timeline from per-quarter scores.
 * Returns one entry after each completed quarter.
 */
export function buildNbaWinProbTimeline(quarterScores) {
  const entries = [{ period: 0, home: 0.5, away: 0.5, periodLabel: 'Pre' }]

  let homeTotal = 0
  let awayTotal = 0

  for (const q of quarterScores) {
    homeTotal += q.homeScore
    awayTotal += q.awayScore
    const diff = homeTotal - awayTotal
    // After the quarter ends, assume 0 seconds left in that quarter = start of next
    const remainingPeriods = Math.max(0, 4 - q.period)
    const minsRemaining = remainingPeriods * 12
    const raw = sigmoid(0.35 * diff / Math.sqrt(minsRemaining + 1))
    const homeAdj = 0.03 * (1 - 2 * Math.abs(raw - 0.5))
    const home = parseFloat(Math.min(0.97, Math.max(0.03, raw + homeAdj)).toFixed(3))
    entries.push({
      period: q.period,
      home,
      away: parseFloat((1 - home).toFixed(3)),
      periodLabel: buildQuarterLabel(q.period),
    })
  }

  return entries
}
