/**
 * NHL adapter — fetches from api-web.nhle.com/v1/ and normalizes to GameEvent.
 * Falls back to bundled mock data when USE_MOCK_DATA=true or the API is unreachable.
 */

import {
  mapNhlStatus,
  buildPeriodLabel,
  buildFinalLabel,
  parseSituationCode,
} from '../utils/nhl-normalize.js'
import NHL_MOCK_GAMES from '../mocks/nhl-mock-data.js'

export const league = 'nhl'

const BASE_URL = 'https://api-web.nhle.com/v1'
const USE_MOCK  = process.env.USE_MOCK_DATA === 'true'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

async function nhleGet(path) {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, { headers: { 'User-Agent': 'sports-stats-tracker/1.0' } })
  if (!res.ok) throw new Error(`NHL API ${res.status} for ${url}`)
  return res.json()
}

// ─── Team normalization ────────────────────────────────────────────────────────

const NHL_NAMES = {
  ANA:'Ducks',   ARI:'Coyotes',  BOS:'Bruins',       BUF:'Sabres',
  CGY:'Flames',  CAR:'Hurricanes',CHI:'Blackhawks',   COL:'Avalanche',
  CBJ:'Blue Jackets',DAL:'Stars',DET:'Red Wings',     EDM:'Oilers',
  FLA:'Panthers',LAK:'Kings',    MIN:'Wild',           MTL:'Canadiens',
  NSH:'Predators',NJD:'Devils',  NYI:'Islanders',     NYR:'Rangers',
  OTT:'Senators',PHI:'Flyers',   PIT:'Penguins',      SEA:'Kraken',
  SJS:'Sharks',  STL:'Blues',    TBL:'Lightning',     TOR:'Maple Leafs',
  VAN:'Canucks', VGK:'Golden Knights',WAS:'Capitals', WPG:'Jets',
  UTA:'Hockey Club',
}

function normalizeTeam(teamData) {
  const abbrev = teamData?.abbrev ?? teamData?.triCode ?? '???'
  const name   = teamData?.name?.default ?? teamData?.fullName ?? NHL_NAMES[abbrev] ?? abbrev
  const record = teamData?.record
    ? `${teamData.record.wins}-${teamData.record.losses}-${teamData.record.otLosses}`
    : undefined
  return { id: abbrev, name, abbreviation: abbrev, record }
}

// ─── Schedule normalization ────────────────────────────────────────────────────

function normalizeScheduleGame(raw, scheduleDay) {
  const gameState  = raw.gameState ?? 'FUT'
  const status     = mapNhlStatus(gameState)
  const homeAbbrev = raw.homeTeam?.abbrev ?? 'HOME'
  const awayAbbrev = raw.awayTeam?.abbrev ?? 'AWAY'
  const period     = {
    current:      raw.period ?? 0,
    label:        status === 'final'
                    ? buildFinalLabel(raw.period)
                    : status === 'live'
                      ? (buildPeriodLabel(raw.period) ?? 'Live')
                      : 'Scheduled',
    totalPeriods: 3,
  }

  const situation  = parseSituationCode(raw.situationCode)
  const homeScore  = raw.homeTeam?.score ?? 0
  const awayScore  = raw.awayTeam?.score ?? 0

  const matchup = status === 'live' ? {
    period,
    strength:      situation.strength,
    strengthLabel: situation.strengthLabel,
    shotsOnGoal:   { home: raw.homeTeam?.sog ?? 0, away: raw.awayTeam?.sog ?? 0 },
    homeOnIce:     [],
    awayOnIce:     [],
    penalties:     [],
  } : null

  return {
    gameId:                String(raw.id),
    league:                'nhl',
    status,
    scheduleDay,
    startTime:             raw.startTimeUTC ?? new Date().toISOString(),
    updatedAt:             new Date().toISOString(),
    homeTeam:              normalizeTeam({ ...raw.homeTeam }),
    awayTeam:              normalizeTeam({ ...raw.awayTeam }),
    score:                 { home: homeScore, away: awayScore },
    period,
    lastPlay:              raw.lastPeriodTypeCode ? buildFinalLabel(raw.period) : null,
    timeline:              [],
    winProbabilityTimeline: [],
    matchup,
    goals:                 [],
    boxScore:              null,
    _goalieIds:            { home: null, away: null },
    _shotsOnGoal:          { home: raw.homeTeam?.sog ?? 0, away: raw.awayTeam?.sog ?? 0 },
    _powerPlayState:       situation.homeSkaters > situation.awaySkaters ? 1
                             : situation.awaySkaters > situation.homeSkaters ? -1
                             : 0,
    _situationCode:        raw.situationCode ?? null,
  }
}

// ─── Boxscore normalization ────────────────────────────────────────────────────

