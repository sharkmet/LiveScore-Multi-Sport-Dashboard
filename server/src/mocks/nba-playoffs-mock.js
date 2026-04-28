/**
 * NBA playoff bracket mock data — 2025 NBA Playoffs
 * Activated when USE_MOCK_DATA=true or when the real API is unreachable.
 */

const SEASON = 2025

function team(id, name, abbr, seed, record) {
  return { id, name, abbreviation: abbr, seed, record }
}

function tbdSeries(id, roundId, conf) {
  return { id, roundId, conference: conf, bestOf: 7, status: 'upcoming', highSeed: null, lowSeed: null, highSeedWins: 0, lowSeedWins: 0, winnerTeamId: null, games: [], nextGame: null }
}

export const NBA_PLAYOFFS_MOCK = {
  league:      'nba',
  season:      SEASON,
  lastUpdated: new Date().toISOString(),
  rounds: [
    {
      id:    'nba-r1',
      name:  'First Round',
      order: 1,
      series: [
        // ── Eastern Conference ───────────────────────────────────────────────
        {
          id: 'nba-r1-E1', roundId: 'nba-r1', conference: 'East', bestOf: 7,
          status: 'complete',
          highSeed: team('BOS', 'Boston Celtics',         'BOS', 1, '64-18'),
          lowSeed:  team('MIA', 'Miami Heat',              'MIA', 8, '46-36'),
          highSeedWins: 4, lowSeedWins: 1, winnerTeamId: 'BOS', games: [], nextGame: null,
        },
        {
          id: 'nba-r1-E2', roundId: 'nba-r1', conference: 'East', bestOf: 7,
          status: 'in_progress',
          highSeed: team('NYK', 'New York Knicks',        'NYK', 2, '51-31'),
          lowSeed:  team('CHI', 'Chicago Bulls',           'CHI', 7, '39-43'),
          highSeedWins: 2, lowSeedWins: 2, winnerTeamId: null, games: [], nextGame: null,
        },
        {
          id: 'nba-r1-E3', roundId: 'nba-r1', conference: 'East', bestOf: 7,
          status: 'in_progress',
          highSeed: team('MIL', 'Milwaukee Bucks',        'MIL', 3, '49-33'),
          lowSeed:  team('PHI', 'Philadelphia 76ers',     'PHI', 6, '42-40'),
          highSeedWins: 3, lowSeedWins: 1, winnerTeamId: null, games: [], nextGame: null,
        },
        {
          id: 'nba-r1-E4', roundId: 'nba-r1', conference: 'East', bestOf: 7,
          status: 'upcoming',
          highSeed: team('CLE', 'Cleveland Cavaliers',   'CLE', 4, '48-34'),
          lowSeed:  team('ORL', 'Orlando Magic',          'ORL', 5, '47-35'),
          highSeedWins: 0, lowSeedWins: 0, winnerTeamId: null, games: [], nextGame: null,
        },
        // ── Western Conference ───────────────────────────────────────────────
        {
          id: 'nba-r1-W1', roundId: 'nba-r1', conference: 'West', bestOf: 7,
          status: 'in_progress',
          highSeed: team('OKC', 'Oklahoma City Thunder',  'OKC', 1, '57-25'),
          lowSeed:  team('NOP', 'New Orleans Pelicans',   'NOP', 8, '40-42'),
          highSeedWins: 3, lowSeedWins: 0, winnerTeamId: null, games: [], nextGame: null,
        },
        {
          id: 'nba-r1-W2', roundId: 'nba-r1', conference: 'West', bestOf: 7,
          status: 'complete',
          highSeed: team('DEN', 'Denver Nuggets',         'DEN', 2, '55-27'),
          lowSeed:  team('UTA', 'Utah Jazz',               'UTA', 7, '31-51'),
          highSeedWins: 4, lowSeedWins: 2, winnerTeamId: 'DEN', games: [], nextGame: null,
        },
        {
          id: 'nba-r1-W3', roundId: 'nba-r1', conference: 'West', bestOf: 7,
          status: 'in_progress',
          highSeed: team('MIN', 'Minnesota Timberwolves', 'MIN', 3, '53-29'),
          lowSeed:  team('GSW', 'Golden State Warriors',  'GSW', 6, '46-36'),
          highSeedWins: 2, lowSeedWins: 1, winnerTeamId: null, games: [], nextGame: null,
        },
        {
          id: 'nba-r1-W4', roundId: 'nba-r1', conference: 'West', bestOf: 7,
          status: 'upcoming',
          highSeed: team('LAC', 'LA Clippers',            'LAC', 4, '51-31'),
          lowSeed:  team('DAL', 'Dallas Mavericks',       'DAL', 5, '49-33'),
          highSeedWins: 0, lowSeedWins: 0, winnerTeamId: null, games: [], nextGame: null,
        },
      ],
    },
    {
      id:    'nba-r2',
      name:  'Conference Semifinals',
      order: 2,
      series: [
        tbdSeries('nba-r2-E1', 'nba-r2', 'East'),
        tbdSeries('nba-r2-E2', 'nba-r2', 'East'),
        tbdSeries('nba-r2-W1', 'nba-r2', 'West'),
        tbdSeries('nba-r2-W2', 'nba-r2', 'West'),
      ],
    },
    {
      id:    'nba-cf',
      name:  'Conference Finals',
      order: 3,
      series: [
        tbdSeries('nba-cf-E', 'nba-cf', 'East'),
        tbdSeries('nba-cf-W', 'nba-cf', 'West'),
      ],
    },
    {
      id:    'nba-finals',
      name:  'NBA Finals',
      order: 4,
      series: [
        tbdSeries('nba-finals-1', 'nba-finals', null),
      ],
    },
  ],
}
