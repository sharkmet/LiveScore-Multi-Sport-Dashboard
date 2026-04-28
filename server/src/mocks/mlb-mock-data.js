/**
 * Mock MLB API responses used as fallback when the real API is unreachable.
 * These mirror the normalized GameEvent shape directly — the adapter wraps them
 * into the same output without re-parsing raw MLB JSON.
 */

const now = new Date()

// ─── Shared pitcher stubs ─────────────────────────────────────────────────────

const GERRIT_COLE    = {
  id: 'mlb-543037', name: 'Gerrit Cole',    era: '3.12', wins: 9,  losses: 3, ip: '98.2',
  seasonStats: { era: '3.12', wins: 9,  losses: 3, ip: '98.2',  k: 112, bb: 24, whip: '1.08' },
  last10: { era: '2.89', wins: 4, losses: 1, ip: '62.1', k: 74, bb: 12 },
}
const KEVIN_GAUSMAN  = {
  id: 'mlb-628317', name: 'Kevin Gausman',  era: '3.45', wins: 8,  losses: 5, ip: '88.1',
  seasonStats: { era: '3.45', wins: 8,  losses: 5, ip: '88.1',  k: 97,  bb: 21, whip: '1.14' },
  last10: { era: '3.91', wins: 3, losses: 2, ip: '55.0', k: 58, bb: 14 },
}
const LOGAN_WEBB     = {
  id: 'mlb-608566', name: 'Logan Webb',     era: '3.02', wins: 10, losses: 4, ip: '102.1',
  seasonStats: { era: '3.02', wins: 10, losses: 4, ip: '102.1', k: 98,  bb: 22, whip: '1.11' },
  last10: { era: '2.61', wins: 5, losses: 1, ip: '65.2', k: 63, bb: 13 },
}
const TYLER_GLASNOW  = {
  id: 'mlb-657908', name: 'Tyler Glasnow',  era: '2.89', wins: 11, losses: 3, ip: '99.0',
  seasonStats: { era: '2.89', wins: 11, losses: 3, ip: '99.0',  k: 128, bb: 30, whip: '1.05' },
  last10: { era: '2.45', wins: 5, losses: 1, ip: '63.1', k: 82, bb: 18 },
}
const FRAMBER_VALDEZ = {
  id: 'mlb-543243', name: 'Framber Valdez', era: '3.21', wins: 11, losses: 5, ip: '105.2',
  seasonStats: { era: '3.21', wins: 11, losses: 5, ip: '105.2', k: 103, bb: 35, whip: '1.22' },
  last10: { era: '3.05', wins: 5, losses: 2, ip: '67.0', k: 66, bb: 21 },
}
const LOGAN_GILBERT  = {
  id: 'mlb-672515', name: 'Logan Gilbert',  era: '3.47', wins: 9,  losses: 6, ip: '98.0',
  seasonStats: { era: '3.47', wins: 9,  losses: 6, ip: '98.0',  k: 105, bb: 26, whip: '1.18' },
  last10: { era: '3.72', wins: 4, losses: 3, ip: '60.2', k: 65, bb: 17 },
}
const ZACK_WHEELER   = {
  id: 'mlb-623352', name: 'Zack Wheeler',   era: '2.95', wins: 12, losses: 4, ip: '112.0',
  seasonStats: { era: '2.95', wins: 12, losses: 4, ip: '112.0', k: 124, bb: 28, whip: '1.09' },
  last10: { era: '2.72', wins: 6, losses: 1, ip: '72.1', k: 80, bb: 16 },
}
const KODAI_SENGA    = {
  id: 'mlb-656302', name: 'Kodai Senga',    era: '3.08', wins: 10, losses: 5, ip: '93.1',
  seasonStats: { era: '3.08', wins: 10, losses: 5, ip: '93.1',  k: 116, bb: 29, whip: '1.12' },
  last10: { era: '2.95', wins: 5, losses: 2, ip: '59.2', k: 74, bb: 18 },
}

// ─── Shared lineup stubs ──────────────────────────────────────────────────────

const NYY_LINEUP = [
  { order: 1, id: 'mlb-592450', name: 'Aaron Judge',       position: 'CF', avg: '.287',
    gameStats: { atBats: 2, hits: 1, runs: 1, rbi: 2, homeRuns: 1, strikeOuts: 0, walks: 1 },
    seasonStats: { avg: '.287', ops: '.991', homeRuns: 23, rbi: 58, obp: '.399', slg: '.592' } },
  { order: 2, id: 'mlb-596019', name: 'Juan Soto',         position: 'LF', avg: '.302',
    gameStats: { atBats: 3, hits: 2, runs: 1, rbi: 1, homeRuns: 0, strikeOuts: 0, walks: 0 },
    seasonStats: { avg: '.302', ops: '.988', homeRuns: 16, rbi: 49, obp: '.411', slg: '.577' } },
  { order: 3, id: 'mlb-543760', name: 'Giancarlo Stanton', position: 'DH', avg: '.249',
    gameStats: { atBats: 3, hits: 0, runs: 0, rbi: 0, homeRuns: 0, strikeOuts: 2, walks: 0 },
    seasonStats: { avg: '.249', ops: '.831', homeRuns: 19, rbi: 52, obp: '.327', slg: '.504' } },
  { order: 4, id: 'mlb-641313', name: 'Jazz Chisholm Jr.', position: '2B', avg: '.277',
    gameStats: { atBats: 2, hits: 1, runs: 1, rbi: 0, homeRuns: 0, strikeOuts: 1, walks: 1 },
    seasonStats: { avg: '.277', ops: '.862', homeRuns: 17, rbi: 44, obp: '.344', slg: '.518' } },
  { order: 5, id: 'mlb-642715', name: 'Anthony Volpe',     position: 'SS', avg: '.243',
    gameStats: { atBats: 3, hits: 0, runs: 0, rbi: 0, homeRuns: 0, strikeOuts: 1, walks: 0 },
    seasonStats: { avg: '.243', ops: '.724', homeRuns: 9,  rbi: 31, obp: '.306', slg: '.418' } },
  { order: 6, id: 'mlb-543963', name: 'DJ LeMahieu',       position: '3B', avg: '.238',
    gameStats: { atBats: 2, hits: 1, runs: 0, rbi: 0, homeRuns: 0, strikeOuts: 0, walks: 0 },
    seasonStats: { avg: '.238', ops: '.681', homeRuns: 5,  rbi: 28, obp: '.301', slg: '.380' } },
  { order: 7, id: 'mlb-664702', name: 'Austin Wells',      position: 'C',  avg: '.231',
    gameStats: { atBats: 2, hits: 0, runs: 0, rbi: 0, homeRuns: 0, strikeOuts: 1, walks: 0 },
    seasonStats: { avg: '.231', ops: '.698', homeRuns: 8,  rbi: 26, obp: '.295', slg: '.403' } },
  { order: 8, id: 'mlb-668939', name: 'Ben Rice',          position: '1B', avg: '.255',
    gameStats: { atBats: 2, hits: 1, runs: 0, rbi: 0, homeRuns: 0, strikeOuts: 0, walks: 0 },
    seasonStats: { avg: '.255', ops: '.773', homeRuns: 10, rbi: 33, obp: '.325', slg: '.448' } },
  { order: 9, id: 'mlb-663837', name: 'Trent Grisham',     position: 'RF', avg: '.219',
    gameStats: { atBats: 2, hits: 0, runs: 0, rbi: 0, homeRuns: 0, strikeOuts: 1, walks: 0 },
    seasonStats: { avg: '.219', ops: '.651', homeRuns: 4,  rbi: 17, obp: '.298', slg: '.353' } },
]

