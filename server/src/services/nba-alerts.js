/**
 * NBA-specific alert rules.
 * Basketball thresholds differ significantly from baseball/hockey.
 *
 * Rules:
 *   upset          — underdog leads by 10+ in Q3 or later
 *   comeback       — team overcame 15+ point deficit and now leads
 *   blowout        — point differential reaches 25+
 *   momentum_shift — team scored 10+ in a quarter, margin now within 5
 */

// Per-game state — survives across polls within a server session
const gameState = new Map() // gameId → { maxHomeDeficit, maxAwayDeficit }

// Dedup: "type:gameId" never fires twice
const firedAlerts = new Set()

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseWinPct(record) {
  if (!record) return null
  const [w, l] = record.split('-').map(Number)
  if (isNaN(w) || isNaN(l) || w + l === 0) return null
  return w / (w + l)
}

function makeAlert(gameId, type, severity, title, message) {
  return {
    id: `${type}-${gameId}-${Date.now()}`,
    gameId,
    type,
    severity,
    title,
    message,
    timestamp: new Date().toISOString(),
  }
}

function homeScore(curr) { return curr.homeTeam?.score ?? 0 }
function awayScore(curr) { return curr.awayTeam?.score ?? 0 }

// ── Rules ─────────────────────────────────────────────────────────────────────

/**
 * Upset: underdog (≥5pp lower win%) leads by 10+ in Q3 or later.
 */
function detectNbaUpset(_prev, curr) {
  const { homeTeam, awayTeam, period, status } = curr
  if (status !== 'live') return null
  if ((period?.current ?? 0) < 3) return null

  const diff = homeScore(curr) - awayScore(curr)
  if (Math.abs(diff) < 10) return null

  const homeWinPct = parseWinPct(homeTeam.record)
  const awayWinPct = parseWinPct(awayTeam.record)
  if (homeWinPct === null || awayWinPct === null) return null

  const leadingTeam  = diff > 0 ? homeTeam : awayTeam
  const leadingPct   = diff > 0 ? homeWinPct : awayWinPct
  const trailingPct  = diff > 0 ? awayWinPct : homeWinPct

  if (leadingPct >= trailingPct - 0.05) return null

  return makeAlert(
    curr.gameId,
    'upset',
    'warning',
    'Upset Alert',
    `${leadingTeam.abbreviation} leads by ${Math.abs(diff)} in the ${period.label} as the underdog`,
  )
}

/**
 * Comeback: team that trailed by 15+ now leads.
 */
function detectNbaComeback(_prev, curr) {
  const { homeTeam, awayTeam, status, gameId } = curr
  if (status !== 'live') return null

  const hs = homeScore(curr)
  const as_ = awayScore(curr)

  const state = gameState.get(gameId) ?? { maxHomeDeficit: 0, maxAwayDeficit: 0 }

  const homeDeficit = as_ - hs   // positive when away leads
  const awayDeficit = hs - as_   // positive when home leads

  if (homeDeficit > state.maxHomeDeficit) state.maxHomeDeficit = homeDeficit
  if (awayDeficit > state.maxAwayDeficit) state.maxAwayDeficit = awayDeficit
  gameState.set(gameId, state)

  if (state.maxHomeDeficit >= 15 && hs > as_) {
    return makeAlert(
      gameId,
      'comeback',
      'critical',
      'Comeback Alert',
      `${homeTeam.abbreviation} overcame a ${state.maxHomeDeficit}-point deficit — now leads ${hs}-${as_}`,
    )
  }

  if (state.maxAwayDeficit >= 15 && as_ > hs) {
    return makeAlert(
      gameId,
      'comeback',
      'critical',
      'Comeback Alert',
      `${awayTeam.abbreviation} overcame a ${state.maxAwayDeficit}-point deficit — now leads ${as_}-${hs}`,
    )
  }

  return null
}

/**
 * Blowout: point differential reaches 25+.
 */
function detectNbaBlowout(_prev, curr) {
  const { homeTeam, awayTeam, status } = curr
  if (status !== 'live') return null

  const hs = homeScore(curr)
  const as_ = awayScore(curr)
  const diff = Math.abs(hs - as_)
  if (diff < 25) return null

  const leadingTeam    = hs > as_ ? homeTeam : awayTeam
  const leadingScore   = hs > as_ ? hs : as_
  const trailingScore  = hs > as_ ? as_ : hs

  return makeAlert(
    curr.gameId,
    'blowout',
    'info',
    'Blowout Alert',
    `${leadingTeam.abbreviation} leads ${leadingScore}-${trailingScore}`,
  )
}

/**
 * Momentum shift: a team scored 10+ points in the latest completed quarter
 * and the overall margin is now within 5.
 */
function detectNbaMomentumShift(_prev, curr) {
  const { homeTeam, awayTeam, status, linescore } = curr
  if (status !== 'live') return null
  if (!Array.isArray(linescore) || linescore.length === 0) return null

  const lastQ = linescore[linescore.length - 1]
  const hs = homeScore(curr)
  const as_ = awayScore(curr)
  const margin = Math.abs(hs - as_)

  if (lastQ.homeScore >= 10 && margin <= 5) {
    return makeAlert(
      curr.gameId,
      'momentum_shift',
      'warning',
      'Momentum Shift',
      `${homeTeam.abbreviation} scored ${lastQ.homeScore} pts in ${lastQ.periodLabel} — margin now ${margin}`,
    )
  }

  if (lastQ.awayScore >= 10 && margin <= 5) {
    return makeAlert(
      curr.gameId,
      'momentum_shift',
      'warning',
      'Momentum Shift',
      `${awayTeam.abbreviation} scored ${lastQ.awayScore} pts in ${lastQ.periodLabel} — margin now ${margin}`,
    )
  }

  return null
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Run all NBA alert rules against a game update.
 * @param {object|null} prev
 * @param {object} curr
 * @returns {object[]}
 */
export function detectNbaAlerts(prev, curr) {
  if (!curr || curr.status === 'scheduled') return []

  const rules = [
    () => detectNbaUpset(prev, curr),
    () => detectNbaComeback(prev, curr),
    () => detectNbaBlowout(prev, curr),
    () => detectNbaMomentumShift(prev, curr),
  ]

  const newAlerts = []

  for (const rule of rules) {
    const alert = rule()
    if (!alert) continue

    const key = `${alert.type}:${curr.gameId}`
    if (firedAlerts.has(key)) continue

    firedAlerts.add(key)
    newAlerts.push(alert)
  }

  return newAlerts
}

/**
 * Clear per-game state (testing / daily reset).
 */
export function clearNbaAlertState(gameId) {
  if (gameId) {
    gameState.delete(gameId)
    for (const key of firedAlerts) {
      if (key.endsWith(`:${gameId}`)) firedAlerts.delete(key)
    }
  } else {
    gameState.clear()
    firedAlerts.clear()
  }
}