function buildTimelineFromGoals(goals, homeAbbrev) {
  if (!goals?.length) return []
  const byPeriod = {}
  for (const g of goals) {
    if (!byPeriod[g.period]) byPeriod[g.period] = { home: 0, away: 0 }
    if (g.team === homeAbbrev) byPeriod[g.period].home++
    else byPeriod[g.period].away++
  }
  return ['1st', '2nd', '3rd', 'OT', 'SO']
    .filter(p => byPeriod[p])
    .map(p => ({ periodLabel: p, homeScore: byPeriod[p].home, awayScore: byPeriod[p].away }))
}

function normalizePeriodLine(scoring) {
  if (!scoring?.length) return []
  return scoring.map((p) => ({
    periodLabel: buildPeriodLabel(p.periodDescriptor?.number) ?? p.periodDescriptor?.periodType ?? '?',
    homeScore:   p.home ?? 0,
    awayScore:   p.away ?? 0,
  }))
}

/**
 * Normalize goals from /gamecenter/{id}/landing summary.scoring array.
 * Each element: { periodDescriptor, goals: [{ teamAbbrev, name, assists, strength, timeInPeriod }] }
 */
function normalizeGoalsFromLanding(scoringPeriods) {
  if (!scoringPeriods?.length) return []
  const goals = []
  for (const period of scoringPeriods) {
    const periodLabel = buildPeriodLabel(period.periodDescriptor?.number) ?? '?'
    for (const goal of period.goals ?? []) {
      const assists = (goal.assists ?? []).map((a) => a.name?.default ?? '')
      goals.push({
        period:  periodLabel,
        time:    goal.timeInPeriod ?? '0:00',
        team:    goal.teamAbbrev?.default ?? goal.teamAbbrev ?? '?',
        scorer:  goal.name?.default ?? 'Unknown',
        assists,
        type:    goal.strength ?? 'EV',
      })
    }
  }
  return goals
}

/**
 * Fallback: extract goals from play-by-play events + rosterSpots name lookup.
 */
function normalizeGoalsFromPbp(plays, rosterSpots) {
  const roster = {}
  for (const r of rosterSpots ?? []) {
    roster[r.playerId] = `${r.firstName?.default?.[0] ?? ''}. ${r.lastName?.default ?? ''}`
  }

  const goals = []
  for (const play of plays ?? []) {
    if (play.typeDescKey !== 'goal') continue
    const d = play.details ?? {}
    const scorer  = roster[d.scoringPlayerId] ?? 'Unknown'
    const assists = [d.assist1PlayerId, d.assist2PlayerId]
      .filter(Boolean)
      .map((id) => roster[id] ?? '')
      .filter(Boolean)
    goals.push({
      period:  buildPeriodLabel(play.periodDescriptor?.number) ?? '?',
      time:    play.timeInPeriod ?? '0:00',
      team:    play.details?.eventOwnerTeamId ? '?' : '?',  // abbrev not in pbp details directly
      scorer,
      assists,
      type:    play.situationCode ? parseSituationCode(play.situationCode).strength : 'EV',
    })
  }
  return goals
}

function normalizeSkaters(players) {
  if (!players?.length) return []
  return players.map((p) => ({
    name:         p.name?.default ?? (`${p.firstName?.default ?? ''} ${p.lastName?.default ?? ''}`.trim() || 'Unknown'),
    goals:        p.goals ?? 0,
    assists:      p.assists ?? 0,
    points:       (p.goals ?? 0) + (p.assists ?? 0),
    plusMinus:    p.plusMinus ?? 0,
    pim:          p.pim ?? 0,
    shots:        p.shots ?? p.shotsOnGoal ?? p.sog ?? 0,
    hits:         p.hits ?? 0,
    blockedShots: p.blockedShots ?? p.blocked ?? 0,
    timeOnIce:    p.toi ?? '0:00',
  }))
}

function normalizeGoalies(players) {
  if (!players?.length) return []
  return players.map((p) => ({
    name:           p.name?.default ?? 'Unknown',
    goalsAgainst:   p.goalsAgainst ?? 0,
    shotsAgainst:   p.shotsAgainst ?? 0,
    savePercentage: p.savePctg != null ? `.${Math.round(p.savePctg * 1000)}` : '.000',
    timeOnIce:      p.toi ?? '0:00',
  }))
}