const TOR_LINEUP = [
  { order: 1, id: 'mlb-666182', name: 'Bo Bichette',       position: 'SS', avg: '.271',
    gameStats: { atBats: 3, hits: 1, runs: 1, rbi: 0, homeRuns: 0, strikeOuts: 1, walks: 0 },
    seasonStats: { avg: '.271', ops: '.782', homeRuns: 12, rbi: 41, obp: '.318', slg: '.464' } },
  { order: 2, id: 'mlb-579323', name: 'Vlad Guerrero Jr.', position: '1B', avg: '.312',
    gameStats: { atBats: 3, hits: 2, runs: 1, rbi: 2, homeRuns: 1, strikeOuts: 0, walks: 0 },
    seasonStats: { avg: '.312', ops: '.922', homeRuns: 18, rbi: 55, obp: '.382', slg: '.540' } },
  { order: 3, id: 'mlb-647304', name: 'George Springer',   position: 'CF', avg: '.265',
    gameStats: { atBats: 3, hits: 1, runs: 1, rbi: 1, homeRuns: 0, strikeOuts: 1, walks: 0 },
    seasonStats: { avg: '.265', ops: '.801', homeRuns: 14, rbi: 38, obp: '.337', slg: '.464' } },
  { order: 4, id: 'mlb-606466', name: 'Daulton Varsho',    position: 'LF', avg: '.248',
    gameStats: { atBats: 3, hits: 1, runs: 1, rbi: 1, homeRuns: 0, strikeOuts: 1, walks: 0 },
    seasonStats: { avg: '.248', ops: '.749', homeRuns: 11, rbi: 35, obp: '.316', slg: '.433' } },
  { order: 5, id: 'mlb-641645', name: 'Davis Schneider',   position: 'DH', avg: '.229',
    gameStats: { atBats: 2, hits: 0, runs: 0, rbi: 0, homeRuns: 0, strikeOuts: 1, walks: 1 },
    seasonStats: { avg: '.229', ops: '.685', homeRuns: 7,  rbi: 22, obp: '.303', slg: '.382' } },
  { order: 6, id: 'mlb-668942', name: 'Ernie Clement',     position: '2B', avg: '.241',
    gameStats: { atBats: 3, hits: 0, runs: 0, rbi: 0, homeRuns: 0, strikeOuts: 2, walks: 0 },
    seasonStats: { avg: '.241', ops: '.663', homeRuns: 4,  rbi: 19, obp: '.291', slg: '.372' } },
  { order: 7, id: 'mlb-680757', name: 'Addison Barger',    position: '3B', avg: '.252',
    gameStats: { atBats: 2, hits: 1, runs: 0, rbi: 0, homeRuns: 0, strikeOuts: 0, walks: 0 },
    seasonStats: { avg: '.252', ops: '.717', homeRuns: 6,  rbi: 24, obp: '.311', slg: '.406' } },
  { order: 8, id: 'mlb-677594', name: 'Danny Jansen',      position: 'C',  avg: '.218',
    gameStats: { atBats: 2, hits: 0, runs: 0, rbi: 0, homeRuns: 0, strikeOuts: 1, walks: 0 },
    seasonStats: { avg: '.218', ops: '.643', homeRuns: 5,  rbi: 18, obp: '.288', slg: '.355' } },
  { order: 9, id: 'mlb-672382', name: 'Kevin Kiermaier',   position: 'RF', avg: '.209',
    gameStats: { atBats: 2, hits: 0, runs: 0, rbi: 0, homeRuns: 0, strikeOuts: 1, walks: 0 },
    seasonStats: { avg: '.209', ops: '.601', homeRuns: 3,  rbi: 14, obp: '.272', slg: '.329' } },
]

// ─── Today's games ────────────────────────────────────────────────────────────

