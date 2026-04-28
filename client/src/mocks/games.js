// GameEvent interface (from PRD):
// { gameId, league, status, startTime, scheduleDay, homeTeam, awayTeam, score,
//   period, winProbability?, winProbabilityTimeline?, timeline, lastPlay?,
//   matchup?, lineup?, probablePitchers?, updatedAt }

const now = new Date()

export const LIVE_GAME_ID = 'mlb-2024-001'
export const FINAL_GAME_ID = 'mlb-2024-002'
export const SCHEDULED_GAME_ID = 'mlb-2024-003'
export const DELAYED_GAME_ID = 'mlb-2024-004'

// ─── Shared pitcher stubs ────────────────────────────────────────────────────

const GERRIT_COLE    = {
  id: 'mlb-543037', name: 'Gerrit Cole',    era: '3.12', wins: 9,  losses: 3, ip: '98.2',
  seasonStats: { era: '3.12', wins: 9,  losses: 3, ip: '98.2',  k: 112, bb: 24, whip: '1.08' },
  last10: { era: '2.89', wins: 4, losses: 1, ip: '62.1', k: 74, bb: 12 },
}
const KEVIN_GAUSMAN  = {
  id: 'mlb-592518', name: 'Kevin Gausman',  era: '3.45', wins: 8,  losses: 4, ip: '91.0',
  seasonStats: { era: '3.45', wins: 8,  losses: 4, ip: '91.0',  k: 97,  bb: 21, whip: '1.14' },
  last10: { era: '3.91', wins: 3, losses: 2, ip: '55.0', k: 58, bb: 14 },
}
const TANNER_HOUCK   = {
  id: 'mlb-608379', name: 'Tanner Houck',   era: '3.61', wins: 8,  losses: 4, ip: '87.2',
  seasonStats: { era: '3.61', wins: 8,  losses: 4, ip: '87.2',  k: 94,  bb: 28, whip: '1.19' },
  last10: { era: '3.12', wins: 4, losses: 1, ip: '57.2', k: 62, bb: 16 },
}
const JOHN_MEANS     = {
  id: 'mlb-656334', name: 'John Means',     era: '4.12', wins: 5,  losses: 7, ip: '74.1',
  seasonStats: { era: '4.12', wins: 5,  losses: 7, ip: '74.1',  k: 71,  bb: 22, whip: '1.31' },
  last10: { era: '4.58', wins: 2, losses: 3, ip: '47.0', k: 44, bb: 15 },
}
const LOGAN_WEBB     = {
  id: 'mlb-657277', name: 'Logan Webb',     era: '2.88', wins: 11, losses: 4, ip: '112.0',
  seasonStats: { era: '2.88', wins: 11, losses: 4, ip: '112.0', k: 104, bb: 23, whip: '1.09' },
  last10: { era: '2.61', wins: 5, losses: 1, ip: '65.2', k: 63, bb: 13 },
}
const TYLER_GLASNOW  = {
  id: 'mlb-607192', name: 'Tyler Glasnow',  era: '3.21', wins: 10, losses: 5, ip: '103.1',
  seasonStats: { era: '3.21', wins: 10, losses: 5, ip: '103.1', k: 131, bb: 31, whip: '1.07' },
  last10: { era: '2.45', wins: 5, losses: 1, ip: '63.1', k: 82, bb: 18 },
}
const ZACK_WHEELER   = {
  id: 'mlb-554430', name: 'Zack Wheeler',   era: '2.95', wins: 12, losses: 4, ip: '119.2',
  seasonStats: { era: '2.95', wins: 12, losses: 4, ip: '119.2', k: 124, bb: 28, whip: '1.09' },
  last10: { era: '2.72', wins: 6, losses: 1, ip: '72.1', k: 80, bb: 16 },
}
const KODAI_SENGA    = {
  id: 'mlb-685029', name: 'Kodai Senga',    era: '3.38', wins: 9,  losses: 6, ip: '96.0',
  seasonStats: { era: '3.38', wins: 9,  losses: 6, ip: '96.0',  k: 116, bb: 29, whip: '1.12' },
  last10: { era: '2.95', wins: 5, losses: 2, ip: '59.2', k: 74, bb: 18 },
}
const FRAMBER_VALDEZ = {
  id: 'mlb-664285', name: 'Framber Valdez', era: '3.14', wins: 10, losses: 5, ip: '107.0',
  seasonStats: { era: '3.14', wins: 10, losses: 5, ip: '107.0', k: 103, bb: 35, whip: '1.22' },
  last10: { era: '3.05', wins: 5, losses: 2, ip: '67.0', k: 66, bb: 21 },
}
const LOGAN_GILBERT  = {
  id: 'mlb-669302', name: 'Logan Gilbert',  era: '3.73', wins: 7,  losses: 6, ip: '89.0',
  seasonStats: { era: '3.73', wins: 7,  losses: 6, ip: '89.0',  k: 95,  bb: 24, whip: '1.18' },
  last10: { era: '3.72', wins: 4, losses: 3, ip: '60.2', k: 65, bb: 17 },
}
const KENLEY_JANSEN  = {
  id: 'mlb-628711', name: 'Kenley Jansen',  era: '2.44', wins: 2,  losses: 1, ip: '29.2',
  seasonStats: { era: '2.44', wins: 2,  losses: 1, ip: '29.2',  k: 41,  bb: 6,  whip: '0.91' },
  last10: null,
}
const NICK_PIVETTA   = {
  id: 'mlb-605400', name: 'Nick Pivetta',   era: '4.21', wins: 6,  losses: 8, ip: '82.0',
  seasonStats: { era: '4.21', wins: 6,  losses: 8, ip: '82.0',  k: 89,  bb: 31, whip: '1.33' },
  last10: { era: '4.05', wins: 3, losses: 3, ip: '51.0', k: 55, bb: 19 },
}