function normalizeTeamStats(teamBox, playerBox) {
  // NHL API returns PP as "goals/opportunities" string, not separate fields
  const ppParts = (teamBox?.powerPlayConversion ?? '').split('/')
  const ppGoals = parseInt(ppParts[0] ?? 0, 10) || (teamBox?.ppGoals ?? 0)
  const ppOpp   = parseInt(ppParts[1] ?? 0, 10) || (teamBox?.ppOpp ?? 0)

  // Aggregate from player stats as fallback for any stat the team object omits
  const allPlayers = [...(playerBox?.forwards ?? []), ...(playerBox?.defense ?? [])]
  const hitsFromPlayers   = allPlayers.reduce((s, p) => s + (p.hits ?? 0), 0)
  const blocksFromPlayers = allPlayers.reduce((s, p) => s + (p.blockedShots ?? p.blocked ?? 0), 0)
  const pimFromPlayers    = allPlayers.reduce((s, p) => s + (p.pim ?? 0), 0)

  // Faceoff %: aggregate won/taken from players if team-level pctg is absent
  const foWon   = allPlayers.reduce((s, p) => s + (p.faceoffWins ?? p.faceoffsWon ?? 0), 0)
  const foTotal = allPlayers.reduce((s, p) => s + (p.faceoffWins ?? 0) + (p.faceoffLosses ?? p.faceoffsLost ?? 0), 0)
  const foFromPlayers = foTotal > 0 ? parseFloat(((foWon / foTotal) * 100).toFixed(1)) : null

  return {
    goals:                  teamBox?.score ?? 0,
    shotsOnGoal:            teamBox?.sog ?? 0,
    powerPlayGoals:         ppGoals,
    powerPlayOpportunities: ppOpp,
    pim:                    teamBox?.pim ?? (pimFromPlayers || null),
    hits:                   teamBox?.hits ?? (hitsFromPlayers || null),
    blockedShots:           teamBox?.blockedShots ?? (blocksFromPlayers || null),
    faceoffWinPct:          teamBox?.faceoffWinningPctg ?? foFromPlayers,
    giveaways:              teamBox?.giveaways ?? null,
    takeaways:              teamBox?.takeaways ?? null,
  }
}

const PBP_TYPES = new Set(['goal','penalty','shot-on-goal','blocked-shot','hit','period-end'])

function normalizeRecentPlays(plays, rosterSpots, homeNumId, awayNumId, homeAbbrev, awayAbbrev) {
  const roster = {}
  for (const r of rosterSpots ?? []) {
    const first = r.firstName?.default ?? ''
    const last  = r.lastName?.default ?? ''
    roster[r.playerId] = first ? `${first[0]}. ${last}` : last
  }

  const filtered = (plays ?? []).filter(p => PBP_TYPES.has(p.typeDescKey))

  return filtered.slice(-40).map(p => {
    const d = p.details ?? {}
    const num = p.periodDescriptor?.number ?? 1
    const ptype = p.periodDescriptor?.periodType ?? 'REG'
    const period = ptype === 'SO' ? 'SO' : ptype === 'OT' || num > 3 ? 'OT' : ['1st','2nd','3rd'][num - 1] ?? `P${num}`

    const teamNumId = String(d.eventOwnerTeamId ?? d.teamId ?? '')
    const isHome = teamNumId === String(homeNumId) ? true : teamNumId === String(awayNumId) ? false : null
    const teamAbbrev = isHome === true ? homeAbbrev : isHome === false ? awayAbbrev : null

    const type = p.typeDescKey
    let playerName = null
    let description = ''

    switch (type) {
      case 'goal': {
        playerName = roster[d.scoringPlayerId] ?? null
        const assists = [d.assist1PlayerId, d.assist2PlayerId].filter(Boolean).map(id => roster[id] ?? '').filter(Boolean)
        description = assists.length ? `A: ${assists.join(', ')}` : 'Unassisted'
        break
      }
      case 'penalty':
        playerName = roster[d.committedByPlayerId] ?? null
        description = `${d.descKey ?? 'Penalty'} · ${d.duration ?? 2} min`
        break
      case 'shot-on-goal':
        playerName = roster[d.shootingPlayerId] ?? null
        description = `${d.shotType ?? 'Shot'} on goal`
        break
      case 'blocked-shot':
        playerName = roster[d.blockingPlayerId] ?? null
        description = 'Blocked shot'
        break
      case 'hit':
        playerName = roster[d.hittingPlayerId] ?? null
        description = 'Hit'
        break
      case 'period-end':
        description = `End of ${period}`
        break
      default:
        description = type
    }

    return {
      eventId: p.eventId,
      type,
      isGoal: type === 'goal',
      isPenalty: type === 'penalty',
      isPeriodEnd: type === 'period-end',
      period,
      time: p.timeInPeriod ?? '0:00',
      isHome,
      teamAbbrev,
      playerName,
      description,
    }
  }).reverse()
}

/**
 * @param {object} playerStatsData - boxData.playerByGameStats (forwards/defense/goalies per team)
 * @param {object} homeTeamData    - boxData.homeTeam (score, sog, ppGoals, ppOpp, pim)
 * @param {object} awayTeamData    - boxData.awayTeam
 */