const todayGames = [
  // Game 1: Live — TOR @ NYY, Top 6th, 4-3
  {
    gameId: 'mlb-mock-001',
    league: 'mlb',
    status: 'live',
    scheduleDay: 'today',
    startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    homeTeam: { id: 'nyy', name: 'Yankees',   abbreviation: 'NYY', record: '58-42' },
    awayTeam: { id: 'tor', name: 'Blue Jays', abbreviation: 'TOR', record: '51-49' },
    score: { home: 3, away: 4 },
    period: { current: 6, label: 'Top 6th', isTopHalf: true },
    winProbability: { home: 0.38, away: 0.62, source: 'mlb' },
    winProbabilityTimeline: [
      { period: 1, home: 0.5 },
      { period: 2, home: 0.45 },
      { period: 3, home: 0.52 },
      { period: 4, home: 0.41 },
      { period: 5, home: 0.38 },
    ],
    matchup: {
      batter: { id: 'mlb-579323', name: 'Vlad Guerrero Jr.', avg: '.312', ops: '.902', hrThisSeason: 18 },
      pitcher: { ...GERRIT_COLE },
      count: { balls: 2, strikes: 1, outs: 1 },
      runners: { first: true, second: false, third: false },
      lastPitch: { type: 'FF', speed: 96, description: 'Ball' },
    },
    lineup: {
      home: NYY_LINEUP,
      away: TOR_LINEUP,
      homePitcher: { ...GERRIT_COLE },
      awayPitcher: { ...KEVIN_GAUSMAN },
      homePitchers: [
        { id: 'mlb-543037', name: 'Gerrit Cole',
          gameStats: { inningsPitched: '5.2', hits: 7, runs: 4, earnedRuns: 4, walks: 2, strikeOuts: 6, pitchesThrown: 94 },
          seasonStats: { era: '3.12', wins: 9, losses: 3, ip: '98.2', whip: '1.08' } },
      ],
      awayPitchers: [
        { id: 'mlb-628317', name: 'Kevin Gausman',
          gameStats: { inningsPitched: '5.0', hits: 6, runs: 3, earnedRuns: 3, walks: 1, strikeOuts: 5, pitchesThrown: 88 },
          seasonStats: { era: '3.45', wins: 8, losses: 5, ip: '88.1', whip: '1.14' } },
      ],
    },
    timeline: [
      { period: 1, periodLabel: '1st', homeScore: 0, awayScore: 2 },
      { period: 2, periodLabel: '2nd', homeScore: 1, awayScore: 0 },
      { period: 3, periodLabel: '3rd', homeScore: 0, awayScore: 1 },
      { period: 4, periodLabel: '4th', homeScore: 2, awayScore: 0 },
      { period: 5, periodLabel: '5th', homeScore: 0, awayScore: 1 },
    ],
    lastPlay: 'Vlad Guerrero Jr. lines out to center field.',
    updatedAt: new Date(now.getTime() - 30 * 1000).toISOString(),
  },

  // Game 2: Final — BOS @ BAL, 7-2
  {
    gameId: 'mlb-mock-002',
    league: 'mlb',
    status: 'final',
    scheduleDay: 'today',
    startTime: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
    homeTeam: { id: 'bal', name: 'Orioles',  abbreviation: 'BAL', record: '62-38' },
    awayTeam: { id: 'bos', name: 'Red Sox',  abbreviation: 'BOS', record: '44-56' },
    score: { home: 2, away: 7 },
    period: { current: 9, label: 'Final' },
    lineup: {
      home: [
        { order: 1, id: 'mlb-641355', name: 'Cedric Mullins',    position: 'CF', avg: '.257' },
        { order: 2, id: 'mlb-641487', name: 'Gunnar Henderson',  position: 'SS', avg: '.298' },
        { order: 3, id: 'mlb-670623', name: 'Adley Rutschman',   position: 'C',  avg: '.272' },
        { order: 4, id: 'mlb-663993', name: 'Anthony Santander', position: 'RF', avg: '.285' },
        { order: 5, id: 'mlb-673237', name: 'Ryan Mountcastle',  position: '1B', avg: '.254' },
        { order: 6, id: 'mlb-666971', name: 'Jordan Westburg',   position: '2B', avg: '.261' },
        { order: 7, id: 'mlb-608070', name: 'Ramon Urias',       position: '3B', avg: '.238' },
        { order: 8, id: 'mlb-677776', name: 'Austin Hays',       position: 'LF', avg: '.247' },
        { order: 9, id: 'mlb-678882', name: 'Kyle Stowers',      position: 'DH', avg: '.221' },
      ],
      away: [
        { order: 1, id: 'mlb-656305', name: 'Jarren Duran',      position: 'CF', avg: '.281' },
        { order: 2, id: 'mlb-641531', name: 'Trevor Story',      position: 'SS', avg: '.244' },
        { order: 3, id: 'mlb-642715', name: 'Rafael Devers',     position: '3B', avg: '.278' },
        { order: 4, id: 'mlb-605141', name: 'Masataka Yoshida',  position: 'DH', avg: '.291' },
        { order: 5, id: 'mlb-657020', name: 'Triston Casas',     position: '1B', avg: '.259' },
        { order: 6, id: 'mlb-665926', name: 'Wilyer Abreu',      position: 'LF', avg: '.242' },
        { order: 7, id: 'mlb-665739', name: 'David Hamilton',    position: '2B', avg: '.233' },
        { order: 8, id: 'mlb-646240', name: 'Connor Wong',       position: 'C',  avg: '.246' },
        { order: 9, id: 'mlb-646240', name: 'Rob Refsnyder',     position: 'RF', avg: '.267' },
      ],
      homePitcher: { id: 'mlb-669456', name: 'Dean Kremer',  era: '3.78', wins: 7, losses: 6, ip: '89.0'  },
      awayPitcher: { id: 'mlb-608379', name: 'Tanner Houck', era: '3.61', wins: 8, losses: 4, ip: '87.2'  },
    },
    boxScore: {
      home: {
        batters: [
          { id: 'mlb-641355', name: 'Cedric Mullins',    position: 'CF', seasonAvg: '.257', atBats: 4, runs: 0, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 1, avg: '.250', decision: null },
          { id: 'mlb-641487', name: 'Gunnar Henderson',  position: 'SS', seasonAvg: '.298', atBats: 4, runs: 1, hits: 2, doubles: 1, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 1, avg: '.500', decision: null },
          { id: 'mlb-670623', name: 'Adley Rutschman',   position: 'C',  seasonAvg: '.272', atBats: 3, runs: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 1, strikeOuts: 2, avg: '.000', decision: null },
          { id: 'mlb-663993', name: 'Anthony Santander', position: 'RF', seasonAvg: '.285', atBats: 4, runs: 1, hits: 2, doubles: 0, triples: 0, homeRuns: 1, rbi: 2, walks: 0, strikeOuts: 1, avg: '.500', decision: null },
          { id: 'mlb-673237', name: 'Ryan Mountcastle',  position: '1B', seasonAvg: '.254', atBats: 3, runs: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 1, strikeOuts: 1, avg: '.000', decision: null },
          { id: 'mlb-666971', name: 'Jordan Westburg',   position: '2B', seasonAvg: '.261', atBats: 4, runs: 0, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 2, avg: '.250', decision: null },
          { id: 'mlb-608070', name: 'Ramon Urias',       position: '3B', seasonAvg: '.238', atBats: 3, runs: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 1, avg: '.000', decision: null },
          { id: 'mlb-677776', name: 'Austin Hays',       position: 'LF', seasonAvg: '.247', atBats: 4, runs: 0, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 1, avg: '.250', decision: null },
          { id: 'mlb-678882', name: 'Kyle Stowers',      position: 'DH', seasonAvg: '.221', atBats: 3, runs: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 2, avg: '.000', decision: null },
        ],
        pitchers: [
          { id: 'mlb-669456', name: 'Dean Kremer',   inningsPitched: '5.0', hits: 7, runs: 6, earnedRuns: 6, walks: 2, strikeOuts: 4, pitchesThrown: 91, seasonEra: '3.78', decision: 'L' },
          { id: 'mlb-683162', name: 'Yennier Cano',  inningsPitched: '2.0', hits: 1, runs: 1, earnedRuns: 1, walks: 0, strikeOuts: 2, pitchesThrown: 28, seasonEra: '3.21', decision: null },
          { id: 'mlb-673452', name: 'Felix Bautista', inningsPitched: '2.0', hits: 1, runs: 0, earnedRuns: 0, walks: 1, strikeOuts: 3, pitchesThrown: 31, seasonEra: '2.87', decision: null },
        ],
      },
      away: {
        batters: [
          { id: 'mlb-656305', name: 'Jarren Duran',     position: 'CF', seasonAvg: '.281', atBats: 4, runs: 2, hits: 2, doubles: 0, triples: 0, homeRuns: 1, rbi: 2, walks: 1, strikeOuts: 1, avg: '.500', decision: null },
          { id: 'mlb-641531', name: 'Trevor Story',     position: 'SS', seasonAvg: '.244', atBats: 4, runs: 1, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 1, walks: 0, strikeOuts: 2, avg: '.250', decision: null },
          { id: 'mlb-646240', name: 'Rafael Devers',    position: '3B', seasonAvg: '.278', atBats: 3, runs: 1, hits: 1, doubles: 1, triples: 0, homeRuns: 0, rbi: 2, walks: 1, strikeOuts: 0, avg: '.333', decision: null },
          { id: 'mlb-605141', name: 'Masataka Yoshida', position: 'DH', seasonAvg: '.291', atBats: 4, runs: 1, hits: 2, doubles: 0, triples: 0, homeRuns: 0, rbi: 1, walks: 0, strikeOuts: 0, avg: '.500', decision: null },
          { id: 'mlb-657020', name: 'Triston Casas',    position: '1B', seasonAvg: '.259', atBats: 4, runs: 1, hits: 2, doubles: 1, triples: 0, homeRuns: 0, rbi: 1, walks: 0, strikeOuts: 1, avg: '.500', decision: null },
          { id: 'mlb-665926', name: 'Wilyer Abreu',     position: 'LF', seasonAvg: '.242', atBats: 4, runs: 0, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 1, avg: '.250', decision: null },
          { id: 'mlb-665739', name: 'David Hamilton',   position: '2B', seasonAvg: '.233', atBats: 3, runs: 1, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 1, strikeOuts: 0, avg: '.333', decision: null },
          { id: 'mlb-646241', name: 'Connor Wong',      position: 'C',  seasonAvg: '.246', atBats: 4, runs: 0, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 1, avg: '.250', decision: null },
          { id: 'mlb-646242', name: 'Rob Refsnyder',    position: 'RF', seasonAvg: '.267', atBats: 3, runs: 0, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 1, strikeOuts: 0, avg: '.333', decision: null },
        ],
        pitchers: [
          { id: 'mlb-608379', name: 'Tanner Houck',   inningsPitched: '7.0', hits: 5, runs: 2, earnedRuns: 2, walks: 1, strikeOuts: 8, pitchesThrown: 102, seasonEra: '3.61', decision: 'W' },
          { id: 'mlb-628711', name: 'Kenley Jansen',  inningsPitched: '2.0', hits: 2, runs: 0, earnedRuns: 0, walks: 0, strikeOuts: 3, pitchesThrown: 26, seasonEra: '2.44', decision: 'S' },
        ],
      },
      decisions: {
        winner: { id: 'mlb-608379', name: 'Tanner Houck' },
        loser:  { id: 'mlb-669456', name: 'Dean Kremer' },
        save:   { id: 'mlb-628711', name: 'Kenley Jansen' },
      },
      gameInfo: { duration: '2:48', attendance: '31,422', hpUmpire: 'Larry Vanover' },
    },
    winProbabilityTimeline: [
      { period: 1, home: 0.5  }, { period: 2, home: 0.42 }, { period: 3, home: 0.35 },
      { period: 4, home: 0.28 }, { period: 5, home: 0.31 }, { period: 6, home: 0.25 },
      { period: 7, home: 0.22 }, { period: 8, home: 0.18 }, { period: 9, home: 0.15 },
    ],
    timeline: [
      { period: 1, periodLabel: '1st', homeScore: 0, awayScore: 3 },
      { period: 2, periodLabel: '2nd', homeScore: 1, awayScore: 0 },
      { period: 3, periodLabel: '3rd', homeScore: 0, awayScore: 1 },
      { period: 4, periodLabel: '4th', homeScore: 0, awayScore: 2 },
      { period: 5, periodLabel: '5th', homeScore: 1, awayScore: 0 },
      { period: 6, periodLabel: '6th', homeScore: 0, awayScore: 1 },
      { period: 7, periodLabel: '7th', homeScore: 0, awayScore: 0 },
      { period: 8, periodLabel: '8th', homeScore: 0, awayScore: 0 },
      { period: 9, periodLabel: '9th', homeScore: 0, awayScore: 0 },
    ],
    updatedAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
  },

  // Game 3: Scheduled — LAD @ SF, 2 hours from now
  {
    gameId: 'mlb-mock-003',
    league: 'mlb',
    status: 'scheduled',
    scheduleDay: 'today',
    startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    homeTeam: { id: 'sf',  name: 'Giants',  abbreviation: 'SF',  record: '47-53' },
    awayTeam: { id: 'lad', name: 'Dodgers', abbreviation: 'LAD', record: '71-29' },
    score: { home: 0, away: 0 },
    period: { current: 0, label: 'Scheduled' },
    winProbability: { home: 0.35, away: 0.65, source: 'model' },
    probablePitchers: {
      home: { ...LOGAN_WEBB },
      away: { ...TYLER_GLASNOW },
    },
    timeline: [],
    updatedAt: now.toISOString(),
  },

  // Game 4: Delayed — CHC @ STL, was in 3rd
  {
    gameId: 'mlb-mock-004',
    league: 'mlb',
    status: 'delayed',
    scheduleDay: 'today',
    startTime: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
    homeTeam: { id: 'stl', name: 'Cardinals', abbreviation: 'STL', record: '49-51' },
    awayTeam: { id: 'chc', name: 'Cubs',      abbreviation: 'CHC', record: '53-47' },
    score: { home: 1, away: 2 },
    period: { current: 3, label: 'Delayed - 3rd' },
    timeline: [
      { period: 1, periodLabel: '1st', homeScore: 1, awayScore: 0 },
      { period: 2, periodLabel: '2nd', homeScore: 0, awayScore: 2 },
    ],
    lastPlay: 'Game delayed due to rain. Top of 3rd.',
    updatedAt: new Date(now.getTime() - 20 * 60 * 1000).toISOString(),
  },
]