// ─── Batting lineups ─────────────────────────────────────────────────────────

// Helper to build a season stats object for batters
function mkBatterSeason(avg, obp, slg, ops, gp, ab, h, hr, rbi, r, d, t, sb, k, bb) {
  return { avg, obp, slg, ops, gamesPlayed: gp, atBats: ab, hits: h, homeRuns: hr, rbi, runs: r, doubles: d, triples: t, stolenBases: sb, strikeouts: k, walks: bb }
}

const NYY_LINEUP = [
  { order: 1, id: 'mlb-608369', name: 'DJ LeMahieu',       position: '3B', avg: '.261',
    gameStats:   { atBats: 2, runs: 1, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 1, stolenBases: 0, avg: '.500' },
    seasonStats: mkBatterSeason('.261', '.332', '.389', '.721', 82, 276, 72, 7, 41, 38, 14, 1, 2, 44, 32) },
  { order: 2, id: 'mlb-592450', name: 'Aaron Judge',       position: 'RF', avg: '.311',
    gameStats:   { atBats: 2, runs: 1, hits: 1, doubles: 0, triples: 0, homeRuns: 1, rbi: 2, walks: 1, strikeOuts: 0, stolenBases: 0, avg: '.500' },
    seasonStats: mkBatterSeason('.311', '.425', '.641', '1.066', 84, 241, 75, 31, 79, 71, 12, 1, 4, 67, 61) },
  { order: 3, id: 'mlb-519317', name: 'Giancarlo Stanton', position: 'DH', avg: '.248',
    gameStats:   { atBats: 2, runs: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 1, stolenBases: 0, avg: '.000' },
    seasonStats: mkBatterSeason('.248', '.329', '.497', '.826', 76, 218, 54, 18, 52, 41, 9, 0, 0, 68, 29) },
  { order: 4, id: 'mlb-596019', name: 'Anthony Rizzo',     position: '1B', avg: '.224',
    gameStats:   { atBats: 1, runs: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 1, strikeOuts: 0, stolenBases: 0, avg: '.000' },
    seasonStats: mkBatterSeason('.224', '.312', '.381', '.693', 78, 232, 52, 11, 38, 34, 10, 0, 0, 52, 28) },
  { order: 5, id: 'mlb-668731', name: 'Gleyber Torres',    position: '2B', avg: '.257',
    gameStats:   { atBats: 2, runs: 1, hits: 1, doubles: 0, triples: 0, homeRuns: 1, rbi: 1, walks: 0, strikeOuts: 0, stolenBases: 0, avg: '.500' },
    seasonStats: mkBatterSeason('.257', '.326', '.437', '.763', 80, 261, 67, 14, 47, 42, 13, 2, 8, 58, 28) },
  { order: 6, id: 'mlb-657041', name: 'Oswaldo Cabrera',   position: 'SS', avg: '.238',
    gameStats:   { atBats: 2, runs: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 1, stolenBases: 0, avg: '.000' },
    seasonStats: mkBatterSeason('.238', '.296', '.368', '.664', 68, 189, 45, 7, 28, 26, 9, 1, 4, 46, 16) },
  { order: 7, id: 'mlb-663386', name: 'Harrison Bader',    position: 'CF', avg: '.221',
    gameStats:   { atBats: 1, runs: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 1, strikeOuts: 0, stolenBases: 0, avg: '.000' },
    seasonStats: mkBatterSeason('.221', '.296', '.341', '.637', 62, 172, 38, 5, 22, 24, 7, 2, 9, 48, 18) },
  { order: 8, id: 'mlb-605131', name: 'Jose Trevino',      position: 'C',  avg: '.243',
    gameStats:   { atBats: 2, runs: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 1, stolenBases: 0, avg: '.000' },
    seasonStats: mkBatterSeason('.243', '.289', '.371', '.660', 64, 152, 37, 5, 24, 18, 7, 0, 0, 28, 9) },
  { order: 9, id: 'mlb-641933', name: 'Isiah Kiner-Falefa', position: 'LF', avg: '.232',
    gameStats:   { atBats: 1, runs: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 0, stolenBases: 1, avg: '.000' },
    seasonStats: mkBatterSeason('.232', '.284', '.316', '.600', 72, 207, 48, 2, 21, 29, 8, 3, 14, 32, 14) },
]