function normalizeBoxScore(playerStatsData, homeTeamData, awayTeamData) {
  if (!playerStatsData && !homeTeamData) return null
  const homeBox = playerStatsData?.homeTeam
  const awayBox = playerStatsData?.awayTeam

  const homeSk = normalizeSkaters([...(homeBox?.forwards ?? []), ...(homeBox?.defense ?? [])])
  const awaySk = normalizeSkaters([...(awayBox?.forwards ?? []), ...(awayBox?.defense ?? [])])
  const homeGl = normalizeGoalies(homeBox?.goalies ?? [])
  const awayGl = normalizeGoalies(awayBox?.goalies ?? [])

  return {
    home: { skaters: homeSk, goalies: homeGl, totals: normalizeTeamStats(homeTeamData, homeBox) },
    away: { skaters: awaySk, goalies: awayGl, totals: normalizeTeamStats(awayTeamData, awayBox) },
  }
}

// ─── Live-game on-ice normalization ──────────────────────────────────────────

function normalizeOnIce(players) {
  if (!players?.length) return []
  return players.map((p) => ({
    id:       String(p.playerId ?? p.id ?? ''),
    name:     `${(p.firstName?.default ?? '').charAt(0)}. ${p.lastName?.default ?? p.name ?? ''}`.trim(),
    number:   String(p.sweaterNumber ?? p.number ?? ''),
    position: p.positionCode ?? p.position ?? '',
  }))
}

function timeToSeconds(timeStr) {
  const [min, sec] = (timeStr ?? '0:00').split(':').map(Number)
  return (min || 0) * 60 + (sec || 0)
}

function derivePowerPlayState(situation) {
  const { homeSkaters, awaySkaters } = situation
  const diff = homeSkaters - awaySkaters
  if (diff >= 2)  return '5v3_home'
  if (diff === 1) return 'home_pp'
  if (diff === -1) return 'away_pp'
  if (diff <= -2) return '5v3_away'
  return 'even'
}

const PERIOD_ORDER = ['1st', '2nd', '3rd', 'OT', '2OT', '3OT', 'SO']

function nhlGoalWP(lead, periodNum, timeElapsedInPeriod) {
  // OT/SO: result is effectively decided
  if (periodNum >= 4) {
    if (lead > 0) return 0.998
    if (lead < 0) return 0.002
    return 0.52
  }
  const periodSecsRemaining = Math.max(0, 1200 - timeElapsedInPeriod)
  const secondsRemaining = (3 - periodNum) * 1200 + periodSecsRemaining
  if (secondsRemaining <= 0) {
    if (lead > 0) return 0.998
    if (lead < 0) return 0.002
    return 0.52
  }
  const t = secondsRemaining / 3600
  const mu = lead + 0.20 * t
  // sigma=2.5 gives ~64-68% for early 1-goal lead vs 1.85 which was too aggressive.
  // Cap at 95% to account for empty-net volatility in final 2 min.
  const sigma = 2.5 * Math.sqrt(t)
  const p = normalCDFInline(mu / sigma)
  return Math.max(0.01, Math.min(0.95, p))
}

function normalCDFInline(z) {
  const sign = z < 0 ? -1 : 1
  const x = Math.abs(z) / Math.SQRT2
  const t = 1 / (1 + 0.3275911 * x)
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return 0.5 * (1 + sign * y)
}

/**
 * Build WP timeline from per-period scores (like NBA's quarter approach).
 * Gives a complete period-end spine even when goal data is unavailable.
 * scoring = boxData.linescore.byPeriod — each entry has { periodDescriptor.number, home, away }
 */
function buildWpTimelineFromPeriods(scoring) {
  if (!scoring?.length) return []
  let homeTotal = 0, awayTotal = 0
  const points = [{ home: 0.5, period: 0, periodLabel: 'Start', gameProgress: 0 }]
  for (const p of scoring) {
    const num = p.periodDescriptor?.number ?? p.period ?? p.num ?? 1
    homeTotal += p.home ?? 0
    awayTotal += p.away ?? 0
    const lead = homeTotal - awayTotal
    const gameProgress = num <= 3 ? Math.min(1, (num * 1200) / 3600) : 1.0
    const periodLabel = num === 1 ? '1st' : num === 2 ? '2nd' : num === 3 ? '3rd' : num === 4 ? 'OT' : 'SO'
    points.push({
      home: parseFloat(nhlGoalWP(lead, num, 1200).toFixed(3)),
      period: num,
      periodLabel,
      gameProgress,
    })
  }
  return points
}

