/**
 * NHL playoff bracket mock data — 2025 Stanley Cup Playoffs
 * Activated when USE_MOCK_DATA=true or when the real API is unreachable.
 * Mix of complete, in_progress, and upcoming series.
 */

const SEASON = 2025

function series(id, conf, bestOf, status, high, low, hw, lw, winner = null) {
  return {
    id,
    roundId: id.split('-').slice(0, -1).join('-'),  // e.g. 'nhl-r1-E1' → 'nhl-r1-E'... actually let's set roundId separately
    conference: conf,
    bestOf,
    status,
    highSeed:     high,
    lowSeed:      low,
    highSeedWins: hw,
    lowSeedWins:  lw,
    winnerTeamId: winner,
    games:        [],
    nextGame:     null,
  }
}

function team(id, name, abbr, seed, record) {
  return { id, name, abbreviation: abbr, seed, record }
}

export const NHL_PLAYOFFS_MOCK = {
  league:      'nhl',
  season:      SEASON,
  lastUpdated: new Date().toISOString(),
  rounds: [
    {
      id:    'nhl-r1',
      name:  'First Round',
      order: 1,
      series: [
        // ── Eastern Conference ───────────────────────────────────────────────
        {
          ...series(
            'nhl-r1-E1', 'East', 7, 'in_progress',
            team('FLA', 'Florida Panthers',      'FLA', 1, '58-18-6'),
            team('BOS', 'Boston Bruins',          'BOS', 8, '38-36-8'),
            3, 1
          ),
          roundId: 'nhl-r1',
        },
        {
          ...series(
            'nhl-r1-E2', 'East', 7, 'in_progress',
            team('TOR', 'Toronto Maple Leafs',   'TOR', 2, '51-24-7'),
            team('OTT', 'Ottawa Senators',        'OTT', 7, '40-34-8'),
            2, 1
          ),
          roundId: 'nhl-r1',
        },
        {
          ...series(
            'nhl-r1-E3', 'East', 7, 'in_progress',
            team('CAR', 'Carolina Hurricanes',   'CAR', 3, '50-25-7'),
            team('WSH', 'Washington Capitals',   'WSH', 6, '42-31-9'),
            2, 2
          ),
          roundId: 'nhl-r1',
        },
        {
          ...series(
            'nhl-r1-E4', 'East', 7, 'complete',
            team('NYR', 'New York Rangers',      'NYR', 4, '47-28-7'),
            team('PHI', 'Philadelphia Flyers',   'PHI', 5, '44-31-7'),
            4, 1, 'NYR'
          ),
          roundId: 'nhl-r1',
        },
        // ── Western Conference ───────────────────────────────────────────────
        {
          ...series(
            'nhl-r1-W1', 'West', 7, 'in_progress',
            team('VGK', 'Vegas Golden Knights',  'VGK', 1, '57-20-5'),
            team('STL', 'St. Louis Blues',        'STL', 8, '37-38-7'),
            3, 2
          ),
          roundId: 'nhl-r1',
        },
        {
          ...series(
            'nhl-r1-W2', 'West', 7, 'complete',
            team('EDM', 'Edmonton Oilers',       'EDM', 2, '52-22-8'),
            team('LAK', 'Los Angeles Kings',     'LAK', 7, '40-33-9'),
            4, 1, 'EDM'
          ),
          roundId: 'nhl-r1',
        },
        {
          ...series(
            'nhl-r1-W3', 'West', 7, 'in_progress',
            team('DAL', 'Dallas Stars',           'DAL', 3, '51-24-7'),
            team('COL', 'Colorado Avalanche',     'COL', 6, '43-30-9'),
            2, 1
          ),
          roundId: 'nhl-r1',
        },
        {
          ...series(
            'nhl-r1-W4', 'West', 7, 'upcoming',
            team('WPG', 'Winnipeg Jets',          'WPG', 4, '48-28-6'),
            team('NSH', 'Nashville Predators',    'NSH', 5, '44-31-7'),
            0, 0
          ),
          roundId: 'nhl-r1',
        },
      ],
    },
    {
      id:    'nhl-r2',
      name:  'Second Round',
      order: 2,
      series: [
        { id: 'nhl-r2-E1', roundId: 'nhl-r2', conference: 'East', bestOf: 7, status: 'upcoming', highSeed: null, lowSeed: null, highSeedWins: 0, lowSeedWins: 0, winnerTeamId: null, games: [], nextGame: null },
        { id: 'nhl-r2-E2', roundId: 'nhl-r2', conference: 'East', bestOf: 7, status: 'upcoming', highSeed: null, lowSeed: null, highSeedWins: 0, lowSeedWins: 0, winnerTeamId: null, games: [], nextGame: null },
        { id: 'nhl-r2-W1', roundId: 'nhl-r2', conference: 'West', bestOf: 7, status: 'upcoming', highSeed: null, lowSeed: null, highSeedWins: 0, lowSeedWins: 0, winnerTeamId: null, games: [], nextGame: null },
        { id: 'nhl-r2-W2', roundId: 'nhl-r2', conference: 'West', bestOf: 7, status: 'upcoming', highSeed: null, lowSeed: null, highSeedWins: 0, lowSeedWins: 0, winnerTeamId: null, games: [], nextGame: null },
      ],
    },
    {
      id:    'nhl-cf',
      name:  'Conference Finals',
      order: 3,
      series: [
        { id: 'nhl-cf-E', roundId: 'nhl-cf', conference: 'East', bestOf: 7, status: 'upcoming', highSeed: null, lowSeed: null, highSeedWins: 0, lowSeedWins: 0, winnerTeamId: null, games: [], nextGame: null },
        { id: 'nhl-cf-W', roundId: 'nhl-cf', conference: 'West', bestOf: 7, status: 'upcoming', highSeed: null, lowSeed: null, highSeedWins: 0, lowSeedWins: 0, winnerTeamId: null, games: [], nextGame: null },
      ],
    },
    {
      id:    'nhl-scf',
      name:  'Stanley Cup Final',
      order: 4,
      series: [
        { id: 'nhl-scf-1', roundId: 'nhl-scf', conference: null, bestOf: 7, status: 'upcoming', highSeed: null, lowSeed: null, highSeedWins: 0, lowSeedWins: 0, winnerTeamId: null, games: [], nextGame: null },
      ],
    },
  ],
}
