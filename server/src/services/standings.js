/**
 * Standings + playoff bracket service.
 * Fetches from NHL/NBA/MLB public APIs and normalizes to a common shape.
 */

import { NHL_PLAYOFFS_MOCK } from '../mocks/nhl-playoffs-mock.js'
import { NBA_PLAYOFFS_MOCK } from '../mocks/nba-playoffs-mock.js'
import { NBA_STANDINGS_MOCK } from '../mocks/nba-standings-mock.js'
import { MLB_PLAYOFFS_MOCK } from '../mocks/mlb-playoffs-mock.js'

const STANDINGS_TTL_MS = 5 * 60 * 1000   // 5 min
const PLAYOFFS_TTL_MS  = 90 * 1000        // 90 s — live series update frequently

// Season years derived from the current date so no manual updates are needed each year.
// NHL/NBA: new season starts in October → use end year (currentYear+1 from July onwards)
// MLB:     season runs March–October   → use currentYear; Jan/Feb still point to previous year
// NFL:     season starts in September  → use start year; Jan/Feb point to previous year
const _now = new Date()
const _y   = _now.getFullYear()
const _m   = _now.getMonth() + 1  // 1–12

const NHL_SEASON_YEAR = _m >= 7 ? _y + 1 : _y
const NBA_SEASON      = _m >= 7 ? `${_y}-${String(_y + 1).slice(2)}` : `${_y - 1}-${String(_y).slice(2)}`
const MLB_SEASON      = _m <= 2 ? _y - 1 : _y
const NFL_SEASON_YEAR = _m <= 2 ? _y - 1 : _y

// ── In-memory TTL cache ────────────────────────────────────────────────────────

const cache = new Map()

async function withCache(key, ttlMs, fetchFn) {
  const entry = cache.get(key)
  if (entry && Date.now() < entry.expiresAt) return entry.data
  const data = await fetchFn()
  cache.set(key, { data, expiresAt: Date.now() + ttlMs })
  return data
}

// ── Generic helpers ────────────────────────────────────────────────────────────

function pct(wins, games) {
  if (!games) return '.000'
  return (wins / games).toFixed(3).replace(/^0/, '')
}

// ── NHL ───────────────────────────────────────────────────────────────────────

const NHL_BASE    = 'https://api-web.nhle.com/v1'
const NHL_HEADERS = { 'User-Agent': 'sports-stats-tracker/1.0' }

async function nhleGet(path) {
  const res = await fetch(`${NHL_BASE}${path}`, { headers: NHL_HEADERS })
  if (!res.ok) throw new Error(`NHL API ${res.status}: ${path}`)
  return res.json()
}

function nhlPlayoffStatus(t) {
  const ci = t.clinchIndicator ?? null
  if (ci === 'e') return 'eliminated'
  if (ci)         return 'in'
  return 'out'
}

function normalizeNhlTeam(t) {
  const city    = t.teamPlaceName?.default ?? ''
  const common  = t.teamCommonName?.default ?? ''
  return {
    teamId:        t.teamAbbrev?.default ?? '',
    teamName:      `${city} ${common}`.trim(),
    abbreviation:  t.teamAbbrev?.default ?? '',
    gamesPlayed:   t.gamesPlayed ?? 0,
    wins:          t.wins ?? 0,
    losses:        t.losses ?? 0,
    otLosses:      t.otLosses ?? 0,
    points:        t.points ?? 0,
    pct:           null,
    gf:            t.goalFor ?? 0,
    ga:            t.goalAgainst ?? 0,
    diff:          t.goalDifferential ?? (t.goalFor ?? 0) - (t.goalAgainst ?? 0),
    divisionRank:  t.divisionSequence ?? 99,
    divisionName:  t.divisionName ?? '',
    conference:    t.conferenceName ?? '',
    clinchIndicator: t.clinchIndicator ?? null,
    playoffStatus: nhlPlayoffStatus(t),
    streak:        t.streakCount ? `${t.streakCode ?? ''}${t.streakCount}` : null,
    homeRecord:    t.homeWins != null ? `${t.homeWins}-${t.homeLosses}-${t.homeOtLosses}` : null,
    awayRecord:    t.roadWins != null ? `${t.roadWins}-${t.roadLosses}-${t.roadOtLosses}` : null,
  }
}

export async function fetchNhlStandings() {
  return withCache('nhl_standings', STANDINGS_TTL_MS, async () => {
    const data  = await nhleGet('/standings/now')
    const teams = data.standings ?? []

    const byDivision = {}
    for (const t of teams) {
      const div = t.divisionName ?? 'Unknown'
      if (!byDivision[div]) byDivision[div] = []
      byDivision[div].push(normalizeNhlTeam(t))
    }
    for (const div of Object.keys(byDivision)) {
      byDivision[div].sort((a, b) => b.points - a.points || b.wins - a.wins)
    }

    return {
      divisions: byDivision,
      columns: ['W', 'L', 'OT', 'PTS', 'GF', 'GA', 'DIFF'],
      playoffSpotsPerDivision: 3,
      wildcardSpotsPerConference: 2,
    }
  })
}