function buildWinProbTimeline(goals, homeAbbrev) {
  let homeGoals = 0, awayGoals = 0
  const timeline = [{ home: 0.5, period: 0, periodLabel: 'Start', gameProgress: 0 }]
  for (const goal of goals) {
    if (goal.team === homeAbbrev) homeGoals++
    else awayGoals++
    const periodIdx = PERIOD_ORDER.indexOf(goal.period)
    const periodNum = periodIdx >= 0 ? periodIdx + 1 : 1
    // goal.time is "MM:SS" elapsed in the period
    const [m, s] = (goal.time ?? '0:00').split(':').map(Number)
    const timeElapsed = (m || 0) * 60 + (s || 0)
    const home = parseFloat(nhlGoalWP(homeGoals - awayGoals, periodNum, timeElapsed).toFixed(3))
    // gameProgress uses elapsed time (goal.time is elapsed, not remaining)
    const gameProgress = periodNum <= 3
      ? Math.min(1, ((periodNum - 1) * 1200 + timeElapsed) / 3600)
      : 1.0
    timeline.push({
      home,
      period: periodNum,
      periodLabel: `${goal.period} ${goal.time}`,
      gameProgress,
    })
  }
  return timeline
}

/**
 * Derive currently-serving penalties from play-by-play events.
 * Compares each penalty's start time + duration against current game clock.
 * Skips game misconducts and match penalties (no man-advantage effect).
 */
function extractActivePenalties(plays, rosterSpots, currentPeriod, clockTimeRemaining) {
  const roster = {}
  for (const r of rosterSpots ?? []) {
    const first = r.firstName?.default ?? ''
    const last  = r.lastName?.default ?? ''
    roster[r.playerId] = first ? `${first[0]}. ${last}` : last
  }

  const PERIOD_SECS = 20 * 60
  const currentTimeInPeriod = PERIOD_SECS - timeToSeconds(clockTimeRemaining)
  const currentAbsolute     = (currentPeriod - 1) * PERIOD_SECS + currentTimeInPeriod

  const active = []
  for (const play of plays ?? []) {
    if (play.typeDescKey !== 'penalty') continue
    const d        = play.details ?? {}
    const typeCode = d.typeCode ?? ''
    // Game misconducts / match penalties / penalty shots don't create a man-advantage
    if (typeCode === 'GAME' || typeCode === 'MATCH' || typeCode === 'PS') continue

    const penaltyPeriod = play.periodDescriptor?.number ?? 1
    const startInPeriod = timeToSeconds(play.timeInPeriod)
    const durationSecs  = (d.duration ?? 2) * 60
    const startAbsolute = (penaltyPeriod - 1) * PERIOD_SECS + startInPeriod
    const endAbsolute   = startAbsolute + durationSecs

    if (currentAbsolute >= startAbsolute && currentAbsolute < endAbsolute) {
      const remaining = endAbsolute - currentAbsolute
      const mins      = Math.floor(remaining / 60)
      const secs      = remaining % 60
      active.push({
        team:          d.teamAbbrev?.default ?? d.teamAbbrev ?? '?',
        player:        roster[d.committedByPlayerId] ?? 'Unknown',
        infraction:    d.descKey ?? typeCode ?? 'Unknown',
        timeRemaining: `${mins}:${String(secs).padStart(2, '0')}`,
      })
    }
  }
  return active
}

// ─── PBP-based stat counters ──────────────────────────────────────────────────

function countPPFromPbp(plays, homeId, awayId) {
  let homePPOpp = 0, awayPPOpp = 0, homePPGoals = 0, awayPPGoals = 0
  const hId = String(homeId ?? ''), aId = String(awayId ?? '')

  for (const play of plays ?? []) {
    const d = play.details ?? {}

    if (play.typeDescKey === 'penalty') {
      const typeCode = d.typeCode ?? ''
      if (typeCode === 'GAME' || typeCode === 'MATCH' || typeCode === 'PS') continue
      const teamId = String(d.teamId ?? d.eventOwnerTeamId ?? '')
      if (teamId === hId) awayPPOpp++
      else if (teamId === aId) homePPOpp++
    }

    if (play.typeDescKey === 'goal') {
      const sit = parseSituationCode(play.situationCode)
      if (sit.strength !== 'PP' || sit.awayGoalie === 0 || sit.homeGoalie === 0) continue
      const scorerId = String(d.eventOwnerTeamId ?? d.teamId ?? '')
      if (sit.homeSkaters > sit.awaySkaters && scorerId === hId) homePPGoals++
      else if (sit.awaySkaters > sit.homeSkaters && scorerId === aId) awayPPGoals++
    }
  }

  return { homePPOpp, awayPPOpp, homePPGoals, awayPPGoals }
}