const TOR_LINEUP = [
  { order: 1, id: 'mlb-624413', name: 'George Springer',   position: 'CF', avg: '.269',
    gameStats:   { atBats: 2, runs: 1, hits: 1, doubles: 0, triples: 0, homeRuns: 1, rbi: 1, walks: 0, strikeOuts: 1, stolenBases: 0, avg: '.500' },
    seasonStats: mkBatterSeason('.269', '.356', '.471', '.827', 81, 249, 67, 17, 48, 52, 11, 2, 6, 58, 36) },
  { order: 2, id: 'mlb-641355', name: 'Bo Bichette',       position: 'SS', avg: '.306',
    gameStats:   { atBats: 2, runs: 0, hits: 1, doubles: 1, triples: 0, homeRuns: 0, rbi: 2, walks: 0, strikeOuts: 0, stolenBases: 0, avg: '.500' },
    seasonStats: mkBatterSeason('.306', '.358', '.486', '.844', 83, 294, 90, 16, 61, 54, 21, 3, 11, 52, 26) },
  { order: 3, id: 'mlb-579323', name: 'Vlad Guerrero Jr.', position: '1B', avg: '.312',
    gameStats:   { atBats: 1, runs: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 1, strikeOuts: 0, stolenBases: 0, avg: '.000' },
    seasonStats: mkBatterSeason('.312', '.382', '.543', '.925', 84, 289, 90, 22, 72, 58, 18, 1, 2, 54, 36) },
  { order: 4, id: 'mlb-592669', name: 'Matt Chapman',      position: '3B', avg: '.258',
    gameStats:   { atBats: 2, runs: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 2, stolenBases: 0, avg: '.000' },
    seasonStats: mkBatterSeason('.258', '.338', '.444', '.782', 79, 264, 68, 16, 51, 44, 14, 1, 3, 71, 32) },
  { order: 5, id: 'mlb-621566', name: 'Daulton Varsho',    position: 'LF', avg: '.231',
    gameStats:   { atBats: 2, runs: 1, hits: 1, doubles: 0, triples: 0, homeRuns: 1, rbi: 1, walks: 0, strikeOuts: 1, stolenBases: 0, avg: '.500' },
    seasonStats: mkBatterSeason('.231', '.306', '.404', '.710', 77, 238, 55, 14, 41, 38, 12, 2, 11, 72, 28) },
  { order: 6, id: 'mlb-642731', name: 'Danny Jansen',      position: 'C',  avg: '.244',
    gameStats:   { atBats: 1, runs: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 1, stolenBases: 0, avg: '.000' },
    seasonStats: mkBatterSeason('.244', '.318', '.401', '.719', 64, 164, 40, 8, 31, 22, 7, 0, 0, 38, 17) },
  { order: 7, id: 'mlb-641645', name: 'Alejandro Kirk',    position: 'DH', avg: '.278',
    gameStats:   { atBats: 1, runs: 1, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 0, stolenBases: 0, avg: '1.000' },
    seasonStats: mkBatterSeason('.278', '.356', '.404', '.760', 76, 209, 58, 9, 41, 34, 11, 0, 0, 28, 28) },
  { order: 8, id: 'mlb-665161', name: 'Davis Schneider',   position: 'RF', avg: '.214',
    gameStats:   { atBats: 2, runs: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 1, stolenBases: 0, avg: '.000' },
    seasonStats: mkBatterSeason('.214', '.289', '.358', '.647', 58, 140, 30, 6, 22, 21, 8, 1, 4, 42, 17) },
  { order: 9, id: 'mlb-672515', name: 'Cavan Biggio',      position: '2B', avg: '.241',
    gameStats:   { atBats: 2, runs: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 1, stolenBases: 0, avg: '.000' },
    seasonStats: mkBatterSeason('.241', '.336', '.379', '.715', 68, 183, 44, 7, 28, 32, 10, 2, 7, 44, 26) },
]