// ── NHL Playoff helpers ────────────────────────────────────────────────────────

const NHL_ROUND_IDS_MAP   = { 1: 'nhl-r1', 2: 'nhl-r2', 3: 'nhl-cf', 4: 'nhl-scf' }
const NHL_ROUND_NAMES_MAP = { 1: 'First Round', 2: 'Second Round', 3: 'Conference Finals', 4: 'Stanley Cup Final' }
// seriesAbbrev from NHL API → canonical round number
const NHL_ABBREV_TO_ROUND = { R1: 1, R2: 2, CF: 3, SCF: 4 }

function nhlTeamName(team) {
  if (team.name?.default) return team.name.default
  const place  = team.placeName?.default ?? ''
  const common = team.commonName?.default ?? ''
  return `${place} ${common}`.trim() || team.abbrev || 'TBD'
}

function normalizeNhlPlayoffSeries(s, roundId, idx) {
  const hw     = s.topSeedWins ?? 0
  const lw     = s.bottomSeedWins ?? 0
  const need   = s.neededToWin ?? 4
  const bestOf = need * 2 - 1
  const done   = hw === need || lw === need
  const letter = s.seriesLetter ?? String.fromCharCode(65 + idx)
  return {
    id:           `${roundId}-${letter}`,
    roundId,
    conference:   s.conference ?? null,
    bestOf,
    status:       done ? 'complete' : (hw > 0 || lw > 0) ? 'live' : 'upcoming',
    highSeed:     s.topSeedTeam ? {
      id:           s.topSeedTeam.abbrev ?? 'TBD',
      name:         nhlTeamName(s.topSeedTeam),
      abbreviation: s.topSeedTeam.abbrev ?? 'TBD',
      seed:         s.topSeedTeam.seed ?? null,
      record:       null,
    } : null,
    lowSeed:      s.bottomSeedTeam ? {
      id:           s.bottomSeedTeam.abbrev ?? 'TBD',
      name:         nhlTeamName(s.bottomSeedTeam),
      abbreviation: s.bottomSeedTeam.abbrev ?? 'TBD',
      seed:         s.bottomSeedTeam.seed ?? null,
      record:       null,
    } : null,
    highSeedWins: hw,
    lowSeedWins:  lw,
    winnerTeamId: done ? (hw === need ? s.topSeedTeam?.abbrev ?? null : s.bottomSeedTeam?.abbrev ?? null) : null,
    games:        [],
    nextGame:     null,
  }
}

export async function fetchNhlPlayoffs() {
  return withCache('nhl_playoffs', PLAYOFFS_TTL_MS, async () => {
    if (process.env.USE_MOCK_DATA === 'true') return NHL_PLAYOFFS_MOCK
    try {
      const data = await nhleGet(`/playoff-bracket/${NHL_SEASON_YEAR}`)
      // API returns flat series array grouped by playoffRound (no rounds[] wrapper)
      const allSeries = data.series ?? []
      if (!allSeries.length) return { league: 'nhl', season: NHL_SEASON_YEAR, lastUpdated: new Date().toISOString(), rounds: [] }

      const byRound = {}
      for (const s of allSeries) {
        const rn = NHL_ABBREV_TO_ROUND[s.seriesAbbrev] ?? s.playoffRound ?? 1
        if (!byRound[rn]) byRound[rn] = []
        byRound[rn].push(s)
      }

      const rounds = Object.entries(byRound)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([rnStr, seriesArr]) => {
          const rn      = Number(rnStr)
          const roundId = NHL_ROUND_IDS_MAP[rn] ?? `nhl-r${rn}`
          return {
            id:     roundId,
            name:   NHL_ROUND_NAMES_MAP[rn] ?? `Round ${rn}`,
            order:  rn,
            series: seriesArr.map((s, i) => normalizeNhlPlayoffSeries(s, roundId, i)),
          }
        })

      return { league: 'nhl', season: NHL_SEASON_YEAR, lastUpdated: new Date().toISOString(), rounds }
    } catch (err) {
      console.warn('[standings] NHL playoffs fetch failed:', err.message)
      return { league: 'nhl', season: NHL_SEASON_YEAR, lastUpdated: new Date().toISOString(), rounds: [] }
    }
  })
}

// ── NBA ───────────────────────────────────────────────────────────────────────

const NBA_STATS_BASE = 'https://stats.nba.com/stats'
const NBA_STATS_HEADERS = {
  'Accept':               'application/json, text/plain, */*',
  'Accept-Language':      'en-US,en;q=0.9',
  'Origin':               'https://www.nba.com',
  'Referer':              'https://www.nba.com/',
  'User-Agent':           'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'x-nba-stats-origin':  'stats',
  'x-nba-stats-token':   'true',
}

async function nbaStatsGet(endpoint, params) {
  const url = new URL(`${NBA_STATS_BASE}/${endpoint}`)
  for (const [k, v] of Object.entries(params ?? {})) url.searchParams.set(k, v)
  const res = await fetch(url.toString(), { headers: NBA_STATS_HEADERS })
  if (!res.ok) throw new Error(`NBA stats API ${res.status}: ${endpoint}`)
  return res.json()
}