function countFaceoffsFromPbp(plays, rosterSpots, homeId, awayId) {
  const hId = String(homeId ?? ''), aId = String(awayId ?? '')
  const playerTeam = {}
  for (const r of rosterSpots ?? []) {
    playerTeam[r.playerId] = String(r.teamId ?? r.currentTeamId ?? '')
  }

  let homeWon = 0, homeTotal = 0, awayWon = 0, awayTotal = 0
  for (const play of plays ?? []) {
    if (play.typeDescKey !== 'faceoff') continue
    const d = play.details ?? {}
    const winnerId = d.winningPlayerId
    if (!winnerId) continue
    const winTeam = playerTeam[winnerId] ?? String(d.eventOwnerTeamId ?? '')
    if (winTeam === hId)      { homeWon++;  homeTotal++; awayTotal++ }
    else if (winTeam === aId) { awayWon++;  awayTotal++; homeTotal++ }
  }

  return {
    homeFO: homeTotal > 0 ? parseFloat(((homeWon / homeTotal) * 100).toFixed(1)) : null,
    awayFO: awayTotal > 0 ? parseFloat(((awayWon / awayTotal) * 100).toFixed(1)) : null,
  }
}

// ─── Landing teamGameStats parser ────────────────────────────────────────────

function parseLandingTeamStats(teamGameStats) {
  const home = {}, away = {}
  for (const s of teamGameStats ?? []) {
    home[s.category] = s.homeValue
    away[s.category] = s.awayValue
  }
  return { home, away }
}

function parsePPString(val) {
  const parts = String(val ?? '').split('/')
  return {
    goals: parseInt(parts[0] ?? 0, 10) || 0,
    opp:   parseInt(parts[1] ?? 0, 10) || 0,
  }
}

// ─── Full live game fetch ─────────────────────────────────────────────────────