const BAL_LINEUP = [
  { order: 1, id: 'mlb-671277', name: 'Cedric Mullins',    position: 'CF', avg: '.258',
    gameStats:   { atBats: 4, runs: 0, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 1, stolenBases: 0, avg: '.250' },
    seasonStats: mkBatterSeason('.258', '.316', '.408', '.724', 81, 281, 72, 12, 38, 44, 14, 3, 18, 62, 22) },
  { order: 2, id: 'mlb-669257', name: 'Gunnar Henderson',  position: 'SS', avg: '.295',
    gameStats:   { atBats: 3, runs: 1, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 1, strikeOuts: 1, stolenBases: 0, avg: '.333' },
    seasonStats: mkBatterSeason('.295', '.374', '.514', '.888', 83, 278, 82, 21, 58, 61, 18, 4, 9, 58, 38) },
  { order: 3, id: 'mlb-670990', name: 'Adley Rutschman',   position: 'C',  avg: '.281',
    gameStats:   { atBats: 4, runs: 0, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 1, walks: 0, strikeOuts: 0, stolenBases: 0, avg: '.250' },
    seasonStats: mkBatterSeason('.281', '.373', '.446', '.819', 83, 278, 78, 14, 58, 48, 17, 2, 2, 44, 44) },
  { order: 4, id: 'mlb-605141', name: 'Anthony Santander', position: 'RF', avg: '.271',
    gameStats:   { atBats: 4, runs: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 2, stolenBases: 0, avg: '.000' },
    seasonStats: mkBatterSeason('.271', '.332', '.481', '.813', 82, 284, 77, 22, 61, 48, 13, 1, 1, 72, 28) },
  { order: 5, id: 'mlb-669394', name: 'Ryan Mountcastle',  position: '1B', avg: '.249',
    gameStats:   { atBats: 3, runs: 1, hits: 1, doubles: 1, triples: 0, homeRuns: 0, rbi: 0, walks: 1, strikeOuts: 1, stolenBases: 0, avg: '.333' },
    seasonStats: mkBatterSeason('.249', '.304', '.414', '.718', 79, 261, 65, 14, 48, 38, 16, 1, 1, 62, 22) },
  { order: 6, id: 'mlb-641584', name: 'Austin Hays',       position: 'LF', avg: '.244',
    gameStats:   { atBats: 4, runs: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 2, stolenBases: 0, avg: '.000' },
    seasonStats: mkBatterSeason('.244', '.298', '.398', '.696', 74, 234, 57, 11, 36, 32, 12, 2, 4, 52, 16) },
  { order: 7, id: 'mlb-664056', name: 'Jorge Mateo',       position: '2B', avg: '.232',
    gameStats:   { atBats: 3, runs: 0, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 1, walks: 0, strikeOuts: 1, stolenBases: 0, avg: '.333' },
    seasonStats: mkBatterSeason('.232', '.278', '.348', '.626', 68, 198, 46, 6, 26, 32, 8, 4, 22, 48, 12) },
  { order: 8, id: 'mlb-677951', name: 'James McCann',      position: 'DH', avg: '.218',
    gameStats:   { atBats: 3, runs: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 1, stolenBases: 0, avg: '.000' },
    seasonStats: mkBatterSeason('.218', '.271', '.321', '.592', 58, 142, 31, 4, 18, 16, 6, 0, 0, 32, 9) },
  { order: 9, id: 'mlb-596129', name: 'Ramon Urias',       position: '3B', avg: '.226',
    gameStats:   { atBats: 3, runs: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 1, stolenBases: 0, avg: '.000' },
    seasonStats: mkBatterSeason('.226', '.284', '.342', '.626', 62, 177, 40, 5, 22, 22, 9, 1, 2, 38, 14) },
]

const BOS_LINEUP = [
  { order: 1, id: 'mlb-646240', name: 'Jarren Duran',      position: 'CF', avg: '.275',
    gameStats:   { atBats: 4, runs: 2, hits: 2, doubles: 1, triples: 0, homeRuns: 0, rbi: 1, walks: 0, strikeOuts: 1, stolenBases: 1, avg: '.500' },
    seasonStats: mkBatterSeason('.275', '.338', '.441', '.779', 82, 276, 76, 13, 44, 54, 18, 4, 22, 54, 28) },
  { order: 2, id: 'mlb-596117', name: 'Rafael Devers',     position: '3B', avg: '.287',
    gameStats:   { atBats: 4, runs: 1, hits: 2, doubles: 1, triples: 0, homeRuns: 0, rbi: 2, walks: 0, strikeOuts: 1, stolenBases: 0, avg: '.500' },
    seasonStats: mkBatterSeason('.287', '.356', '.512', '.868', 83, 289, 83, 22, 72, 58, 21, 2, 1, 68, 36) },
  { order: 3, id: 'mlb-571740', name: 'J.D. Martinez',     position: 'DH', avg: '.264',
    gameStats:   { atBats: 3, runs: 1, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 1, strikeOuts: 1, stolenBases: 0, avg: '.333' },
    seasonStats: mkBatterSeason('.264', '.338', '.441', '.779', 79, 261, 69, 16, 56, 44, 14, 0, 0, 48, 28) },
  { order: 4, id: 'mlb-657557', name: 'Triston Casas',     position: '1B', avg: '.252',
    gameStats:   { atBats: 4, runs: 0, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 1, walks: 0, strikeOuts: 2, stolenBases: 0, avg: '.250' },
    seasonStats: mkBatterSeason('.252', '.348', '.441', '.789', 77, 238, 60, 15, 52, 42, 11, 1, 0, 66, 38) },
  { order: 5, id: 'mlb-594538', name: 'Adam Duvall',       position: 'LF', avg: '.248',
    gameStats:   { atBats: 3, runs: 1, hits: 1, doubles: 0, triples: 0, homeRuns: 1, rbi: 2, walks: 1, strikeOuts: 1, stolenBases: 0, avg: '.333' },
    seasonStats: mkBatterSeason('.248', '.316', '.456', '.772', 76, 234, 58, 18, 56, 42, 12, 1, 0, 72, 22) },
  { order: 6, id: 'mlb-670032', name: 'Masataka Yoshida',  position: 'RF', avg: '.291',
    gameStats:   { atBats: 4, runs: 1, hits: 2, doubles: 1, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 0, stolenBases: 0, avg: '.500' },
    seasonStats: mkBatterSeason('.291', '.368', '.448', '.816', 81, 268, 78, 12, 52, 48, 18, 2, 2, 38, 38) },
  { order: 7, id: 'mlb-680776', name: 'Connor Wong',       position: 'C',  avg: '.259',
    gameStats:   { atBats: 3, runs: 1, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 1, walks: 1, strikeOuts: 0, stolenBases: 0, avg: '.333' },
    seasonStats: mkBatterSeason('.259', '.316', '.408', '.724', 72, 212, 55, 9, 38, 36, 11, 2, 4, 42, 16) },
  { order: 8, id: 'mlb-641531', name: 'Kiké Hernández',    position: '2B', avg: '.237',
    gameStats:   { atBats: 3, runs: 0, hits: 1, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 1, stolenBases: 0, avg: '.333' },
    seasonStats: mkBatterSeason('.237', '.308', '.374', '.682', 74, 211, 50, 8, 32, 36, 9, 2, 6, 48, 22) },
  { order: 9, id: 'mlb-608700', name: 'Enrique Hernández', position: 'SS', avg: '.224',
    gameStats:   { atBats: 3, runs: 0, hits: 0, doubles: 0, triples: 0, homeRuns: 0, rbi: 0, walks: 0, strikeOuts: 2, stolenBases: 0, avg: '.000' },
    seasonStats: mkBatterSeason('.224', '.282', '.341', '.623', 68, 187, 42, 6, 24, 26, 8, 1, 4, 44, 14) },
]