function parseNbaRows(resultSet) {
  const { headers, rowSet } = resultSet
  return rowSet.map((row) => {
    const obj = {}
    headers.forEach((h, i) => { obj[h] = row[i] })
    return obj
  })
}

function nbaPlayoffStatus(row) {
  if (row.ClinchedPostSeason === 1 || row.ClinchedPostSeason === '1') return 'in'
  if (row.ClinchedPlayIn     === 1 || row.ClinchedPlayIn     === '1') return 'in'
  if (row.EliminatedConference === 1 || row.EliminatedConference === '1') return 'eliminated'
  return 'out'
}

function normalizeNbaTeam(row) {
  const wins   = parseInt(row.WINS ?? row.W ?? 0, 10)
  const losses = parseInt(row.LOSSES ?? row.L ?? 0, 10)
  const gp     = wins + losses
  return {
    teamId:        String(row.TeamID ?? ''),
    teamName:      `${row.TeamCity ?? ''} ${row.TeamName ?? ''}`.trim(),
    abbreviation:  row.TeamSlug?.toUpperCase() ?? '',
    gamesPlayed:   gp,
    wins,
    losses,
    otLosses:      null,
    points:        wins,
    pct:           row.WinPCT != null ? parseFloat(row.WinPCT).toFixed(3) : pct(wins, gp),
    gf:            row.PointsPG != null ? parseFloat(row.PointsPG).toFixed(1) : null,
    ga:            row.OppPointsPG != null ? parseFloat(row.OppPointsPG).toFixed(1) : null,
    diff:          row.DiffPointsPG != null ? parseFloat(row.DiffPointsPG).toFixed(1) : null,
    divisionRank:  parseInt(row.DivisionRank ?? 99, 10),
    divisionName:  row.Division ?? '',
    conference:    row.Conference ?? '',
    clinchIndicator: row.ClinchIndicator ?? null,
    playoffStatus: nbaPlayoffStatus(row),
    streak:        row.strCurrentStreak ?? null,
    homeRecord:    row.HOME ?? null,
    awayRecord:    row.ROAD ?? null,
  }
}

export async function fetchNbaStandings() {
  return withCache('nba_standings', STANDINGS_TTL_MS, async () => {
    if (process.env.USE_MOCK_DATA === 'true') return NBA_STANDINGS_MOCK
    try {
      const data = await nbaStatsGet('leaguestandingsv3', {
        LeagueID: '00',
        Season: NBA_SEASON,
        SeasonType: 'Regular Season',
      })
      const rows  = parseNbaRows(data.resultSets[0])
      const teams = rows.map(normalizeNbaTeam)

      const byConference = {}
      for (const t of teams) {
        const conf = t.conference || 'Unknown'
        if (!byConference[conf]) byConference[conf] = []
        byConference[conf].push(t)
      }
      for (const conf of Object.keys(byConference)) {
        byConference[conf].sort((a, b) => b.wins - a.wins || a.losses - b.losses)
      }

      return {
        divisions: byConference,
        columns: ['W', 'L', 'PCT', 'PPG', 'OPP', 'DIFF'],
        playoffSpotsPerConference: 6,
        playInSpotsPerConference: 4,
      }
    } catch (err) {
      console.warn('[standings] NBA standings fetch failed:', err.message)
      return NBA_STANDINGS_MOCK
    }
  })
}

// ── NBA Playoff helpers ────────────────────────────────────────────────────────

const NBA_ROUND_IDS         = { 1: 'nba-r1', 2: 'nba-r2', 3: 'nba-cf', 4: 'nba-finals' }
const NBA_ROUND_NAMES       = { 1: 'First Round', 2: 'Conference Semifinals', 3: 'Conference Finals', 4: 'NBA Finals' }
const NBA_PLAYOFF_START_DATE = `${_m >= 7 ? _y + 1 : _y}0401`

function parseNbaRoundFromNote(note) {
  const n = note.toLowerCase()
  if (n.includes('nba final')) return 4
  if (n.includes('conference final')) return 3
  if (n.includes('2nd round') || n.includes('second round') || n.includes('conference semifinal')) return 2
  return 1
}

function parseNbaConfFromNote(note) {
  if (/\beast\b/i.test(note)) return 'East'
  if (/\bwest\b/i.test(note)) return 'West'
  return null
}