async function enrichLiveGame(gameId, baseGame) {
  try {
    const [boxData, pbpData, landingData] = await Promise.all([
      nhleGet(`/gamecenter/${gameId}/boxscore`),
      nhleGet(`/gamecenter/${gameId}/play-by-play`),
      nhleGet(`/gamecenter/${gameId}/landing`),
    ])

    const scoring  = boxData.linescore?.byPeriod ?? boxData.linescore?.periods ?? []
    let timeline   = normalizePeriodLine(scoring)

    // Landing summary.scoring has full goal details (scorer name, assists, strength)
    const rawGoals  = landingData?.summary?.scoring ?? []
    const goals     = rawGoals.length > 0
      ? normalizeGoalsFromLanding(rawGoals)
      : normalizeGoalsFromPbp(pbpData?.plays ?? [], pbpData?.rosterSpots ?? [])

    // If linescore byPeriod was empty, reconstruct period scores from goals
    if (!timeline.length && goals.length > 0) {
      timeline = buildTimelineFromGoals(goals, baseGame.homeTeam.abbreviation)
    }

    // Period-end WP spine (always available from boxscore, like NBA's quarter approach)
    const periodWpTimeline = buildWpTimelineFromPeriods(scoring)
    // Goal-by-goal WP events (granular but sparse)
    const goalWpTimeline = buildWinProbTimeline(goals, baseGame.homeTeam.abbreviation)
    // Merge: period-end spine + goal events, sorted by gameProgress, deduped
    const mergedWpTimeline = [...periodWpTimeline, ...goalWpTimeline]
      .sort((a, b) => a.gameProgress - b.gameProgress)
      .filter((pt, i, arr) => i === 0 || Math.abs(pt.gameProgress - arr[i - 1].gameProgress) > 0.002)
    const winProbabilityTimeline = mergedWpTimeline.length > 1
      ? mergedWpTimeline
      : goalWpTimeline.length > 0 ? goalWpTimeline : periodWpTimeline

    // playerByGameStats holds per-player stats; top-level homeTeam/awayTeam hold team totals
    const boxScore = normalizeBoxScore(
      boxData.playerByGameStats,
      boxData.homeTeam,
      boxData.awayTeam,
    )

    // PP and FO% from PBP (counted from play events — works for live and final games)
    const homeId = pbpData?.homeTeam?.id
    const awayId = pbpData?.awayTeam?.id
    const ppStats = countPPFromPbp(pbpData?.plays ?? [], homeId, awayId)
    const foStats = countFaceoffsFromPbp(pbpData?.plays ?? [], pbpData?.rosterSpots ?? [], homeId, awayId)

    if (boxScore) {
      boxScore.home.totals.powerPlayGoals         = ppStats.homePPGoals
      boxScore.home.totals.powerPlayOpportunities = ppStats.homePPOpp
      boxScore.away.totals.powerPlayGoals         = ppStats.awayPPGoals
      boxScore.away.totals.powerPlayOpportunities = ppStats.awayPPOpp
      if (foStats.homeFO !== null) boxScore.home.totals.faceoffWinPct = foStats.homeFO
      if (foStats.awayFO !== null) boxScore.away.totals.faceoffWinPct = foStats.awayFO
    }

    // Override with landing teamGameStats if available (more authoritative for final games)
    const landingStats = parseLandingTeamStats(landingData?.summary?.teamGameStats)
    if (boxScore && landingStats) {
      const homePP = parsePPString(landingStats.home.powerPlay)
      const awayPP = parsePPString(landingStats.away.powerPlay)
      if (homePP.opp > 0 || awayPP.opp > 0) {
        boxScore.home.totals.powerPlayGoals         = homePP.goals
        boxScore.home.totals.powerPlayOpportunities = homePP.opp
        boxScore.away.totals.powerPlayGoals         = awayPP.goals
        boxScore.away.totals.powerPlayOpportunities = awayPP.opp
      }
      const homeFO = parseFloat(landingStats.home.faceoffWinningPctg ?? 0)
      const awayFO = parseFloat(landingStats.away.faceoffWinningPctg ?? 0)
      if (homeFO > 0 || awayFO > 0) {
        boxScore.home.totals.faceoffWinPct = homeFO
        boxScore.away.totals.faceoffWinPct = awayFO
      }
    }

    // Play-by-play feed (most recent first, goals/penalties/shots/hits only)
    const recentPlays = normalizeRecentPlays(
      pbpData?.plays ?? [],
      pbpData?.rosterSpots ?? [],
      pbpData?.homeTeam?.id ?? null,
      pbpData?.awayTeam?.id ?? null,
      baseGame.homeTeam?.abbreviation ?? '',
      baseGame.awayTeam?.abbreviation ?? '',
    )

    // situationCode lives at pbpData.situation.situationCode or pbpData.situationCode
    const sitCode      = pbpData?.situation?.situationCode ?? pbpData?.situationCode
    const situation    = parseSituationCode(sitCode)
    const homeScore    = pbpData?.homeTeam?.score ?? baseGame.score.home
    const awayScore    = pbpData?.awayTeam?.score ?? baseGame.score.away
    // Derive current period using both sources and take the higher value — a period
    // can only advance, so max() is always correct:
    //   - Start of P3 (no P3 plays yet): pbpData.period=3, lastPlay.period=2 → max=3 ✓
    //   - Mid P2: pbpData.period=2, lastPlay.period=2 → max=2 ✓
    //   - pbpData.period missing: pbpData=0, lastPlay.period=2 → max=2 ✓
    const allPbpPlays = pbpData?.plays ?? []
    const lastPbpPlay = allPbpPlays[allPbpPlays.length - 1] ?? null
    const pbpPeriod      = pbpData?.period ?? 0
    const lastPlayPeriod = lastPbpPlay?.periodDescriptor?.number ?? 0
    const currentPeriod  = Math.max(pbpPeriod, lastPlayPeriod) || baseGame.period.current
    const rawTimeRemaining = pbpData?.clock?.timeRemaining ?? '20:00'
    const inIntermission   = pbpData?.clock?.inIntermission ?? pbpData?.inIntermission ?? false
    const intermissionLabel = inIntermission
      ? (currentPeriod === 1 ? '1st Intermission' : currentPeriod === 2 ? '2nd Intermission' : 'Intermission')
      : null
    const timeRemaining = intermissionLabel ?? rawTimeRemaining

    const matchup = baseGame.status === 'live' ? {
      period: {
        current:        currentPeriod,
        label:          buildPeriodLabel(currentPeriod) ?? 'Live',
        timeRemaining,
        inIntermission,
      },
      strength:      situation.strength,
      strengthLabel: situation.strengthLabel,
      shotsOnGoal: {
        home: pbpData?.homeTeam?.sog ?? 0,
        away: pbpData?.awayTeam?.sog ?? 0,
      },
      // situation.homeTeam.onIce / awayTeam.onIce — present in live API responses
      homeOnIce: normalizeOnIce(pbpData?.situation?.homeTeam?.onIce ?? []),
      awayOnIce: normalizeOnIce(pbpData?.situation?.awayTeam?.onIce ?? []),
      penalties: extractActivePenalties(
        pbpData?.plays ?? [],
        pbpData?.rosterSpots ?? [],
        currentPeriod,
        timeRemaining,
      ),
    } : null

    const lastGoalEvent = goals.length > 0 ? goals[goals.length - 1] : null
    const lastPlay = lastGoalEvent
      ? (() => {
          const assists = lastGoalEvent.assists?.length
            ? ` (${lastGoalEvent.assists.join(', ')})`
            : ' (unassisted)'
          const strength = lastGoalEvent.type && lastGoalEvent.type !== 'EV'
            ? ` · ${lastGoalEvent.type}`
            : ''
          return `${lastGoalEvent.scorer}${assists} — ${lastGoalEvent.team} · ${lastGoalEvent.period} ${lastGoalEvent.time}${strength}`
        })()
      : baseGame.lastPlay

    const homeGoalieId = boxData.playerByGameStats?.homeTeam?.goalies?.[0]?.playerId ?? null
    const awayGoalieId = boxData.playerByGameStats?.awayTeam?.goalies?.[0]?.playerId ?? null

    const clockSeconds = inIntermission ? 0 : timeToSeconds(rawTimeRemaining)
    const isEmptyNet   = situation.homeGoalie === 0 || situation.awayGoalie === 0
    const isOvertime   = currentPeriod > 3
    const isShootout   = false  // populated by shooter-specific logic if needed

    return {
      ...baseGame,
      score:   { home: homeScore, away: awayScore },
      period:  {
        current:      currentPeriod,
        label:        baseGame.status === 'final' ? buildFinalLabel(currentPeriod) : buildPeriodLabel(currentPeriod) ?? 'Live',
        totalPeriods: Math.max(3, currentPeriod),
        clockSeconds,
        timeRemaining,
      },
      lastPlay: lastPlay ?? baseGame.lastPlay,
      recentPlays,
      timeline,
      winProbabilityTimeline,
      goals,
      boxScore,
      matchup,
      powerPlayState:  derivePowerPlayState(situation),
      isEmptyNet,
      isOvertime,
      isShootout,
      _goalieIds:     { home: homeGoalieId ? String(homeGoalieId) : null, away: awayGoalieId ? String(awayGoalieId) : null },
      _shotsOnGoal:   { home: pbpData?.homeTeam?.sog ?? 0, away: pbpData?.awayTeam?.sog ?? 0 },
      _powerPlayState: situation.homeSkaters > situation.awaySkaters ? 1
                         : situation.awaySkaters > situation.homeSkaters ? -1
                         : 0,
      _situationCode:  sitCode ?? null,
    }
  } catch (err) {
    console.warn(`[NHL] enrichLiveGame(${gameId}) failed:`, err.message)
    return baseGame
  }
}

