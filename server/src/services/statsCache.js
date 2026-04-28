// Team season stats cache with 6-hour TTL
const TEAM_STATS_TTL_MS = 6 * 60 * 60 * 1000

const teamStatsCache = new Map()

export function getTeamStats(teamId) {
  const entry = teamStatsCache.get(teamId)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    teamStatsCache.delete(teamId)
    return null
  }
  return entry.data
}

export function setTeamStats(teamId, stats) {
  teamStatsCache.set(teamId, {
    data: stats,
    expiresAt: Date.now() + TEAM_STATS_TTL_MS,
  })
}