async function fetchEspnNbaPlayoffEvents() {
  const end = new Date()
  end.setDate(end.getDate() + 90)
  const fmt = (d) => d.toISOString().slice(0, 10).replace(/-/g, '')
  const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?limit=300&seasontype=3&dates=${NBA_PLAYOFF_START_DATE}-${fmt(end)}`
  const res = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(10000) })
  if (!res.ok) throw new Error(`ESPN NBA scoreboard ${res.status}`)
  const data = await res.json()
  return (data.events ?? []).filter((ev) => ev.competitions?.[0]?.series?.type === 'playoff')
}

function getR1SeriesWinner(s) {
  if (!s) return null
  if (s.highSeedWins === s.need) return s.highSeedAbbr
  if (s.lowSeedWins  === s.need) return s.lowSeedAbbr
  return null
}

function buildTbdSeries(roundNum, count) {
  const results = []
  for (let i = 0; i < count; i++) {
    const conference = roundNum < 4 ? (i < count / 2 ? 'East' : 'West') : null
    results.push({
      seriesKey:    `r${roundNum}-tbd-${i}`,
      roundNum,
      conference,
      highSeedAbbr: 'TBD', lowSeedAbbr:  'TBD',
      highSeedId:   'TBD', lowSeedId:    'TBD',
      highSeedNum:  null,  lowSeedNum:   null,
      completed:    false, need: 4,
      highSeedWins: 0,     lowSeedWins:  0,
    })
  }
  return results
}

function buildR2Placeholders(r1Series) {
  const byConf = {}
  for (const s of r1Series) {
    const conf = s.conference ?? 'Unknown'
    if (!byConf[conf]) byConf[conf] = []
    byConf[conf].push(s)
  }

  // NBA bracket: winner of [topA v topB] plays winner of [botA v botB]
  const brackets = [[1, 8, 4, 5], [2, 7, 3, 6]]
  const r2 = []

  for (const [conf, series] of Object.entries(byConf)) {
    const find = (sa, sb) =>
      series.find(s => {
        const h = s.highSeedNum, l = s.lowSeedNum
        return (h === sa && l === sb) || (h === sb && l === sa)
      })

    for (const [a, b, c, d] of brackets) {
      const top = find(a, b)
      const bot = find(c, d)
      if (!top && !bot) continue

      r2.push({
        seriesKey:    `r2-${conf}-${a}${b}v${c}${d}`,
        roundNum:     2,
        conference:   conf,
        highSeedAbbr: getR1SeriesWinner(top) ?? 'TBD',
        lowSeedAbbr:  getR1SeriesWinner(bot) ?? 'TBD',
        highSeedId:   getR1SeriesWinner(top) ?? 'TBD',
        lowSeedId:    getR1SeriesWinner(bot) ?? 'TBD',
        highSeedNum:  null,
        lowSeedNum:   null,
        completed:    false,
        need:         4,
        highSeedWins: 0,
        lowSeedWins:  0,
      })
    }
  }

  return r2
}

function normalizeEspnNbaBracket(events) {
  const seriesMap = {}

  for (const ev of events) {
    const comp = ev.competitions?.[0]
    if (!comp) continue
    const ser = comp.series
    if (!ser?.competitors?.length) continue

    // Use ESPN team IDs as series key — consistent regardless of home/away
    const seriesKey = ser.competitors.map((c) => c.id).sort().join('_')

    // Build ID → abbreviation/homeAway/seed maps from competition competitors
    const idToAbbr = {}
    const idToHomeAway = {}
    const idToSeed = {}
    for (const c of comp.competitors ?? []) {
      if (c.id) {
        idToAbbr[c.id]     = c.team?.abbreviation ?? 'TBD'
        idToHomeAway[c.id] = c.homeAway
        idToSeed[c.id]     = c.curatedRank?.current ?? (c.team?.seed != null ? parseInt(c.team.seed, 10) : null) ?? null
      }
    }

    const allTBD = ser.competitors.every((c) => (idToAbbr[c.id] ?? 'TBD') === 'TBD')
    if (allTBD) continue

    const note       = comp.notes?.[0]?.headline ?? ''
    const roundNum   = parseNbaRoundFromNote(note)
    const conference = note ? parseNbaConfFromNote(note) : null
    const need       = Math.ceil((ser.totalCompetitions ?? 7) / 2)

    // Build wins map
    const idToWins = {}
    for (const sc of ser.competitors) idToWins[sc.id] = sc.wins ?? 0

    if (!seriesMap[seriesKey]) {
      // First game: home team = high seed (home-court advantage belongs to higher seed)
      const homeId = ser.competitors.find((c) => idToHomeAway[c.id] === 'home')?.id ?? ser.competitors[0]?.id
      const awayId = ser.competitors.find((c) => idToHomeAway[c.id] === 'away')?.id ?? ser.competitors[1]?.id
      seriesMap[seriesKey] = {
        seriesKey,
        roundNum,
        conference,
        highSeedId:   homeId,
        highSeedAbbr: idToAbbr[homeId] ?? 'TBD',
        highSeedNum:  idToSeed[homeId] ?? null,
        lowSeedId:    awayId,
        lowSeedAbbr:  idToAbbr[awayId] ?? 'TBD',
        lowSeedNum:   idToSeed[awayId] ?? null,
        completed:    ser.completed ?? false,
        need,
      }
    } else {
      // Update wins and completion with latest game data
      if (conference) seriesMap[seriesKey].conference = conference
      seriesMap[seriesKey].completed = ser.completed ?? false
    }

    const entry = seriesMap[seriesKey]
    entry.highSeedWins = idToWins[entry.highSeedId] ?? 0
    entry.lowSeedWins  = idToWins[entry.lowSeedId]  ?? 0
  }

  const byRound = {}
  for (const s of Object.values(seriesMap)) {
    if (s.highSeedAbbr === 'TBD' && s.lowSeedAbbr === 'TBD') continue
    if (!byRound[s.roundNum]) byRound[s.roundNum] = []
    byRound[s.roundNum].push(s)
  }

  // Always show all 4 rounds once playoffs start — future rounds show as bracket-aware TBD
  const NBA_ROUND_SERIES_COUNT = { 1: 8, 2: 4, 3: 2, 4: 1 }
  if (Object.keys(byRound).length > 0) {
    if (!byRound[2] && byRound[1]?.length > 0) {
      byRound[2] = buildR2Placeholders(byRound[1])
    }
    for (let rn = 1; rn <= 4; rn++) {
      if (!byRound[rn] || byRound[rn].length === 0) {
        byRound[rn] = buildTbdSeries(rn, NBA_ROUND_SERIES_COUNT[rn])
      }
    }
  }

  const rounds = Object.entries(byRound)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([rnStr, seriesArr]) => {
      const rn      = Number(rnStr)
      const roundId = NBA_ROUND_IDS[rn] ?? `nba-r${rn}`
      return {
        id:     roundId,
        name:   NBA_ROUND_NAMES[rn] ?? `Round ${rn}`,
        order:  rn,
        series: seriesArr.map((s, i) => {
          const done = s.highSeedWins === s.need || s.lowSeedWins === s.need
          return {
            id:           `${roundId}-${s.conference ?? ''}${i}`,
            roundId,
            conference:   s.conference,
            bestOf:       s.need * 2 - 1,
            status:       done ? 'complete' : (s.highSeedWins > 0 || s.lowSeedWins > 0) ? 'live' : 'upcoming',
            highSeed:     s.highSeedAbbr === 'TBD' ? null : { id: s.highSeedAbbr, name: s.highSeedAbbr, abbreviation: s.highSeedAbbr, seed: null, record: null },
            lowSeed:      s.lowSeedAbbr  === 'TBD' ? null : { id: s.lowSeedAbbr,  name: s.lowSeedAbbr,  abbreviation: s.lowSeedAbbr,  seed: null, record: null },
            highSeedWins: s.highSeedWins ?? 0,
            lowSeedWins:  s.lowSeedWins  ?? 0,
            winnerTeamId: done ? (s.highSeedWins === s.need ? s.highSeedAbbr : s.lowSeedAbbr) : null,
            games:        [],
            nextGame:     null,
          }
        }),
      }
    })

  return { league: 'nba', season: 2026, lastUpdated: new Date().toISOString(), rounds }
}

export async function fetchNbaPlayoffs() {
  return withCache('nba_playoffs', PLAYOFFS_TTL_MS, async () => {
    if (process.env.USE_MOCK_DATA === 'true') return NBA_PLAYOFFS_MOCK
    try {
      const events = await fetchEspnNbaPlayoffEvents()
      if (!events.length) return NBA_PLAYOFFS_MOCK
      const bracket = normalizeEspnNbaBracket(events)
      return bracket.rounds.length ? bracket : NBA_PLAYOFFS_MOCK
    } catch (err) {
      console.warn('[standings] NBA playoffs fetch failed:', err.message)
      return NBA_PLAYOFFS_MOCK
    }
  })
}

// ── MLB ───────────────────────────────────────────────────────────────────────

const MLB_BASE = 'https://statsapi.mlb.com/api/v1'

async function mlbGet(path) {
  const res = await fetch(`${MLB_BASE}${path}`)
  if (!res.ok) throw new Error(`MLB API ${res.status}: ${path}`)
  return res.json()
}

function mlbPlayoffStatus(t) {
  if (t.eliminationNumber === 'E') return 'eliminated'
  if (t.clinchIndicator)           return 'in'
  return 'out'
}

function normalizeMLBTeam(t) {
  const wins   = t.wins ?? 0
  const losses = t.losses ?? 0
  const gp     = wins + losses
  return {
    teamId:        String(t.team?.id ?? ''),
    teamName:      t.team?.name ?? '',
    abbreviation:  t.team?.abbreviation ?? '',
    gamesPlayed:   gp,
    wins,
    losses,
    otLosses:      null,
    points:        wins,
    pct:           t.winningPercentage ?? pct(wins, gp),
    gf:            t.runsScored ?? 0,
    ga:            t.runsAllowed ?? 0,
    diff:          (t.runsScored ?? 0) - (t.runsAllowed ?? 0),
    divisionRank:  parseInt(t.divisionRank ?? 99, 10),
    divisionName:  t.division?.nameShort ?? '',
    conference:    t.league?.name ?? '',
    clinchIndicator: t.clinchIndicator ?? null,
    playoffStatus: mlbPlayoffStatus(t),
    gamesBack:     t.gamesBack ?? '-',
    streak:        t.streak?.streakCode ?? null,
    homeRecord:    t.records?.splitRecords?.find((r) => r.type === 'home')
                     ? (() => { const r = t.records.splitRecords.find((x) => x.type === 'home'); return `${r.wins}-${r.losses}` })()
                     : null,
    awayRecord:    t.records?.splitRecords?.find((r) => r.type === 'away')
                     ? (() => { const r = t.records.splitRecords.find((x) => x.type === 'away'); return `${r.wins}-${r.losses}` })()
                     : null,
  }
}

export async function fetchMlbStandings() {
  return withCache('mlb_standings', STANDINGS_TTL_MS, async () => {
    const data  = await mlbGet(`/standings?leagueId=103,104&season=${MLB_SEASON}&standingsTypes=regularSeason&hydrate=team,league,division,record(splits=[home,away])`)
    const records = data.records ?? []

    const byDivision = {}
    for (const divRec of records) {
      const divName = divRec.division?.nameShort ?? divRec.division?.name ?? 'Unknown'
      byDivision[divName] = (divRec.teamRecords ?? [])
        .sort((a, b) => (b.wins ?? 0) - (a.wins ?? 0))
        .map(normalizeMLBTeam)
    }

    return {
      divisions: byDivision,
      columns: ['W', 'L', 'PCT', 'GB', 'RS', 'RA'],
      playoffSpotsPerLeague: 6,  // 3 div + 3 WC
    }
  })
}

// ── MLB Playoff helpers ────────────────────────────────────────────────────────

const MLB_ROUND_DEFS = [
  { id: 'mlb-wc',  name: 'Wild Card',                  order: 1, types: ['F'],     bestOf: 3 },
  { id: 'mlb-ds',  name: 'Division Series',            order: 2, types: ['D'],     bestOf: 5 },
  { id: 'mlb-lcs', name: 'League Championship Series', order: 3, types: ['L'],     bestOf: 7 },
  { id: 'mlb-ws',  name: 'World Series',               order: 4, types: ['W','S'], bestOf: 7 },
]

function inferMlbConference(desc) {
  const d = (desc ?? '').toLowerCase()
  if (d.includes('american') || /\bal\b/.test(d)) return 'AL'
  if (d.includes('national')  || /\bnl\b/.test(d)) return 'NL'
  return null
}

function normalizeMlbPostseason(data) {
  const byRound = {}
  for (const def of MLB_ROUND_DEFS) byRound[def.id] = []

  for (const entry of (data.series ?? [])) {
    const gameType = entry.series?.gameType ?? ''
    const def = MLB_ROUND_DEFS.find((d) => d.types.includes(gameType))
    if (!def) continue

    const games = entry.games ?? []
    if (!games.length) continue

    const conf  = inferMlbConference(entry.series?.seriesDescription ?? '')
    const need  = Math.ceil(def.bestOf / 2)
    let highSeedWins = 0
    let lowSeedWins  = 0
    let highSeedTeam = null
    let lowSeedTeam  = null

    // Determine teams from first completed or scheduled game
    const firstGame = games[0]
    if (firstGame?.teams) {
      const home = firstGame.teams.home?.team
      const away = firstGame.teams.away?.team
      const homeSeed = home?.seed ?? 99
      const awaySeed = away?.seed ?? 99
      if (home && away) {
        if (homeSeed <= awaySeed) {
          highSeedTeam = { id: home.abbreviation, name: home.name, abbreviation: home.abbreviation, seed: homeSeed, record: null }
          lowSeedTeam  = { id: away.abbreviation, name: away.name, abbreviation: away.abbreviation, seed: awaySeed, record: null }
        } else {
          highSeedTeam = { id: away.abbreviation, name: away.name, abbreviation: away.abbreviation, seed: awaySeed, record: null }
          lowSeedTeam  = { id: home.abbreviation, name: home.name, abbreviation: home.abbreviation, seed: homeSeed, record: null }
        }
      }
    }

    // Tally wins from final games
    for (const g of games) {
      if (g.status?.abstractGameState !== 'Final') continue
      const homeScore = g.teams?.home?.score ?? 0
      const awayScore = g.teams?.away?.score ?? 0
      const homeAbbr  = g.teams?.home?.team?.abbreviation
      const homeIsHigh = highSeedTeam?.id === homeAbbr
      const homeWon = homeScore > awayScore
      if (homeWon) { if (homeIsHigh) highSeedWins++; else lowSeedWins++ }
      else          { if (homeIsHigh) lowSeedWins++;  else highSeedWins++ }
    }

    const done   = highSeedWins === need || lowSeedWins === need
    const idx    = byRound[def.id].length
    const letter = conf ?? String.fromCharCode(65 + idx)

    byRound[def.id].push({
      id:           `${def.id}-${letter}`,
      roundId:      def.id,
      conference:   conf,
      bestOf:       def.bestOf,
      status:       done ? 'complete' : (highSeedWins > 0 || lowSeedWins > 0) ? 'in_progress' : 'upcoming',
      highSeed:     highSeedTeam,
      lowSeed:      lowSeedTeam,
      highSeedWins,
      lowSeedWins,
      winnerTeamId: done ? (highSeedWins === need ? highSeedTeam?.id ?? null : lowSeedTeam?.id ?? null) : null,
      games:        [],
      nextGame:     null,
    })
  }

  const rounds = MLB_ROUND_DEFS
    .filter((d) => byRound[d.id].length > 0)
    .map((d) => ({ id: d.id, name: d.name, order: d.order, series: byRound[d.id] }))

  return { league: 'mlb', season: MLB_SEASON, lastUpdated: new Date().toISOString(), rounds }
}

export async function fetchMlbPlayoffs() {
  return withCache('mlb_playoffs', PLAYOFFS_TTL_MS, async () => {
    if (process.env.USE_MOCK_DATA === 'true') return MLB_PLAYOFFS_MOCK
    try {
      const data = await mlbGet(`/schedule/postseason/series?sportId=1&season=${MLB_SEASON}`)
      return normalizeMlbPostseason(data)
    } catch (err) {
      console.warn('[standings] MLB playoffs fetch failed:', err.message)
      return { league: 'mlb', season: MLB_SEASON, lastUpdated: new Date().toISOString(), rounds: [] }
    }
  })
}

// ── Public exports ─────────────────────────────────────────────────────────────

const ESPN_NFL_BASE = 'https://site.api.espn.com/apis/v2/sports/football/nfl'

function normalizeMockNflStandings(mock) {
  const byDivision = {}
  for (const conf of (mock.conferences ?? [])) {
    for (const div of (conf.divisions ?? [])) {
      byDivision[div.name] = (div.teams ?? []).map((t) => ({
        teamId:       t.id ?? t.abbreviation,
        teamName:     t.name,
        abbreviation: t.abbreviation,
        wins:         t.wins ?? 0,
        losses:       t.losses ?? 0,
        ties:         t.ties ?? 0,
        pct:          typeof t.pct === 'number' ? t.pct.toFixed(3).replace(/^0/, '') : t.pct ?? '.000',
        pf:           t.pf ?? 0,
        pa:           t.pa ?? 0,
        diff:         (t.pf ?? 0) - (t.pa ?? 0),
        divRecord:    t.divRecord ?? null,
        confRecord:   t.confRecord ?? null,
        streak:       t.streak ?? null,
        playoffStatus: 'out',
        clinchIndicator: null,
      }))
    }
  }
  return { divisions: byDivision, columns: ['W', 'L', 'T', 'PCT', 'PF', 'PA', 'Div', 'Conf', 'Str'] }
}

async function fetchNflStandings() {
  return withCache('nfl_standings', STANDINGS_TTL_MS, async () => {
    try {
      const res = await fetch(`${ESPN_NFL_BASE}/standings?season=${NFL_SEASON_YEAR}`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) throw new Error(`ESPN NFL standings ${res.status}`)
      const data = await res.json()
      return normalizeEspnNflStandings(data)
    } catch (err) {
      console.warn('[standings] NFL standings fetch failed:', err.message)
      return { divisions: {}, columns: ['W', 'L', 'T', 'PCT', 'PF', 'PA', 'Div', 'Conf', 'Str'] }
    }
  })
}

function normalizeEspnNflStandings(data) {
  try {
    const byDivision = {}
    const children = data?.children ?? []
    for (const conf of children) {
      for (const div of (conf.children ?? [])) {
        const divName = div.name ?? div.abbreviation ?? 'Unknown'
        const teams = (div.standings?.entries ?? []).map((entry) => {
          const abbr  = entry.team?.abbreviation ?? ''
          const stats = {}
          for (const s of (entry.stats ?? [])) {
            stats[s.name ?? s.abbreviation] = s.value ?? s.displayValue
          }
          return {
            teamId:       String(entry.team?.id ?? abbr),
            teamName:     entry.team?.displayName ?? abbr,
            abbreviation: abbr,
            wins:         parseInt(stats.wins ?? stats.W ?? 0, 10),
            losses:       parseInt(stats.losses ?? stats.L ?? 0, 10),
            ties:         parseInt(stats.ties ?? stats.T ?? 0, 10),
            pct:          stats.winPercent ?? stats.PCT ?? '.000',
            pf:           stats.pointsFor ?? stats.PF ?? 0,
            pa:           stats.pointsAgainst ?? stats.PA ?? 0,
            diff:         (parseInt(stats.pointsFor ?? 0, 10)) - (parseInt(stats.pointsAgainst ?? 0, 10)),
            divRecord:    stats.divisionRecord ?? stats.Div ?? null,
            confRecord:   stats.conferenceRecord ?? stats.Conf ?? null,
            streak:       stats.streak ?? null,
            playoffStatus: 'out',
            clinchIndicator: null,
          }
        })
        if (teams.length) byDivision[divName] = teams
      }
    }
    return {
      divisions: byDivision,
      columns: ['W', 'L', 'T', 'PCT', 'PF', 'PA', 'Div', 'Conf', 'Str'],
    }
  } catch {
    return { divisions: {}, columns: ['W', 'L', 'T', 'PCT', 'PF', 'PA'] }
  }
}

export async function fetchStandings(league) {
  switch (league) {
    case 'nhl': return fetchNhlStandings()
    case 'nba': return fetchNbaStandings()
    case 'mlb': return fetchMlbStandings()
    case 'nfl': return fetchNflStandings()
    default: throw new Error(`Unknown league: ${league}`)
  }
}

const NFL_WEEK_TO_ROUND = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 4 }
const NFL_ROUND_IDS     = { 1: 'nfl-wc', 2: 'nfl-div', 3: 'nfl-cc', 4: 'nfl-sb' }
const NFL_ROUND_NAMES   = { 1: 'Wild Card', 2: 'Divisional Round', 3: 'Conference Championship', 4: 'Super Bowl' }

function parseNflRoundFromNote(note) {
  const n = note.toLowerCase()
  if (n.includes('super bowl'))                    return 4
  if (n.includes('championship'))                  return 3
  if (n.includes('divisional'))                    return 2
  if (n.includes('wild card') || n.includes('wildcard')) return 1
  return null
}

function parseNflConfFromNote(note) {
  if (/\bafc\b/i.test(note)) return 'AFC'
  if (/\bnfc\b/i.test(note)) return 'NFC'
  return null
}

function normalizeEspnNflScoreboard(events) {
  const byRound = {}

  for (const ev of events) {
    const comp = ev.competitions?.[0]
    if (!comp) continue

    const note     = comp.notes?.[0]?.headline ?? ''
    const week     = ev.week?.number ?? null
    const roundNum = parseNflRoundFromNote(note) ?? (week ? NFL_WEEK_TO_ROUND[week] : null)
    if (!roundNum) continue

    const conf     = roundNum < 4 ? parseNflConfFromNote(note) : null
    const homeC    = comp.competitors?.find(c => c.homeAway === 'home')
    const awayC    = comp.competitors?.find(c => c.homeAway === 'away')
    if (!homeC || !awayC) continue

    const homeAbbr   = homeC.team?.abbreviation ?? 'TBD'
    const awayAbbr   = awayC.team?.abbreviation ?? 'TBD'
    const homeScore  = parseInt(homeC.score ?? 0, 10)
    const awayScore  = parseInt(awayC.score ?? 0, 10)
    const isComplete = comp.status?.type?.completed === true || comp.status?.type?.name === 'STATUS_FINAL'
    const isLive     = !isComplete && comp.status?.type?.name === 'STATUS_IN_PROGRESS'
    const homeSeed   = homeC.curatedRank?.current ?? null
    const awaySeed   = awayC.curatedRank?.current ?? null
    const winner     = isComplete ? (homeScore > awayScore ? homeAbbr : awayAbbr) : null

    if (!byRound[roundNum]) byRound[roundNum] = []
    byRound[roundNum].push({
      id:           ev.id ?? `nfl-r${roundNum}-${byRound[roundNum].length}`,
      roundId:      NFL_ROUND_IDS[roundNum] ?? `nfl-r${roundNum}`,
      conference:   conf,
      bestOf:       1,
      status:       isComplete ? 'complete' : isLive ? 'active' : 'upcoming',
      highSeed:     { id: homeAbbr, name: homeC.team?.displayName ?? homeAbbr, abbreviation: homeAbbr, seed: homeSeed },
      lowSeed:      { id: awayAbbr, name: awayC.team?.displayName ?? awayAbbr, abbreviation: awayAbbr, seed: awaySeed },
      highSeedWins: isComplete && homeScore > awayScore ? 1 : 0,
      lowSeedWins:  isComplete && awayScore > homeScore ? 1 : 0,
      winnerTeamId: winner,
      games:        [],
    })
  }

  const rounds = Object.entries(byRound)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([rnStr, series]) => {
      const rn = Number(rnStr)
      return { id: NFL_ROUND_IDS[rn] ?? `nfl-r${rn}`, name: NFL_ROUND_NAMES[rn] ?? `Round ${rn}`, order: rn, series }
    })

  return { league: 'nfl', season: String(NFL_SEASON_YEAR), lastUpdated: new Date().toISOString(), rounds }
}

async function fetchNflPlayoffs() {
  return withCache('nfl_playoffs', PLAYOFFS_TTL_MS, async () => {
    try {
      const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?seasontype=3&season=${NFL_SEASON_YEAR}&limit=50`
      const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000) })
      if (!res.ok) throw new Error(`ESPN NFL scoreboard ${res.status}`)
      const events = (await res.json()).events ?? []
      if (!events.length) return { league: 'nfl', season: String(NFL_SEASON_YEAR), lastUpdated: new Date().toISOString(), rounds: [] }
      return normalizeEspnNflScoreboard(events)
    } catch (err) {
      console.warn(`[standings] NFL playoffs fetch failed: ${err.message}`)
      return { league: 'nfl', season: String(NFL_SEASON_YEAR), lastUpdated: new Date().toISOString(), rounds: [] }
    }
  })
}

export async function fetchPlayoffs(league) {
  switch (league) {
    case 'nhl': return fetchNhlPlayoffs()
    case 'nba': return fetchNbaPlayoffs()
    case 'mlb': return fetchMlbPlayoffs()
    case 'nfl': return fetchNflPlayoffs()
    default: throw new Error(`Unknown league: ${league}`)
  }
}
