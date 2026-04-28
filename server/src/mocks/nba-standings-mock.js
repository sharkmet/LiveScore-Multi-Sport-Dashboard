/**
 * NBA standings mock data — 2025-26 Regular Season.
 * Activated when USE_MOCK_DATA=true or when the real API is unreachable.
 */

function team(id, name, abbr, div, conf, wins, losses, ppg, opp, ps) {
  const gp   = wins + losses
  const diff = (ppg - opp).toFixed(1)
  return {
    teamId:        id,
    teamName:      name,
    abbreviation:  abbr,
    gamesPlayed:   gp,
    wins,
    losses,
    otLosses:      null,
    points:        wins,
    pct:           gp > 0 ? (wins / gp).toFixed(3).replace(/^0/, '') : '.000',
    gf:            ppg.toFixed(1),
    ga:            opp.toFixed(1),
    diff:          parseFloat(diff) >= 0 ? `+${diff}` : diff,
    divisionRank:  0,
    divisionName:  div,
    conference:    conf,
    clinchIndicator: null,
    playoffStatus: ps,
    streak:        null,
    homeRecord:    null,
    awayRecord:    null,
  }
}

const EAST_DIVS = {
  Atlantic: [
    team('bos', 'Boston Celtics',         'BOS', 'Atlantic',  'East', 61, 19, 120.1, 109.4, 'in'),
    team('nyk', 'New York Knicks',         'NYK', 'Atlantic',  'East', 49, 31, 112.8, 108.3, 'in'),
    team('phi', 'Philadelphia 76ers',      'PHI', 'Atlantic',  'East', 42, 38, 114.6, 115.0, 'bubble'),
    team('bkn', 'Brooklyn Nets',           'BKN', 'Atlantic',  'East', 28, 52, 108.9, 117.4, 'out'),
    team('tor', 'Toronto Raptors',         'TOR', 'Atlantic',  'East', 24, 56, 109.2, 119.1, 'out'),
  ],
  Central: [
    team('mil', 'Milwaukee Bucks',         'MIL', 'Central',   'East', 50, 30, 115.4, 111.8, 'in'),
    team('cle', 'Cleveland Cavaliers',     'CLE', 'Central',   'East', 53, 27, 113.5, 106.2, 'in'),
    team('ind', 'Indiana Pacers',          'IND', 'Central',   'East', 46, 34, 119.5, 117.1, 'in'),
    team('chi', 'Chicago Bulls',           'CHI', 'Central',   'East', 38, 42, 112.1, 114.7, 'bubble'),
    team('det', 'Detroit Pistons',         'DET', 'Central',   'East', 31, 49, 111.3, 117.6, 'out'),
  ],
  Southeast: [
    team('mia', 'Miami Heat',              'MIA', 'Southeast', 'East', 43, 37, 110.8, 110.2, 'in'),
    team('orl', 'Orlando Magic',           'ORL', 'Southeast', 'East', 44, 36, 108.9, 106.8, 'in'),
    team('atl', 'Atlanta Hawks',           'ATL', 'Southeast', 'East', 35, 45, 116.8, 118.4, 'out'),
    team('cha', 'Charlotte Hornets',       'CHA', 'Southeast', 'East', 29, 51, 111.4, 119.0, 'out'),
    team('was', 'Washington Wizards',      'WAS', 'Southeast', 'East', 18, 62, 106.3, 121.5, 'out'),
  ],
}

const WEST_DIVS = {
  Northwest: [
    team('den', 'Denver Nuggets',          'DEN', 'Northwest', 'West', 56, 24, 117.8, 111.0, 'in'),
    team('okc', 'Oklahoma City Thunder',   'OKC', 'Northwest', 'West', 62, 18, 116.9, 106.3, 'in'),
    team('min', 'Minnesota Timberwolves',  'MIN', 'Northwest', 'West', 49, 31, 112.7, 107.9, 'in'),
    team('uta', 'Utah Jazz',               'UTA', 'Northwest', 'West', 22, 58, 108.2, 119.8, 'out'),
    team('por', 'Portland Trail Blazers',  'POR', 'Northwest', 'West', 20, 60, 107.1, 120.4, 'out'),
  ],
  Pacific: [
    team('lal', 'Los Angeles Lakers',      'LAL', 'Pacific',   'West', 46, 34, 114.2, 112.8, 'in'),
    team('gsw', 'Golden State Warriors',   'GSW', 'Pacific',   'West', 43, 37, 115.3, 114.1, 'in'),
    team('phx', 'Phoenix Suns',            'PHX', 'Pacific',   'West', 44, 36, 116.7, 115.2, 'in'),
    team('sac', 'Sacramento Kings',        'SAC', 'Pacific',   'West', 40, 40, 118.1, 118.6, 'bubble'),
    team('lac', 'Los Angeles Clippers',    'LAC', 'Pacific',   'West', 39, 41, 113.5, 114.0, 'bubble'),
  ],
  Southwest: [
    team('sas', 'San Antonio Spurs',       'SAS', 'Southwest', 'West', 31, 49, 112.8, 118.3, 'out'),
    team('dal', 'Dallas Mavericks',        'DAL', 'Southwest', 'West', 47, 33, 118.4, 115.0, 'in'),
    team('hou', 'Houston Rockets',         'HOU', 'Southwest', 'West', 48, 32, 114.1, 111.7, 'in'),
    team('mem', 'Memphis Grizzlies',       'MEM', 'Southwest', 'West', 37, 43, 113.4, 115.5, 'bubble'),
    team('nop', 'New Orleans Pelicans',    'NOP', 'Southwest', 'West', 32, 48, 111.6, 116.9, 'out'),
  ],
}

// Sort each division by wins desc
for (const divTeams of Object.values({ ...EAST_DIVS, ...WEST_DIVS })) {
  divTeams.sort((a, b) => b.wins - a.wins || a.losses - b.losses)
  divTeams.forEach((t, i) => { t.divisionRank = i + 1 })
}

export const NBA_STANDINGS_MOCK = {
  divisions: { ...EAST_DIVS, ...WEST_DIVS },
  columns: ['W', 'L', 'PCT', 'PPG', 'OPP', 'DIFF'],
  playoffSpotsPerConference: 6,
  playInSpotsPerConference:  4,
}
