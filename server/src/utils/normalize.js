/**
 * Shared normalization helpers for converting raw MLB API data to GameEvent shape.
 */

/**
 * Maps an MLB API abstract game state to our normalized status.
 * @param {string} abstractGameState - e.g. "Live", "Final", "Preview"
 * @param {string} detailedState - e.g. "In Progress", "Delayed", "Scheduled"
 * @returns {"scheduled"|"warmup"|"live"|"final"|"delayed"}
 */
export function mapMlbStatus(abstractGameState, detailedState = '') {
  const detail = detailedState.toLowerCase()
  if (detail.includes('delay') || detail.includes('suspend')) return 'delayed'
  if (detail.includes('warm')) return 'warmup'

  switch (abstractGameState) {
    case 'Live': return 'live'
    case 'Final': return 'final'
    case 'Preview': return 'scheduled'
    default: return 'scheduled'
  }
}

/**
 * Formats a record object from the MLB API into a "W-L" string.
 * @param {{ wins?: number, losses?: number }} record
 * @returns {string}
 */
export function parseRecord(record) {
  if (!record || record.wins == null || record.losses == null) return undefined
  return `${record.wins}-${record.losses}`
}

/**
 * Formats a Date to YYYY-MM-DD string for use in API calls.
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Builds a period label for an MLB inning.
 * @param {number} inning
 * @param {boolean} isTopHalf
 * @returns {string}
 */
export function buildInningLabel(inning, isTopHalf) {
  const suffix = inning === 1 ? 'st' : inning === 2 ? 'nd' : inning === 3 ? 'rd' : 'th'
  return `${isTopHalf ? 'Top' : 'Bot'} ${inning}${suffix}`
}

/**
 * Ordinal suffix for a number.
 * @param {number} n
 * @returns {string}
 */
export function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}