// ─── Today's games ───────────────────────────────────────────────────────────

const liveGame = {
  gameId: LIVE_GAME_ID,
  league: 'mlb',
  status: 'live',
  scheduleDay: 'today',
  startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
  homeTeam: { id: 'nyy', name: 'Yankees',    abbreviation: 'NYY', record: '58-42' },
  awayTeam: { id: 'tor', name: 'Blue Jays',  abbreviation: 'TOR', record: '51-49' },
  score: { home: 3, away: 4 },
  period: { current: 6, label: 'Top 6th', isTopHalf: true },
  winProbability: { home: 0.38, away: 0.62 },
  winProbabilityTimeline: [
    { period: 1, home: 0.50 },
    { period: 2, home: 0.45 },
    { period: 3, home: 0.52 },
    { period: 4, home: 0.41 },
    { period: 5, home: 0.38 },
  ],
  timeline: [
    { period: 1, periodLabel: '1st', homeScore: 0, awayScore: 2 },
    { period: 2, periodLabel: '2nd', homeScore: 1, awayScore: 0 },
    { period: 3, periodLabel: '3rd', homeScore: 0, awayScore: 1 },
    { period: 4, periodLabel: '4th', homeScore: 2, awayScore: 0 },
    { period: 5, periodLabel: '5th', homeScore: 0, awayScore: 1 },
  ],
  matchup: {
    batter:  { id: 'mlb-579323', name: 'Vlad Guerrero Jr.', avg: '.312', ops: '.902', hrThisSeason: 18 },
    pitcher: { ...GERRIT_COLE },
    count:   { balls: 2, strikes: 1, outs: 1 },
    runners: { first: true, second: false, third: false },
    lastPitch: { type: 'FF', speed: 96, description: 'Ball' },
  },
  lineup: {
    home: NYY_LINEUP,
    away: TOR_LINEUP,
    homePitcher: { ...GERRIT_COLE },
    awayPitcher: { ...KEVIN_GAUSMAN },
    homePitchers: [
      {
        id: GERRIT_COLE.id, name: GERRIT_COLE.name, current: true,
        gameStats: { inningsPitched: '5.0', hits: 7, runs: 4, earnedRuns: 4, walks: 1, strikeOuts: 5, pitchesThrown: 89 },
        seasonStats: { era: GERRIT_COLE.seasonStats.era, wins: GERRIT_COLE.wins, losses: GERRIT_COLE.losses, ip: GERRIT_COLE.ip, whip: GERRIT_COLE.seasonStats.whip },
      },
    ],
    awayPitchers: [
      {
        id: KEVIN_GAUSMAN.id, name: KEVIN_GAUSMAN.name, current: true,
        gameStats: { inningsPitched: '5.0', hits: 5, runs: 3, earnedRuns: 3, walks: 2, strikeOuts: 4, pitchesThrown: 81 },
        seasonStats: { era: KEVIN_GAUSMAN.seasonStats.era, wins: KEVIN_GAUSMAN.wins, losses: KEVIN_GAUSMAN.losses, ip: KEVIN_GAUSMAN.ip, whip: KEVIN_GAUSMAN.seasonStats.whip },
      },
    ],
  },
  lastPlay: 'Vladimir Guerrero Jr. lines out to center field.',
  updatedAt: new Date(now.getTime() - 30 * 1000).toISOString(),
}

