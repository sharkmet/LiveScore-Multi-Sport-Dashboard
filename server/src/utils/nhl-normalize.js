/**
 * NHL-specific normalization utilities.
 */

const NHL_STATUS_MAP = {
  FUT:   'scheduled',
  PRE:   'scheduled',
  LIVE:  'live',
  CRIT:  'live',
  FINAL: 'final',
  OFF:   'final',
}

export function mapNhlStatus(gameState) {
  return NHL_STATUS_MAP[gameState] ?? 'scheduled'
}

const PERIOD_LABELS = { 1: '1st', 2: '2nd', 3: '3rd', 4: 'OT', 5: 'SO' }

export function buildPeriodLabel(periodNum) {
  return PERIOD_LABELS[periodNum] ?? `P${periodNum}`
}

export function buildFinalLabel(periodNum) {
  if (!periodNum || periodNum <= 3) return 'Final'
  if (periodNum === 4) return 'Final/OT'
  if (periodNum === 5) return 'Final/SO'
  return 'Final'
}

/**
 * Parse NHL situationCode (4-digit string).
 * Format: [awayGoalie][awaySkaters][homeSkaters][homeGoalie]
 * e.g. "1551" = EV 5v5, "1451" = home PP (5v4), "0551" = away EN
 */
export function parseSituationCode(code) {
  if (!code || code.length < 4) {
    return { strength: 'EV', strengthLabel: '5v5', awaySkaters: 5, homeSkaters: 5, awayGoalie: 1, homeGoalie: 1 }
  }
  const awayGoalie   = parseInt(code[0])
  const awaySkaters  = parseInt(code[1])
  const homeSkaters  = parseInt(code[2])
  const homeGoalie   = parseInt(code[3])

  let strength = 'EV'
  const strengthLabel = `${awaySkaters}v${homeSkaters}`

  if (awayGoalie === 0 || homeGoalie === 0) {
    strength = 'EN'
  } else if (awaySkaters > homeSkaters) {
    strength = 'PP'  // away power play
  } else if (homeSkaters > awaySkaters) {
    strength = 'PP'  // home power play
  }

  return { strength, strengthLabel, awaySkaters, homeSkaters, awayGoalie, homeGoalie }
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x))
}

/**
 * Hockey win probability model.
 * homeWinProb ≈ sigmoid(0.7 * goalDiff * periodsWeight) + homeIceAdj
 */
export function calcHockeyWinProb(goalDiff, currentPeriod, totalPeriods = 3) {
  const periodsRemaining = Math.max(totalPeriods, currentPeriod) - currentPeriod
  const periodsWeight    = 1 + periodsRemaining * 0.2
  const raw              = sigmoid(0.7 * goalDiff * periodsWeight)
  // Slight home-ice bump
  const homeAdj = 0.04 * (1 - 2 * Math.abs(raw - 0.5))
  return parseFloat(Math.min(0.97, Math.max(0.03, raw + homeAdj)).toFixed(3))
}