// ─── Public adapter API ───────────────────────────────────────────────────────

/**
 * @param {Date} date
 * @param {'yesterday'|'today'|'tomorrow'} scheduleDay
 * @returns {Promise<object[]>}
 */
export async function fetchSchedule(date, scheduleDay) {
  if (USE_MOCK) {
    return NHL_MOCK_GAMES
      .filter((g) => g.scheduleDay === scheduleDay)
      .map((g) => g.status === 'live' ? { ...g, updatedAt: new Date().toISOString() } : g)
  }

  try {
    const dateStr = toDateStr(date)
    const data    = await nhleGet(`/schedule/${dateStr}`)
    const days    = data.gameWeek ?? []
    const dayData = days.find((d) => d.date === dateStr)
    const rawGames = dayData?.games ?? []
    return rawGames.map((g) => normalizeScheduleGame(g, scheduleDay))
  } catch (err) {
    console.warn(`[NHL] fetchSchedule(${toDateStr(date)}) failed:`, err.message)
    return []
  }
}

/**
 * @param {string} gameId
 * @returns {Promise<object>}
 */
export async function fetchLiveGame(gameId) {
  if (USE_MOCK) {
    const game = NHL_MOCK_GAMES.find((g) => g.gameId === gameId)
    if (!game) throw new Error(`NHL mock: unknown gameId ${gameId}`)
    return { ...game, updatedAt: new Date().toISOString() }
  }

  try {
    const boxData   = await nhleGet(`/gamecenter/${gameId}/boxscore`)
    const gameState = boxData.gameState ?? 'LIVE'
    const status    = mapNhlStatus(gameState)
    const homeScore = boxData.homeTeam?.score ?? 0
    const awayScore = boxData.awayTeam?.score ?? 0
    const currentPeriod = boxData.period ?? 1

    const base = {
      gameId:    String(gameId),
      league:    'nhl',
      status,
      scheduleDay: 'today',
      startTime:  boxData.startTimeUTC ?? new Date().toISOString(),
      updatedAt:  new Date().toISOString(),
      homeTeam:   normalizeTeam(boxData.homeTeam ?? {}),
      awayTeam:   normalizeTeam(boxData.awayTeam ?? {}),
      score:      { home: homeScore, away: awayScore },
      period:     {
        current:      currentPeriod,
        label:        status === 'final' ? buildFinalLabel(currentPeriod) : buildPeriodLabel(currentPeriod) ?? 'Live',
        totalPeriods: Math.max(3, currentPeriod),
      },
      lastPlay:              null,
      timeline:              [],
      winProbabilityTimeline: [],
      matchup:               null,
      goals:                 [],
      boxScore:              null,
      _goalieIds:            { home: null, away: null },
      _shotsOnGoal:          { home: 0, away: 0 },
      _powerPlayState:       0,
      _situationCode:        null,
    }

    return enrichLiveGame(gameId, base)
  } catch (err) {
    console.warn(`[NHL] fetchLiveGame(${gameId}) failed:`, err.message)
    throw new Error(`NHL: failed to fetch live data for gameId ${gameId}: ${err.message}`)
  }
}

export function getPollingIntervalMs() {
  return 20_000
}
