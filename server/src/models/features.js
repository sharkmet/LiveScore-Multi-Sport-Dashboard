// Feature extraction for win probability models

// Run expectancy by base state (outs=0): [empty, 1B, 2B, 3B, 1B2B, 1B3B, 2B3B, loaded]
const RUN_EXPECTANCY = [0.48, 0.86, 1.10, 1.30, 1.48, 1.78, 1.96, 2.29]

export function calcBaseRunnerExpectedRuns(runners) {
  if (!runners) return 0
  const first  = runners.first  ? 1 : 0
  const second = runners.second ? 1 : 0
  const third  = runners.third  ? 1 : 0
  const idx = (first << 0) | (second << 1) | (third << 2)
  return RUN_EXPECTANCY[idx] ?? 0
}

export function ipToFloat(ipStr) {
  if (!ipStr && ipStr !== 0) return 0
  const s = String(ipStr)
  const [whole, outs] = s.split('.')
  return parseInt(whole, 10) + (parseInt(outs || '0', 10) / 3)
}

export function calcK9(k, ipFloat) {
  if (!ipFloat || ipFloat <= 0) return 0
  return (k / ipFloat) * 9
}

export function calcFip(hr, bb, k, ipFloat) {
  if (!ipFloat || ipFloat <= 0) return 4.20 // league avg fallback
  const safeHr = hr ?? 0
  return ((13 * safeHr + 3 * bb - 2 * k) / ipFloat) + 3.10
}

export function winPctFromRecord(record) {
  if (!record) return 0.5
  const match = String(record).match(/(\d+)-(\d+)/)
  if (!match) return 0.5
  const w = parseInt(match[1], 10)
  const l = parseInt(match[2], 10)
  const total = w + l
  return total > 0 ? w / total : 0.5
}

// wOBA approximation from available stats
export function calcWoba(batter) {
  if (!batter) return 0.320 // league avg
  if (batter.obp != null && batter.slg != null) {
    return batter.obp * 0.6 + batter.slg * 0.4
  }
  const avg = parseFloat(batter.avg) || 0.250
  return avg * 1.28
}

export function extractPregameFeatures(homeTeam, awayTeam, homeStarter, awayStarter) {
  const homeWinPct = winPctFromRecord(homeTeam?.record)
  const awayWinPct = winPctFromRecord(awayTeam?.record)
  const winPctDiff = homeWinPct - awayWinPct

  const homeIp  = ipToFloat(homeStarter?.ip ?? homeStarter?.seasonStats?.ip ?? '0.0')
  const awayIp  = ipToFloat(awayStarter?.ip ?? awayStarter?.seasonStats?.ip ?? '0.0')

  const homeEra  = parseFloat(homeStarter?.era ?? homeStarter?.seasonStats?.era ?? 4.5)
  const awayEra  = parseFloat(awayStarter?.era ?? awayStarter?.seasonStats?.era ?? 4.5)

  const homeWhip = parseFloat(homeStarter?.whip ?? homeStarter?.seasonStats?.whip ?? 1.30)
  const awayWhip = parseFloat(awayStarter?.whip ?? awayStarter?.seasonStats?.whip ?? 1.30)

  const homeK   = parseFloat(homeStarter?.k ?? homeStarter?.seasonStats?.k ?? 0)
  const awayK   = parseFloat(awayStarter?.k ?? awayStarter?.seasonStats?.k ?? 0)
  const homeBb  = parseFloat(homeStarter?.bb ?? homeStarter?.seasonStats?.bb ?? 0)
  const awayBb  = parseFloat(awayStarter?.bb ?? awayStarter?.seasonStats?.bb ?? 0)

  const homeFip  = calcFip(0, homeBb, homeK, homeIp)
  const awayFip  = calcFip(0, awayBb, awayK, awayIp)
  const homeK9   = calcK9(homeK, homeIp)
  const awayK9   = calcK9(awayK, awayIp)

  return {
    homeFieldAdvantage: 1,
    winPctDiff,
    starterEraDiff:   homeEra  - awayEra,
    starterWhipDiff:  homeWhip - awayWhip,
    starterFipDiff:   homeFip  - awayFip,
    starterK9Diff:    homeK9   - awayK9,
  }
}

export function extractInGameFeatures(game) {
  const homeRuns = game.score?.home ?? 0
  const awayRuns = game.score?.away ?? 0
  const runDiff  = homeRuns - awayRuns

  // outsUsed: inning * 3 + outs in current half
  const inning    = game.period?.inning ?? 1
  const isTop     = game.period?.isTopHalf !== false
  const outsInHalf = game.matchup?.count?.outs ?? 0

  // Each full inning = 6 outs (both halves), current half contributes 3 * (inning - 1) + outsInHalf for the home perspective
  // Simple: total outs from 54 (9 innings × 6 outs)
  const outsUsed    = Math.max(0, (inning - 1) * 6 + (isTop ? 0 : 3) + outsInHalf)
  const outsRemaining = Math.max(0, 54 - outsUsed)
  const gameProgress  = Math.min(1, outsUsed / 54)

  const runners         = game.matchup?.runners
  const baseRunnerValue = calcBaseRunnerExpectedRuns(runners)

  const pitcherEra  = parseFloat(game.matchup?.pitcher?.era ?? 4.5)
  const batterWoba  = calcWoba(game.matchup?.batter)

  return {
    runDiff,
    gameProgress,
    outsRemaining,
    baseRunnerValue,
    currentPitcherEra: pitcherEra,
    currentBatterWoba: batterWoba,
    runDiffXgameProgress: runDiff * gameProgress,
  }
}
