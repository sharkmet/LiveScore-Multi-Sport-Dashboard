/**
 * MLB playoff bracket mock data — 2025 MLB Postseason
 * Activated when USE_MOCK_DATA=true or when the real API is unreachable.
 * MLB format: Wild Card (best-of-3) → Division Series (best-of-5) → LCS (best-of-7) → WS (best-of-7)
 * Seeds 1 & 2 in each league receive a bye through the Wild Card round.
 */

const SEASON = 2025

function team(id, name, abbr, seed, record) {
  return { id, name, abbreviation: abbr, seed, record }
}

function tbdSeries(id, roundId, conf, bestOf = 7) {
  return { id, roundId, conference: conf, bestOf, status: 'upcoming', highSeed: null, lowSeed: null, highSeedWins: 0, lowSeedWins: 0, winnerTeamId: null, games: [], nextGame: null }
}

export const MLB_PLAYOFFS_MOCK = {
  league:      'mlb',
  season:      SEASON,
  lastUpdated: new Date().toISOString(),
  rounds: [
    // ── Wild Card (seeds 3–6 per league; 1 & 2 get a bye) ────────────────────
    {
      id:    'mlb-wc',
      name:  'Wild Card',
      order: 1,
      series: [
        // AL
        {
          id: 'mlb-wc-AL1', roundId: 'mlb-wc', conference: 'AL', bestOf: 3,
          status: 'complete',
          highSeed: team('BAL', 'Baltimore Orioles',   'BAL', 3, '93-69'),
          lowSeed:  team('CLE', 'Cleveland Guardians', 'CLE', 6, '82-80'),
          highSeedWins: 2, lowSeedWins: 0, winnerTeamId: 'BAL', games: [], nextGame: null,
        },
        {
          id: 'mlb-wc-AL2', roundId: 'mlb-wc', conference: 'AL', bestOf: 3,
          status: 'complete',
          highSeed: team('HOU', 'Houston Astros',      'HOU', 4, '88-74'),
          lowSeed:  team('SEA', 'Seattle Mariners',    'SEA', 5, '85-77'),
          highSeedWins: 2, lowSeedWins: 1, winnerTeamId: 'HOU', games: [], nextGame: null,
        },
        // NL
        {
          id: 'mlb-wc-NL1', roundId: 'mlb-wc', conference: 'NL', bestOf: 3,
          status: 'complete',
          highSeed: team('MIL', 'Milwaukee Brewers',        'MIL', 3, '89-73'),
          lowSeed:  team('ARI', 'Arizona Diamondbacks',     'ARI', 6, '82-80'),
          highSeedWins: 2, lowSeedWins: 1, winnerTeamId: 'MIL', games: [], nextGame: null,
        },
        {
          id: 'mlb-wc-NL2', roundId: 'mlb-wc', conference: 'NL', bestOf: 3,
          status: 'complete',
          highSeed: team('SFG', 'San Francisco Giants',    'SFG', 4, '85-77'),
          lowSeed:  team('SDP', 'San Diego Padres',         'SDP', 5, '83-79'),
          highSeedWins: 2, lowSeedWins: 0, winnerTeamId: 'SFG', games: [], nextGame: null,
        },
      ],
    },
    // ── Division Series ───────────────────────────────────────────────────────
    {
      id:    'mlb-ds',
      name:  'Division Series',
      order: 2,
      series: [
        {
          id: 'mlb-ds-AL1', roundId: 'mlb-ds', conference: 'AL', bestOf: 5,
          status: 'in_progress',
          highSeed: team('NYY', 'New York Yankees',    'NYY', 1, '99-63'),
          lowSeed:  team('BAL', 'Baltimore Orioles',   'BAL', 3, '93-69'),
          highSeedWins: 2, lowSeedWins: 1, winnerTeamId: null, games: [], nextGame: null,
        },
        {
          id: 'mlb-ds-AL2', roundId: 'mlb-ds', conference: 'AL', bestOf: 5,
          status: 'in_progress',
          highSeed: team('TEX', 'Texas Rangers',       'TEX', 2, '95-67'),
          lowSeed:  team('HOU', 'Houston Astros',      'HOU', 4, '88-74'),
          highSeedWins: 3, lowSeedWins: 1, winnerTeamId: null, games: [], nextGame: null,
        },
        {
          id: 'mlb-ds-NL1', roundId: 'mlb-ds', conference: 'NL', bestOf: 5,
          status: 'in_progress',
          highSeed: team('ATL', 'Atlanta Braves',      'ATL', 1, '104-58'),
          lowSeed:  team('MIL', 'Milwaukee Brewers',   'MIL', 3, '89-73'),
          highSeedWins: 2, lowSeedWins: 0, winnerTeamId: null, games: [], nextGame: null,
        },
        {
          id: 'mlb-ds-NL2', roundId: 'mlb-ds', conference: 'NL', bestOf: 5,
          status: 'in_progress',
          highSeed: team('LAD', 'Los Angeles Dodgers', 'LAD', 2, '100-62'),
          lowSeed:  team('SFG', 'San Francisco Giants','SFG', 4, '85-77'),
          highSeedWins: 3, lowSeedWins: 2, winnerTeamId: null, games: [], nextGame: null,
        },
      ],
    },
    // ── League Championship Series ────────────────────────────────────────────
    {
      id:    'mlb-lcs',
      name:  'League Championship Series',
      order: 3,
      series: [
        tbdSeries('mlb-lcs-AL', 'mlb-lcs', 'AL'),
        tbdSeries('mlb-lcs-NL', 'mlb-lcs', 'NL'),
      ],
    },
    // ── World Series ──────────────────────────────────────────────────────────
    {
      id:    'mlb-ws',
      name:  'World Series',
      order: 4,
      series: [
        tbdSeries('mlb-ws-1', 'mlb-ws', null),
      ],
    },
  ],
}
