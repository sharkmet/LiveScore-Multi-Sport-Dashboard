export function getOrdinalSuffix(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

export function formatInning(period) {
  if (!period || period.current === 0) return 'Scheduled'
  const { current, label, isTopHalf } = period
  if (label === 'Final') return 'Final'
  if (label && label.startsWith('Final')) return label   // Final/OT, Final/SO
  if (label && label.startsWith('Delayed')) return label
  // Hockey: no isTopHalf — return label directly
  if (isTopHalf === undefined) return label ?? `P${current}`
  // Baseball: top/bot with ordinal
  const half = isTopHalf ? 'Top' : 'Bot'
  return `${half} ${getOrdinalSuffix(current)}`
}

export function formatStartTime(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function formatRelativeTime(isoString) {
  if (!isoString) return ''
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  return `${Math.floor(hours / 24)} days ago`
}

export function computeCumulativeRuns(timeline, teamKey) {
  let cumulative = 0
  return timeline.map((entry) => {
    cumulative += entry[teamKey]
    return { inning: entry.period, runs: cumulative }
  })
}