const finalGame = {
  gameId: FINAL_GAME_ID,
  league: 'mlb',
  status: 'final',
  scheduleDay: 'today',
  startTime: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
  homeTeam: { id: 'bal', name: 'Orioles',   abbreviation: 'BAL', record: '62-38' },
  awayTeam: { id: 'bos', name: 'Red Sox',   abbreviation: 'BOS', record: '44-56' },
  score: { home: 2, away: 7 },
  period: { current: 9, label: 'Final' },
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
  lineup: {
    home: BAL_LINEUP,
    away: BOS_LINEUP,
    homePitcher: { ...JOHN_MEANS },
    awayPitcher: { ...NICK_PIVETTA },
  },
  boxScore: {
    home: {
      batters: BAL_LINEUP,
      pitchers: [
        {
          id: JOHN_MEANS.id, name: JOHN_MEANS.name, decision: 'L',
          gameStats: { inningsPitched: '4.1', hits: 7, runs: 5, earnedRuns: 5, walks: 2, strikeOuts: 4, pitchesThrown: 82 },
          seasonStats: { era: JOHN_MEANS.seasonStats.era, wins: JOHN_MEANS.wins, losses: JOHN_MEANS.losses + 1, saves: 0, inningsPitched: JOHN_MEANS.ip, whip: JOHN_MEANS.seasonStats.whip },
        },
        {
          id: 'mlb-657568', name: 'Austin Voth', decision: null,
          gameStats: { inningsPitched: '2.2', hits: 3, runs: 2, earnedRuns: 2, walks: 1, strikeOuts: 3, pitchesThrown: 48 },
          seasonStats: { era: '4.76', wins: 2, losses: 3, saves: 0, inningsPitched: '38.0', whip: '1.42' },
        },
        {
          id: 'mlb-669004', name: 'DL Hall', decision: null,
          gameStats: { inningsPitched: '2.0', hits: 0, runs: 0, earnedRuns: 0, walks: 1, strikeOuts: 3, pitchesThrown: 28 },
          seasonStats: { era: '3.18', wins: 1, losses: 2, saves: 0, inningsPitched: '22.2', whip: '1.10' },
        },
      ],
    },
    away: {
      batters: BOS_LINEUP,
      pitchers: [
        {
          id: NICK_PIVETTA.id, name: NICK_PIVETTA.name, decision: 'W',
          gameStats: { inningsPitched: '6.0', hits: 4, runs: 2, earnedRuns: 2, walks: 1, strikeOuts: 7, pitchesThrown: 94 },
          seasonStats: { era: NICK_PIVETTA.seasonStats.era, wins: NICK_PIVETTA.wins + 1, losses: NICK_PIVETTA.losses, saves: 0, inningsPitched: NICK_PIVETTA.ip, whip: NICK_PIVETTA.seasonStats.whip },
        },
        {
          id: 'mlb-680735', name: 'Brennan Bernardino', decision: null,
          gameStats: { inningsPitched: '1.0', hits: 0, runs: 0, earnedRuns: 0, walks: 0, strikeOuts: 1, pitchesThrown: 14 },
          seasonStats: { era: '2.89', wins: 1, losses: 0, saves: 0, inningsPitched: '28.0', whip: '1.07' },
        },
        {
          id: 'mlb-608700', name: 'Garrett Whitlock', decision: null,
          gameStats: { inningsPitched: '1.0', hits: 1, runs: 0, earnedRuns: 0, walks: 1, strikeOuts: 1, pitchesThrown: 18 },
          seasonStats: { era: '3.24', wins: 3, losses: 2, saves: 2, inningsPitched: '41.2', whip: '1.18' },
        },
        {
          id: KENLEY_JANSEN.id, name: KENLEY_JANSEN.name, decision: 'S',
          gameStats: { inningsPitched: '1.0', hits: 0, runs: 0, earnedRuns: 0, walks: 0, strikeOuts: 1, pitchesThrown: 11 },
          seasonStats: { era: KENLEY_JANSEN.seasonStats.era, wins: KENLEY_JANSEN.wins, losses: KENLEY_JANSEN.losses, saves: 18, inningsPitched: KENLEY_JANSEN.ip, whip: KENLEY_JANSEN.seasonStats.whip },
        },
      ],
    },
    decisions: {
      winner: { id: NICK_PIVETTA.id,  name: NICK_PIVETTA.name,  record: `${NICK_PIVETTA.wins + 1}-${NICK_PIVETTA.losses}`,  era: NICK_PIVETTA.seasonStats.era },
      loser:  { id: JOHN_MEANS.id,    name: JOHN_MEANS.name,    record: `${JOHN_MEANS.wins}-${JOHN_MEANS.losses + 1}`,       era: JOHN_MEANS.seasonStats.era },
      save:   { id: KENLEY_JANSEN.id, name: KENLEY_JANSEN.name, record: `${KENLEY_JANSEN.wins}-${KENLEY_JANSEN.losses}`,     era: KENLEY_JANSEN.seasonStats.era },
    },
    gameInfo: { duration: '3:12', attendance: '45,218', hpUmpire: 'Lance Barksdale' },
  },
  updatedAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
}

const scheduledGame = {
  gameId: SCHEDULED_GAME_ID,
  league: 'mlb',
  status: 'scheduled',
  scheduleDay: 'today',
  startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
  homeTeam: { id: 'sf',  name: 'Giants',   abbreviation: 'SF',  record: '47-53' },
  awayTeam: { id: 'lad', name: 'Dodgers',  abbreviation: 'LAD', record: '71-29' },
  score: { home: 0, away: 0 },
  period: { current: 0, label: 'Scheduled' },
  timeline: [],
  probablePitchers: {
    home: { ...LOGAN_WEBB },
    away: { ...TYLER_GLASNOW },
  },
  updatedAt: now.toISOString(),
}