// ─── Yesterday's games (all final) ───────────────────────────────────────────

const yBase = new Date(now.getTime() - 24 * 60 * 60 * 1000)

const yesterdayGames = [
  {
    gameId: 'mlb-mock-y001',
    league: 'mlb',
    status: 'final',
    scheduleDay: 'yesterday',
    startTime: new Date(yBase.getTime() - 3 * 60 * 60 * 1000).toISOString(),
    homeTeam: { id: 'stl', name: 'Cardinals', abbreviation: 'STL', record: '49-51' },
    awayTeam: { id: 'chc', name: 'Cubs',      abbreviation: 'CHC', record: '53-47' },
    score: { home: 3, away: 5 },
    period: { current: 9, label: 'Final' },
    lineup: {
      home: [
        { order: 1, id: 'mlb-660271', name: 'Lars Nootbaar',    position: 'RF', avg: '.265' },
        { order: 2, id: 'mlb-641553', name: 'Brendan Donovan',  position: '2B', avg: '.271' },
        { order: 3, id: 'mlb-544931', name: 'Paul Goldschmidt', position: '1B', avg: '.254' },
        { order: 4, id: 'mlb-516782', name: 'Nolan Arenado',    position: '3B', avg: '.268' },
        { order: 5, id: 'mlb-641355', name: 'Willson Contreras',position: 'C',  avg: '.239' },
        { order: 6, id: 'mlb-676391', name: 'Jordan Walker',    position: 'DH', avg: '.248' },
        { order: 7, id: 'mlb-670623', name: "Tyler O'Neill",    position: 'LF', avg: '.242' },
        { order: 8, id: 'mlb-656887', name: 'Tommy Edman',      position: 'SS', avg: '.258' },
        { order: 9, id: 'mlb-641531', name: 'Victor Scott II',  position: 'CF', avg: '.211' },
      ],
      away: [
        { order: 1, id: 'mlb-669720', name: 'Nico Hoerner',     position: '2B', avg: '.274' },
        { order: 2, id: 'mlb-592743', name: 'Ian Happ',         position: 'LF', avg: '.263' },
        { order: 3, id: 'mlb-641645', name: 'Seiya Suzuki',     position: 'RF', avg: '.281' },
        { order: 4, id: 'mlb-657020', name: 'Cody Bellinger',   position: 'CF', avg: '.258' },
        { order: 5, id: 'mlb-665926', name: 'Christopher Morel',position: '3B', avg: '.236' },
        { order: 6, id: 'mlb-673237', name: 'Matt Mervis',      position: '1B', avg: '.234' },
        { order: 7, id: 'mlb-666971', name: 'Mike Tauchman',    position: 'DH', avg: '.227' },
        { order: 8, id: 'mlb-677776', name: 'Miguel Amaya',     position: 'C',  avg: '.239' },
        { order: 9, id: 'mlb-678882', name: 'Dansby Swanson',   position: 'SS', avg: '.247' },
      ],
      homePitcher: { id: 'mlb-641154', name: 'Sonny Gray',      era: '3.48', wins: 8, losses: 6, ip: '86.1' },
      awayPitcher: { id: 'mlb-592767', name: 'Marcus Stroman',  era: '3.91', wins: 6, losses: 7, ip: '74.0' },
    },
    winProbabilityTimeline: [
      { period: 1, home: 0.5  }, { period: 2, home: 0.56 }, { period: 3, home: 0.49 },
      { period: 4, home: 0.41 }, { period: 5, home: 0.38 }, { period: 6, home: 0.32 },
      { period: 7, home: 0.29 }, { period: 8, home: 0.24 }, { period: 9, home: 0.19 },
    ],
    timeline: [
      { period: 1, periodLabel: '1st', homeScore: 1, awayScore: 0 },
      { period: 2, periodLabel: '2nd', homeScore: 0, awayScore: 2 },
      { period: 3, periodLabel: '3rd', homeScore: 2, awayScore: 0 },
      { period: 4, periodLabel: '4th', homeScore: 0, awayScore: 1 },
      { period: 5, periodLabel: '5th', homeScore: 0, awayScore: 2 },
      { period: 6, periodLabel: '6th', homeScore: 0, awayScore: 0 },
      { period: 7, periodLabel: '7th', homeScore: 0, awayScore: 0 },
      { period: 8, periodLabel: '8th', homeScore: 0, awayScore: 0 },
      { period: 9, periodLabel: '9th', homeScore: 0, awayScore: 0 },
    ],
    boxScore: {
      home: {
        batters: [
          { id: 'mlb-660271', name: 'Lars Nootbaar',    position: 'RF', seasonAvg: '.265', atBats: 4, runs: 1, hits: 2, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 0 },
          { id: 'mlb-641553', name: 'Brendan Donovan',  position: '2B', seasonAvg: '.271', atBats: 4, runs: 0, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 1, walks: 0, strikeOuts: 1 },
          { id: 'mlb-544931', name: 'Paul Goldschmidt', position: '1B', seasonAvg: '.254', atBats: 3, runs: 1, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 1, walks: 1, strikeOuts: 1 },
          { id: 'mlb-516782', name: 'Nolan Arenado',    position: '3B', seasonAvg: '.268', atBats: 4, runs: 0, hits: 1, doubles: 1, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 1 },
          { id: 'mlb-641355', name: 'Willson Contreras',position: 'C',  seasonAvg: '.239', atBats: 4, runs: 1, hits: 1, doubles: 0, triples: 0, homeRuns: 1, rbi: 2, walks: 0, strikeOuts: 2 },
          { id: 'mlb-676391', name: 'Jordan Walker',    position: 'DH', seasonAvg: '.248', atBats: 3, runs: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 1, strikeOuts: 1 },
          { id: 'mlb-670623', name: "Tyler O'Neill",    position: 'LF', seasonAvg: '.242', atBats: 4, runs: 0, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 2 },
          { id: 'mlb-656887', name: 'Tommy Edman',      position: 'SS', seasonAvg: '.258', atBats: 4, runs: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 1 },
          { id: 'mlb-641531', name: 'Victor Scott II',  position: 'CF', seasonAvg: '.211', atBats: 3, runs: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 2 },
        ],
        pitchers: [
          { id: 'mlb-641154', name: 'Sonny Gray',    inningsPitched: '5.0', hits: 7, runs: 4, earnedRuns: 4, walks: 2, strikeOuts: 5, pitchesThrown: 89, seasonEra: '3.48', decision: 'L' },
          { id: 'mlb-641860', name: 'Kyle Gibson',   inningsPitched: '2.0', hits: 1, runs: 1, earnedRuns: 1, walks: 1, strikeOuts: 1, pitchesThrown: 34, seasonEra: '4.12', decision: null },
          { id: 'mlb-669722', name: 'JoJo Romero',   inningsPitched: '1.0', hits: 0, runs: 0, earnedRuns: 0, walks: 0, strikeOuts: 1, pitchesThrown: 11, seasonEra: '3.24', decision: null },
          { id: 'mlb-672515', name: 'Chris Stratton', inningsPitched: '1.0', hits: 1, runs: 0, earnedRuns: 0, walks: 0, strikeOuts: 1, pitchesThrown: 15, seasonEra: '3.67', decision: null },
        ],
      },
      away: {
        batters: [
          { id: 'mlb-669720', name: 'Nico Hoerner',      position: '2B', seasonAvg: '.274', atBats: 4, runs: 0, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 0 },
          { id: 'mlb-592743', name: 'Ian Happ',           position: 'LF', seasonAvg: '.263', atBats: 4, runs: 1, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 1, walks: 0, strikeOuts: 1 },
          { id: 'mlb-641645', name: 'Seiya Suzuki',       position: 'RF', seasonAvg: '.281', atBats: 4, runs: 1, hits: 2, doubles: 1, triples: 0, homeRuns: 0, rbi: 1, walks: 0, strikeOuts: 1 },
          { id: 'mlb-657020', name: 'Cody Bellinger',     position: 'CF', seasonAvg: '.258', atBats: 3, runs: 1, hits: 1, doubles: 0, triples: 0, homeRuns: 1, rbi: 2, walks: 1, strikeOuts: 0 },
          { id: 'mlb-665926', name: 'Christopher Morel',  position: '3B', seasonAvg: '.236', atBats: 4, runs: 0, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 1 },
          { id: 'mlb-673237', name: 'Matt Mervis',        position: '1B', seasonAvg: '.234', atBats: 4, runs: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 2 },
          { id: 'mlb-666971', name: 'Mike Tauchman',      position: 'DH', seasonAvg: '.227', atBats: 3, runs: 1, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 1, strikeOuts: 0 },
          { id: 'mlb-677776', name: 'Miguel Amaya',       position: 'C',  seasonAvg: '.239', atBats: 3, runs: 1, hits: 1, doubles: 0, triples: 0, homeRuns: 1, rbi: 1, walks: 0, strikeOuts: 1 },
          { id: 'mlb-678882', name: 'Dansby Swanson',     position: 'SS', seasonAvg: '.247', atBats: 4, runs: 0, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 1 },
        ],
        pitchers: [
          { id: 'mlb-592767', name: 'Marcus Stroman', inningsPitched: '6.0', hits: 5, runs: 3, earnedRuns: 3, walks: 1, strikeOuts: 6, pitchesThrown: 94, seasonEra: '3.91', decision: 'W' },
          { id: 'mlb-641933', name: 'Hector Neris',   inningsPitched: '1.0', hits: 2, runs: 0, earnedRuns: 0, walks: 0, strikeOuts: 1, pitchesThrown: 19, seasonEra: '3.55', decision: null },
          { id: 'mlb-657557', name: 'Adbert Alzolay', inningsPitched: '1.0', hits: 0, runs: 0, earnedRuns: 0, walks: 0, strikeOuts: 2, pitchesThrown: 12, seasonEra: '3.18', decision: null },
          { id: 'mlb-672382', name: 'Brad Boxberger', inningsPitched: '1.0', hits: 0, runs: 0, earnedRuns: 0, walks: 0, strikeOuts: 1, pitchesThrown: 10, seasonEra: '3.88', decision: null },
        ],
      },
      decisions: {
        winner: { id: 'mlb-592767', name: 'Marcus Stroman', record: '7-7' },
        loser:  { id: 'mlb-641154', name: 'Sonny Gray',     record: '8-7' },
      },
      gameInfo: { duration: '2:52', attendance: '37,143', hpUmpire: 'Gabe Morales' },
    },
    updatedAt: new Date(yBase.getTime() + 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    gameId: 'mlb-mock-y002',
    league: 'mlb',
    status: 'final',
    scheduleDay: 'yesterday',
    startTime: new Date(yBase.getTime() - 4 * 60 * 60 * 1000).toISOString(),
    homeTeam: { id: 'col', name: 'Rockies', abbreviation: 'COL', record: '28-72' },
    awayTeam: { id: 'sd',  name: 'Padres',  abbreviation: 'SD',  record: '56-44' },
    score: { home: 2, away: 8 },
    period: { current: 9, label: 'Final' },
    lineup: {
      home: [
        { order: 1, id: 'mlb-596019', name: 'Charlie Blackmon',  position: 'CF', avg: '.243' },
        { order: 2, id: 'mlb-641538', name: 'Brendan Rodgers',   position: '2B', avg: '.270' },
        { order: 3, id: 'mlb-571771', name: 'C.J. Cron',         position: '1B', avg: '.252' },
        { order: 4, id: 'mlb-641857', name: 'Ryan McMahon',      position: '3B', avg: '.233' },
        { order: 5, id: 'mlb-608577', name: 'Elias Diaz',        position: 'C',  avg: '.260' },
        { order: 6, id: 'mlb-594838', name: 'Randal Grichuk',    position: 'RF', avg: '.251' },
        { order: 7, id: 'mlb-592351', name: 'Kris Bryant',       position: 'LF', avg: '.246' },
        { order: 8, id: 'mlb-547379', name: 'José Iglesias',     position: 'SS', avg: '.264' },
        { order: 9, id: 'mlb-669680', name: 'Brian Serven',      position: 'DH', avg: '.229' },
      ],
      away: [
        { order: 1, id: 'mlb-673490', name: 'Ha-Seong Kim',      position: 'SS', avg: '.285' },
        { order: 2, id: 'mlb-676801', name: 'Jake Cronenworth',  position: '2B', avg: '.241' },
        { order: 3, id: 'mlb-572821', name: 'Xander Bogaerts',   position: 'DH', avg: '.293' },
        { order: 4, id: 'mlb-665742', name: 'Juan Soto',         position: 'RF', avg: '.291' },
        { order: 5, id: 'mlb-592518', name: 'Manny Machado',     position: '3B', avg: '.272' },
        { order: 6, id: 'mlb-665487', name: 'Fernando Tatis Jr.', position: 'CF', avg: '.283' },
        { order: 7, id: 'mlb-605137', name: 'Josh Bell',         position: '1B', avg: '.260' },
        { order: 8, id: 'mlb-606466', name: 'Austin Nola',       position: 'C',  avg: '.232' },
        { order: 9, id: 'mlb-621466', name: 'Trent Grisham',     position: 'LF', avg: '.244' },
      ],
      homePitcher: { id: 'mlb-669923', name: 'Austin Gomber',  era: '5.23', wins: 4, losses: 11, ip: '68.2' },
      awayPitcher: { id: 'mlb-605400', name: 'Blake Snell',    era: '2.86', wins: 14, losses: 4, ip: '103.1' },
    },
    winProbabilityTimeline: [
      { period: 1, home: 0.5  }, { period: 2, home: 0.38 }, { period: 3, home: 0.29 },
      { period: 4, home: 0.22 }, { period: 5, home: 0.18 }, { period: 6, home: 0.14 },
      { period: 7, home: 0.11 }, { period: 8, home: 0.09 }, { period: 9, home: 0.07 },
    ],
    timeline: [
      { period: 1, periodLabel: '1st', homeScore: 1, awayScore: 2 },
      { period: 2, periodLabel: '2nd', homeScore: 0, awayScore: 3 },
      { period: 3, periodLabel: '3rd', homeScore: 0, awayScore: 1 },
      { period: 4, periodLabel: '4th', homeScore: 1, awayScore: 0 },
      { period: 5, periodLabel: '5th', homeScore: 0, awayScore: 2 },
      { period: 6, periodLabel: '6th', homeScore: 0, awayScore: 0 },
      { period: 7, periodLabel: '7th', homeScore: 0, awayScore: 0 },
      { period: 8, periodLabel: '8th', homeScore: 0, awayScore: 0 },
      { period: 9, periodLabel: '9th', homeScore: 0, awayScore: 0 },
    ],
    boxScore: {
      home: {
        batters: [
          { id: 'mlb-596019', name: 'Charlie Blackmon',  position: 'CF', seasonAvg: '.243', atBats: 4, runs: 0, hits: 2, doubles: 0, triples: 0, homeRuns: 0, rbi: 1, walks: 0, strikeOuts: 1 },
          { id: 'mlb-641538', name: 'Brendan Rodgers',   position: '2B', seasonAvg: '.270', atBats: 4, runs: 0, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 1 },
          { id: 'mlb-571771', name: 'C.J. Cron',         position: '1B', seasonAvg: '.252', atBats: 4, runs: 1, hits: 1, doubles: 0, triples: 0, homeRuns: 1, rbi: 1, walks: 0, strikeOuts: 1 },
          { id: 'mlb-641857', name: 'Ryan McMahon',      position: '3B', seasonAvg: '.233', atBats: 4, runs: 1, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 2 },
          { id: 'mlb-608577', name: 'Elias Diaz',        position: 'C',  seasonAvg: '.260', atBats: 3, runs: 0, hits: 1, doubles: 1, triples: 0, homeRuns: 0, rbi: 0, walks: 1, strikeOuts: 1 },
          { id: 'mlb-594838', name: 'Randal Grichuk',    position: 'RF', seasonAvg: '.251', atBats: 4, runs: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 2 },
          { id: 'mlb-592351', name: 'Kris Bryant',       position: 'LF', seasonAvg: '.246', atBats: 3, runs: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 1, strikeOuts: 2 },
          { id: 'mlb-547379', name: 'José Iglesias',     position: 'SS', seasonAvg: '.264', atBats: 4, runs: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 1 },
          { id: 'mlb-669680', name: 'Brian Serven',      position: 'DH', seasonAvg: '.229', atBats: 3, runs: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 2 },
        ],
        pitchers: [
          { id: 'mlb-669923', name: 'Austin Gomber',  inningsPitched: '4.1', hits: 8, runs: 7, earnedRuns: 7, walks: 2, strikeOuts: 4, pitchesThrown: 87, seasonEra: '5.23', decision: 'L' },
          { id: 'mlb-669127', name: 'Ryan Feltner',   inningsPitched: '2.2', hits: 2, runs: 1, earnedRuns: 1, walks: 1, strikeOuts: 3, pitchesThrown: 45, seasonEra: '5.81', decision: null },
          { id: 'mlb-656023', name: 'Jake Bird',      inningsPitched: '1.0', hits: 1, runs: 0, earnedRuns: 0, walks: 0, strikeOuts: 2, pitchesThrown: 15, seasonEra: '4.05', decision: null },
          { id: 'mlb-666301', name: 'Jake Brentz',    inningsPitched: '1.0', hits: 0, runs: 0, earnedRuns: 0, walks: 0, strikeOuts: 1, pitchesThrown: 12, seasonEra: '3.86', decision: null },
        ],
      },
      away: {
        batters: [
          { id: 'mlb-673490', name: 'Ha-Seong Kim',       position: 'SS', seasonAvg: '.285', atBats: 5, runs: 1, hits: 2, doubles: 0, triples: 0, homeRuns: 0, rbi: 1, walks: 0, strikeOuts: 1 },
          { id: 'mlb-676801', name: 'Jake Cronenworth',   position: '2B', seasonAvg: '.241', atBats: 4, runs: 1, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 1, strikeOuts: 1 },
          { id: 'mlb-572821', name: 'Xander Bogaerts',    position: 'DH', seasonAvg: '.293', atBats: 5, runs: 1, hits: 2, doubles: 1, triples: 0, homeRuns: 0, rbi: 2, walks: 0, strikeOuts: 0 },
          { id: 'mlb-665742', name: 'Juan Soto',          position: 'RF', seasonAvg: '.291', atBats: 3, runs: 2, hits: 2, doubles: 0, triples: 0, homeRuns: 1, rbi: 3, walks: 2, strikeOuts: 1 },
          { id: 'mlb-592518', name: 'Manny Machado',      position: '3B', seasonAvg: '.272', atBats: 5, runs: 1, hits: 2, doubles: 1, triples: 0, homeRuns: 0, rbi: 1, walks: 0, strikeOuts: 1 },
          { id: 'mlb-665487', name: 'Fernando Tatis Jr.', position: 'CF', seasonAvg: '.283', atBats: 4, runs: 1, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 1, strikeOuts: 2 },
          { id: 'mlb-605137', name: 'Josh Bell',          position: '1B', seasonAvg: '.260', atBats: 4, runs: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 2 },
          { id: 'mlb-606466', name: 'Austin Nola',        position: 'C',  seasonAvg: '.232', atBats: 4, runs: 0, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 1 },
          { id: 'mlb-621466', name: 'Trent Grisham',      position: 'LF', seasonAvg: '.244', atBats: 3, runs: 1, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 1, walks: 1, strikeOuts: 1 },
        ],
        pitchers: [
          { id: 'mlb-605400', name: 'Blake Snell',  inningsPitched: '7.0', hits: 4, runs: 1, earnedRuns: 1, walks: 2, strikeOuts: 9, pitchesThrown: 101, seasonEra: '2.86', decision: 'W' },
          { id: 'mlb-571656', name: 'Josh Hader',   inningsPitched: '2.0', hits: 2, runs: 1, earnedRuns: 1, walks: 0, strikeOuts: 3, pitchesThrown: 31,  seasonEra: '1.45', decision: null },
        ],
      },
      decisions: {
        winner: { id: 'mlb-605400', name: 'Blake Snell',    record: '14-5' },
        loser:  { id: 'mlb-669923', name: 'Austin Gomber',  record: '4-12' },
        save:   { id: 'mlb-571656', name: 'Josh Hader',     saves: 28 },
      },
      gameInfo: { duration: '2:44', attendance: '44,281', hpUmpire: 'Pat Hoberg' },
    },
    updatedAt: new Date(yBase.getTime() + 3.5 * 60 * 60 * 1000).toISOString(),
  },
]

// ─── Tomorrow's games (all scheduled) ────────────────────────────────────────

const tBase = new Date(now.getTime() + 24 * 60 * 60 * 1000)

const tomorrowGames = [
  {
    gameId: 'mlb-mock-t001',
    league: 'mlb',
    status: 'scheduled',
    scheduleDay: 'tomorrow',
    startTime: new Date(tBase.getTime() + 60 * 60 * 1000).toISOString(),
    homeTeam: { id: 'hou', name: 'Astros',   abbreviation: 'HOU', record: '60-40' },
    awayTeam: { id: 'sea', name: 'Mariners', abbreviation: 'SEA', record: '55-45' },
    score: { home: 0, away: 0 },
    period: { current: 0, label: 'Scheduled' },
    probablePitchers: {
      home: { ...FRAMBER_VALDEZ },
      away: { ...LOGAN_GILBERT },
    },
    timeline: [],
    updatedAt: tBase.toISOString(),
  },
  {
    gameId: 'mlb-mock-t002',
    league: 'mlb',
    status: 'scheduled',
    scheduleDay: 'tomorrow',
    startTime: new Date(tBase.getTime() + 3 * 60 * 60 * 1000).toISOString(),
    homeTeam: { id: 'phi', name: 'Phillies', abbreviation: 'PHI', record: '63-37' },
    awayTeam: { id: 'nym', name: 'Mets',     abbreviation: 'NYM', record: '54-46' },
    score: { home: 0, away: 0 },
    period: { current: 0, label: 'Scheduled' },
    probablePitchers: {
      home: { ...ZACK_WHEELER },
      away: { ...KODAI_SENGA },
    },
    timeline: [],
    updatedAt: tBase.toISOString(),
  },
]

// ─── Exports ──────────────────────────────────────────────────────────────────

export const mockGames = todayGames

export const mockGamesByDay = {
  yesterday: yesterdayGames,
  today: todayGames,
  tomorrow: tomorrowGames,
}
