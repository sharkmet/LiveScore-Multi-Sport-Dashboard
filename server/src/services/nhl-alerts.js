/**
 * NHL-specific alert engine.
 * Detects: comeback, blowout, hat trick, OT thriller, late tie.
 *
 * Called with (prev, curr) GameEvent objects where curr.league === 'nhl'.
 * Returns an array of new Alert objects (may be empty).
 */

// Per-game state for comeback tracking
const gameState = new Map()  // gameId → { maxHomeDeficit, maxAwayDeficit }

// Dedup set — "type:gameId" keys prevent double-firing
const firedAlerts = new Set()

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function isThirdOrLater(period) {
  if (!period) return false
  return period.current >= 3
}

// ─── Rules ────────────────────────────────────────────────────────────────────

/**
 * Comeback: a team that trailed by 3+ goals now leads or has tied late.
 */
function detectComeback(_prev, curr) {
  const { score, homeTeam, awayTeam, status, gameId } = curr
  if (status !== 'live') return null

  const state = gameState.get(gameId) ?? { maxHomeDeficit: 0, maxAwayDeficit: 0 }

  const homeDeficit = score.away - score.home
  const awayDeficit = score.home - score.away

  if (homeDeficit > state.maxHomeDeficit) state.maxHomeDeficit = homeDeficit
  if (awayDeficit > state.maxAwayDeficit) state.maxAwayDeficit = awayDeficit
  gameState.set(gameId, state)

  if (state.maxHomeDeficit >= 3 && score.home >= score.away) {
    return makeAlert(
      gameId,
      'comeback',
      'critical',
      'Comeback Alert',
      `${homeTeam.abbreviation} erased a ${state.maxHomeDeficit}-goal deficit — now ${score.home > score.away ? 'leads' : 'tied'} ${score.home}-${score.away}`,
    )
  }

  if (state.maxAwayDeficit >= 3 && score.away >= score.home) {
    return makeAlert(
      gameId,
      'comeback',
      'critical',
      'Comeback Alert',
      `${awayTeam.abbreviation} erased a ${state.maxAwayDeficit}-goal deficit — now ${score.away > score.home ? 'leads' : 'tied'} ${score.away}-${score.home}`,
    )
  }

  return null
}

/**
 * Blowout: goal differential reaches 5+.
 */
function detectBlowout(_prev, curr) {
  const { score, homeTeam, awayTeam, status } = curr
  if (status !== 'live') return null

  const diff = Math.abs(score.home - score.away)
  if (diff < 5) return null

  const leadingTeam   = score.home > score.away ? homeTeam : awayTeam
  const leadingScore  = score.home > score.away ? score.home : score.away
  const trailingScore = score.home > score.away ? score.away : score.home

  return makeAlert(
    curr.gameId,
    'blowout',
    'info',
    'Blowout Alert',
    `${leadingTeam.abbreviation} leads ${leadingScore}-${trailingScore}`,
  )
}

/**
 * Hat trick: a player scored 3 goals in the game (detected via goals list).
 * Fires once per scorer per game.
 */
function detectHatTrick(_prev, curr) {
  const { goals, status, gameId } = curr
  if (status !== 'live' && status !== 'final') return null
  if (!goals?.length) return null

  // Count goals per scorer
  const counts = {}
  for (const g of goals) {
    if (!g.scorer) continue
    counts[g.scorer] = (counts[g.scorer] ?? 0) + 1
  }

  for (const [scorer, count] of Object.entries(counts)) {
    if (count < 3) continue
    const key = `hat_trick:${gameId}:${scorer}`
    if (firedAlerts.has(key)) continue
    firedAlerts.add(key)
    return makeAlert(
      gameId,
      'hat_trick',
      'critical',
      'Hat Trick!',
      `${scorer} has scored ${count} goals`,
    )
  }

  return null
}

/**
 * OT Thriller: game tied after regulation (entering OT or SO).
 */
function detectOtThriller(_prev, curr) {
  const { score, homeTeam, awayTeam, status, period } = curr
  if (status !== 'live') return null
  if (!period || period.current < 4) return null
  if (score.home !== score.away) return null

  return makeAlert(
    curr.gameId,
    'ot_thriller',
    'warning',
    'OT Thriller',
    `${awayTeam.abbreviation} and ${homeTeam.abbreviation} are tied ${score.away}-${score.home} — heading to ${period.label}`,
  )
}

/**
 * Late Tie: game tied in the 3rd period with under 5 min remaining.
 */
function detectLateTie(_prev, curr) {
  const { score, homeTeam, awayTeam, status, period, matchup } = curr
  if (status !== 'live') return null
  if (!isThirdOrLater(period) || period.current !== 3) return null
  if (score.home !== score.away) return null

  // Check time remaining if available
  const timeRemaining = matchup?.period?.timeRemaining
  if (timeRemaining) {
    const [mm] = timeRemaining.split(':').map(Number)
    if (mm >= 5) return null
  }

  return makeAlert(
    curr.gameId,
    'late_tie',
    'warning',
    'Late Tie',
    `${awayTeam.abbreviation} and ${homeTeam.abbreviation} are tied ${score.away}-${score.home} late in the 3rd`,
  )
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Run all NHL alert rules against a game update.
 * @param {object|null} prev
 * @param {object} curr
 * @returns {object[]}
 */
export function detectNhlAlerts(prev, curr) {
  if (!curr) return []
  if (curr.status === 'scheduled') return []

  const rules = [
    () => detectComeback(prev, curr),
    () => detectBlowout(prev, curr),
    () => detectHatTrick(prev, curr),
    () => detectOtThriller(prev, curr),
    () => detectLateTie(prev, curr),
  ]

  const newAlerts = []

  for (const rule of rules) {
    const alert = rule()
    if (!alert) continue

    // hat_trick uses its own per-scorer key, already handled inside detectHatTrick
    if (alert.type === 'hat_trick') {
      newAlerts.push(alert)
      continue
    }

    const key = `${alert.type}:${curr.gameId}`
    if (firedAlerts.has(key)) continue
    firedAlerts.add(key)
    newAlerts.push(alert)
  }

  return newAlerts
}

export function clearNhlAlertState(gameId) {
  if (gameId) {
    gameState.delete(gameId)
    for (const key of firedAlerts) {
      if (key.includes(`:${gameId}`)) firedAlerts.delete(key)
    }
  } else {
    gameState.clear()
    firedAlerts.clear()
  }
}