const delayedGame = {
  gameId: DELAYED_GAME_ID,
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
}

// ─── Yesterday's games (final) ───────────────────────────────────────────────

const PHI_LINEUP = [
  { order: 1, id: 'mlb-596748', name: 'Kyle Schwarber',        position: 'LF', avg: '.243' },
  { order: 2, id: 'mlb-543807', name: 'Trea Turner',           position: 'SS', avg: '.271' },
  { order: 3, id: 'mlb-571448', name: 'Bryce Harper',          position: '1B', avg: '.298' },
  { order: 4, id: 'mlb-608566', name: 'Alec Bohm',             position: '3B', avg: '.282' },
  { order: 5, id: 'mlb-641313', name: 'Nick Castellanos',      position: 'RF', avg: '.253' },
  { order: 6, id: 'mlb-666176', name: 'J.T. Realmuto',         position: 'C',  avg: '.267' },
  { order: 7, id: 'mlb-592518', name: 'Bryson Stott',          position: '2B', avg: '.255' },
  { order: 8, id: 'mlb-665742', name: 'Brandon Marsh',         position: 'CF', avg: '.239' },
  { order: 9, id: 'mlb-680757', name: 'Cristian Pache',        position: 'DH', avg: '.219' },
]

const ATL_LINEUP = [
  { order: 1, id: 'mlb-621439', name: 'Ronald Acuña Jr.',      position: 'RF', avg: '.337' },
  { order: 2, id: 'mlb-596115', name: 'Ozzie Albies',          position: '2B', avg: '.268' },
  { order: 3, id: 'mlb-543807', name: 'Austin Riley',          position: '3B', avg: '.276' },
  { order: 4, id: 'mlb-596059', name: 'Matt Olson',            position: '1B', avg: '.274' },
  { order: 5, id: 'mlb-669394', name: 'Michael Harris II',     position: 'CF', avg: '.261' },
  { order: 6, id: 'mlb-553869', name: 'Sean Murphy',           position: 'C',  avg: '.253' },
  { order: 7, id: 'mlb-621549', name: 'Marcell Ozuna',         position: 'DH', avg: '.257' },
  { order: 8, id: 'mlb-680757', name: 'Eddie Rosario',         position: 'LF', avg: '.231' },
  { order: 9, id: 'mlb-592518', name: 'Orlando Arcia',         position: 'SS', avg: '.241' },
]

const yesterdayGame1 = {
  gameId: 'mlb-2024-y01',
  league: 'mlb',
  status: 'final',
  scheduleDay: 'yesterday',
  startTime: new Date(now.getTime() - 26 * 60 * 60 * 1000).toISOString(),
  homeTeam: { id: 'phi', name: 'Phillies', abbreviation: 'PHI', record: '62-38' },
  awayTeam: { id: 'atl', name: 'Braves',   abbreviation: 'ATL', record: '66-34' },
  score: { home: 5, away: 3 },
  period: { current: 9, label: 'Final' },
  timeline: [
    { period: 1, periodLabel: '1st', homeScore: 2, awayScore: 0 },
    { period: 2, periodLabel: '2nd', homeScore: 0, awayScore: 1 },
    { period: 3, periodLabel: '3rd', homeScore: 0, awayScore: 0 },
    { period: 4, periodLabel: '4th', homeScore: 1, awayScore: 2 },
    { period: 5, periodLabel: '5th', homeScore: 0, awayScore: 0 },
    { period: 6, periodLabel: '6th', homeScore: 2, awayScore: 0 },
    { period: 7, periodLabel: '7th', homeScore: 0, awayScore: 0 },
    { period: 8, periodLabel: '8th', homeScore: 0, awayScore: 0 },
    { period: 9, periodLabel: '9th', homeScore: 0, awayScore: 0 },
  ],
  lineup: {
    home: PHI_LINEUP,
    away: ATL_LINEUP,
    homePitcher: { ...ZACK_WHEELER },
    awayPitcher: { ...KODAI_SENGA },
  },
  updatedAt: new Date(now.getTime() - 22 * 60 * 60 * 1000).toISOString(),
}

const yesterdayGame2 = {
  gameId: 'mlb-2024-y02',
  league: 'mlb',
  status: 'final',
  scheduleDay: 'yesterday',
  startTime: new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString(),
  homeTeam: { id: 'hou', name: 'Astros', abbreviation: 'HOU', record: '57-43' },
  awayTeam: { id: 'sea', name: 'Mariners', abbreviation: 'SEA', record: '52-48' },
  score: { home: 4, away: 6 },
  period: { current: 9, label: 'Final' },
  timeline: [
    { period: 1, periodLabel: '1st', homeScore: 1, awayScore: 2 },
    { period: 2, periodLabel: '2nd', homeScore: 0, awayScore: 1 },
    { period: 3, periodLabel: '3rd', homeScore: 2, awayScore: 0 },
    { period: 4, periodLabel: '4th', homeScore: 0, awayScore: 1 },
    { period: 5, periodLabel: '5th', homeScore: 0, awayScore: 2 },
    { period: 6, periodLabel: '6th', homeScore: 1, awayScore: 0 },
    { period: 7, periodLabel: '7th', homeScore: 0, awayScore: 0 },
    { period: 8, periodLabel: '8th', homeScore: 0, awayScore: 0 },
    { period: 9, periodLabel: '9th', homeScore: 0, awayScore: 0 },
  ],
  lineup: {
    home: [
      { order: 1, id: 'mlb-664702', name: 'Jose Altuve',     position: '2B', avg: '.306' },
      { order: 2, id: 'mlb-608324', name: 'Alex Bregman',    position: '3B', avg: '.259' },
      { order: 3, id: 'mlb-514888', name: 'Yordan Alvarez',  position: 'DH', avg: '.312' },
      { order: 4, id: 'mlb-543333', name: 'Kyle Tucker',     position: 'RF', avg: '.284' },
      { order: 5, id: 'mlb-553882', name: 'Jeremy Peña',     position: 'SS', avg: '.254' },
      { order: 6, id: 'mlb-680869', name: 'Yainer Diaz',     position: 'C',  avg: '.271' },
      { order: 7, id: 'mlb-668715', name: 'Mauricio Dubón',  position: 'CF', avg: '.238' },
      { order: 8, id: 'mlb-596748', name: 'Jon Singleton',   position: '1B', avg: '.219' },
      { order: 9, id: 'mlb-641531', name: 'Corey Julks',     position: 'LF', avg: '.241' },
    ],
    away: [
      { order: 1, id: 'mlb-608369', name: 'Julio Rodríguez', position: 'CF', avg: '.279' },
      { order: 2, id: 'mlb-668731', name: 'Cal Raleigh',     position: 'C',  avg: '.243' },
      { order: 3, id: 'mlb-657557', name: 'Teoscar Hernández', position: 'RF', avg: '.261' },
      { order: 4, id: 'mlb-596019', name: 'Eugenio Suárez',  position: '3B', avg: '.236' },
      { order: 5, id: 'mlb-669257', name: 'Ty France',       position: '1B', avg: '.256' },
      { order: 6, id: 'mlb-670990', name: 'AJ Pollock',      position: 'LF', avg: '.228' },
      { order: 7, id: 'mlb-605141', name: 'Sam Haggerty',    position: '2B', avg: '.221' },
      { order: 8, id: 'mlb-641584', name: 'Dylan Moore',     position: 'SS', avg: '.214' },
      { order: 9, id: 'mlb-664056', name: 'Abraham Toro',    position: 'DH', avg: '.218' },
    ],
    homePitcher: { ...FRAMBER_VALDEZ },
    awayPitcher: { ...LOGAN_GILBERT },
  },
  updatedAt: new Date(now.getTime() - 21 * 60 * 60 * 1000).toISOString(),
}

// ─── Tomorrow's games (scheduled) ───────────────────────────────────────────

const tomorrowGame1 = {
  gameId: 'mlb-2024-t01',
  league: 'mlb',
  status: 'scheduled',
  scheduleDay: 'tomorrow',
  startTime: new Date(now.getTime() + 20 * 60 * 60 * 1000).toISOString(),
  homeTeam: { id: 'hou', name: 'Astros',   abbreviation: 'HOU', record: '57-43' },
  awayTeam: { id: 'sea', name: 'Mariners', abbreviation: 'SEA', record: '52-48' },
  score: { home: 0, away: 0 },
  period: { current: 0, label: 'Scheduled' },
  timeline: [],
  probablePitchers: {
    home: { ...FRAMBER_VALDEZ },
    away: { ...LOGAN_GILBERT },
  },
  updatedAt: now.toISOString(),
}

const tomorrowGame2 = {
  gameId: 'mlb-2024-t02',
  league: 'mlb',
  status: 'scheduled',
  scheduleDay: 'tomorrow',
  startTime: new Date(now.getTime() + 22 * 60 * 60 * 1000).toISOString(),
  homeTeam: { id: 'phi', name: 'Phillies', abbreviation: 'PHI', record: '62-38' },
  awayTeam: { id: 'nym', name: 'Mets',     abbreviation: 'NYM', record: '55-45' },
  score: { home: 0, away: 0 },
  period: { current: 0, label: 'Scheduled' },
  timeline: [],
  probablePitchers: {
    home: { ...ZACK_WHEELER },
    away: { ...KODAI_SENGA },
  },
  updatedAt: now.toISOString(),
}

// ─── NHL mock games ───────────────────────────────────────────────────────────

import { mockNhlGames } from './nhl-games.js'

const nhlToday = mockNhlGames.filter((g) => g.scheduleDay === 'today')

// ─── Exports ─────────────────────────────────────────────────────────────────

const todayGames      = [liveGame, finalGame, scheduledGame, delayedGame, ...nhlToday]
const yesterdayGames  = [yesterdayGame1, yesterdayGame2]
const tomorrowGames   = [tomorrowGame1, tomorrowGame2]

export const mockGames = todayGames

export const mockGamesByDay = {
  yesterday: yesterdayGames,
  today:     todayGames,
  tomorrow:  tomorrowGames,
}
