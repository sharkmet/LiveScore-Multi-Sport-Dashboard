/**
 * Mock standings data for MLB and NHL.
 * Shape mirrors what a real standings API would return after normalization.
 */

export const MLB_STANDINGS = [
  {
    conference: 'American League',
    divisions: [
      {
        name: 'AL East',
        teams: [
          { abbreviation: 'BAL', name: 'Baltimore Orioles',  w: 89, l: 73, pct: '.549', gb: '—',  wcRank: null,  streak: 'W3', last10: '7-3' },
          { abbreviation: 'TOR', name: 'Toronto Blue Jays',  w: 89, l: 73, pct: '.549', gb: '—',  wcRank: 1,     streak: 'L1', last10: '6-4' },
          { abbreviation: 'NYY', name: 'New York Yankees',   w: 82, l: 80, pct: '.506', gb: '7',  wcRank: null,  streak: 'W1', last10: '5-5' },
          { abbreviation: 'BOS', name: 'Boston Red Sox',     w: 78, l: 84, pct: '.481', gb: '11', wcRank: null,  streak: 'L2', last10: '4-6' },
          { abbreviation: 'TBR', name: 'Tampa Bay Rays',     w: 70, l: 92, pct: '.432', gb: '19', wcRank: null,  streak: 'W2', last10: '5-5' },
        ],
      },
      {
        name: 'AL Central',
        teams: [
          { abbreviation: 'MIN', name: 'Minnesota Twins',    w: 87, l: 75, pct: '.537', gb: '—',  wcRank: null,  streak: 'W4', last10: '7-3' },
          { abbreviation: 'CLE', name: 'Cleveland Guardians',w: 76, l: 86, pct: '.469', gb: '11', wcRank: null,  streak: 'L1', last10: '4-6' },
          { abbreviation: 'CHW', name: 'Chicago White Sox',  w: 61,l: 101, pct: '.376', gb: '26', wcRank: null,  streak: 'L5', last10: '2-8' },
          { abbreviation: 'KCR', name: 'Kansas City Royals', w: 56,l: 106, pct: '.346', gb: '31', wcRank: null,  streak: 'L3', last10: '3-7' },
          { abbreviation: 'DET', name: 'Detroit Tigers',     w: 55,l: 107, pct: '.340', gb: '32', wcRank: null,  streak: 'W1', last10: '4-6' },
        ],
      },
      {
        name: 'AL West',
        teams: [
          { abbreviation: 'HOU', name: 'Houston Astros',     w: 90, l: 72, pct: '.556', gb: '—',  wcRank: null,  streak: 'W2', last10: '6-4' },
          { abbreviation: 'TEX', name: 'Texas Rangers',      w: 90, l: 72, pct: '.556', gb: '—',  wcRank: 2,     streak: 'W1', last10: '6-4' },
          { abbreviation: 'SEA', name: 'Seattle Mariners',   w: 88, l: 74, pct: '.543', gb: '2',  wcRank: 3,     streak: 'L2', last10: '5-5' },
          { abbreviation: 'LAA', name: 'Los Angeles Angels', w: 73, l: 89, pct: '.451', gb: '17', wcRank: null,  streak: 'L1', last10: '4-6' },
          { abbreviation: 'OAK', name: 'Oakland Athletics',  w: 50,l: 112, pct: '.309', gb: '40', wcRank: null,  streak: 'L4', last10: '2-8' },
        ],
      },
    ],
  },
  {
    conference: 'National League',
    divisions: [
      {
        name: 'NL East',
        teams: [
          { abbreviation: 'ATL', name: 'Atlanta Braves',     w: 104,l: 58, pct: '.642', gb: '—',  wcRank: null,  streak: 'W5', last10: '8-2' },
          { abbreviation: 'PHI', name: 'Philadelphia Phillies',w:90,l: 72, pct: '.556', gb: '14', wcRank: null,  streak: 'W2', last10: '6-4' },
          { abbreviation: 'MIA', name: 'Miami Marlins',      w: 84, l: 78, pct: '.519', gb: '20', wcRank: 5,     streak: 'L1', last10: '5-5' },
          { abbreviation: 'NYM', name: 'New York Mets',      w: 75, l: 87, pct: '.463', gb: '29', wcRank: null,  streak: 'L3', last10: '3-7' },
          { abbreviation: 'WSN', name: 'Washington Nationals',w:71, l: 91, pct: '.438', gb: '33', wcRank: null,  streak: 'W1', last10: '5-5' },
        ],
      },
      {
        name: 'NL Central',
        teams: [
          { abbreviation: 'MIL', name: 'Milwaukee Brewers',  w: 92, l: 70, pct: '.568', gb: '—',  wcRank: null,  streak: 'W3', last10: '7-3' },
          { abbreviation: 'CHC', name: 'Chicago Cubs',       w: 83, l: 79, pct: '.512', gb: '9',  wcRank: null,  streak: 'W1', last10: '6-4' },
          { abbreviation: 'CIN', name: 'Cincinnati Reds',    w: 82, l: 80, pct: '.506', gb: '10', wcRank: 6,     streak: 'L2', last10: '5-5' },
          { abbreviation: 'PIT', name: 'Pittsburgh Pirates', w: 76, l: 86, pct: '.469', gb: '16', wcRank: null,  streak: 'L1', last10: '4-6' },
          { abbreviation: 'STL', name: 'St. Louis Cardinals',w: 71, l: 91, pct: '.438', gb: '21', wcRank: null,  streak: 'L4', last10: '3-7' },
        ],
      },
      {
        name: 'NL West',
        teams: [
          { abbreviation: 'LAD', name: 'Los Angeles Dodgers',w:100,l: 62, pct: '.617', gb: '—',  wcRank: null,  streak: 'W4', last10: '8-2' },
          { abbreviation: 'ARI', name: 'Arizona Diamondbacks',w:84,l: 78, pct: '.519', gb: '16', wcRank: 4,     streak: 'W2', last10: '6-4' },
          { abbreviation: 'SFG', name: 'San Francisco Giants',w:79,l: 83, pct: '.488', gb: '21', wcRank: null,  streak: 'L1', last10: '5-5' },
          { abbreviation: 'SDP', name: 'San Diego Padres',   w: 82, l: 80, pct: '.506', gb: '18', wcRank: null, streak: 'W3', last10: '6-4' },
          { abbreviation: 'COL', name: 'Colorado Rockies',   w: 59,l: 103, pct: '.364', gb: '41', wcRank: null, streak: 'L3', last10: '3-7' },
        ],
      },
    ],
  },
]

export const NHL_STANDINGS = [
  {
    conference: 'Eastern Conference',
    divisions: [
      {
        name: 'Atlantic',
        teams: [
          { abbreviation: 'BOS', name: 'Boston Bruins',         w: 65, l: 12, otl:  9, pts: 135, gf: 290, ga: 195, streak: 'W4', last10: '8-2' },
          { abbreviation: 'TOR', name: 'Toronto Maple Leafs',   w: 50, l: 21, otl: 11, pts: 111, gf: 268, ga: 234, streak: 'L1', last10: '6-4' },
          { abbreviation: 'FLA', name: 'Florida Panthers',      w: 52, l: 24, otl:  6, pts: 110, gf: 274, ga: 241, streak: 'W2', last10: '7-3' },
          { abbreviation: 'TBL', name: 'Tampa Bay Lightning',   w: 46, l: 30, otl:  6, pts:  98, gf: 250, ga: 251, streak: 'L2', last10: '5-5' },
          { abbreviation: 'DET', name: 'Detroit Red Wings',     w: 35, l: 37, otl: 10, pts:  80, gf: 218, ga: 263, streak: 'W1', last10: '4-6' },
          { abbreviation: 'MTL', name: 'Montréal Canadiens',    w: 31, l: 43, otl:  8, pts:  70, gf: 209, ga: 286, streak: 'L3', last10: '3-7' },
          { abbreviation: 'OTT', name: 'Ottawa Senators',       w: 29, l: 42, otl: 11, pts:  69, gf: 235, ga: 290, streak: 'W2', last10: '4-6' },
          { abbreviation: 'BUF', name: 'Buffalo Sabres',        w: 27, l: 44, otl: 11, pts:  65, gf: 208, ga: 293, streak: 'L1', last10: '3-7' },
        ],
      },
      {
        name: 'Metropolitan',
        teams: [
          { abbreviation: 'NYR', name: 'New York Rangers',      w: 55, l: 20, otl:  7, pts: 117, gf: 272, ga: 213, streak: 'W3', last10: '7-3' },
          { abbreviation: 'CAR', name: 'Carolina Hurricanes',   w: 52, l: 21, otl:  9, pts: 113, gf: 261, ga: 220, streak: 'L1', last10: '6-4' },
          { abbreviation: 'NYI', name: 'New York Islanders',    w: 42, l: 31, otl:  9, pts:  93, gf: 228, ga: 245, streak: 'W1', last10: '5-5' },
          { abbreviation: 'NJD', name: 'New Jersey Devils',     w: 40, l: 32, otl: 10, pts:  90, gf: 241, ga: 258, streak: 'W2', last10: '6-4' },
          { abbreviation: 'PIT', name: 'Pittsburgh Penguins',   w: 33, l: 37, otl: 12, pts:  78, gf: 226, ga: 264, streak: 'L2', last10: '4-6' },
          { abbreviation: 'WSH', name: 'Washington Capitals',   w: 35, l: 38, otl:  9, pts:  79, gf: 232, ga: 270, streak: 'W1', last10: '5-5' },
          { abbreviation: 'PHI', name: 'Philadelphia Flyers',   w: 31, l: 36, otl: 15, pts:  77, gf: 218, ga: 265, streak: 'L1', last10: '4-6' },
          { abbreviation: 'CBJ', name: 'Columbus Blue Jackets', w: 25, l: 47, otl: 10, pts:  60, gf: 204, ga: 295, streak: 'L4', last10: '2-8' },
        ],
      },
    ],
  },
  {
    conference: 'Western Conference',
    divisions: [
      {
        name: 'Central',
        teams: [
          { abbreviation: 'COL', name: 'Colorado Avalanche',    w: 52, l: 22, otl:  8, pts: 112, gf: 289, ga: 241, streak: 'W5', last10: '8-2' },
          { abbreviation: 'DAL', name: 'Dallas Stars',          w: 52, l: 25, otl:  5, pts: 109, gf: 257, ga: 220, streak: 'W2', last10: '7-3' },
          { abbreviation: 'WPG', name: 'Winnipeg Jets',         w: 49, l: 25, otl:  8, pts: 106, gf: 268, ga: 238, streak: 'L1', last10: '6-4' },
          { abbreviation: 'STL', name: 'St. Louis Blues',       w: 37, l: 38, otl:  7, pts:  81, gf: 226, ga: 257, streak: 'W1', last10: '5-5' },
          { abbreviation: 'MIN', name: 'Minnesota Wild',        w: 35, l: 36, otl: 11, pts:  81, gf: 220, ga: 252, streak: 'L2', last10: '4-6' },
          { abbreviation: 'NSH', name: 'Nashville Predators',   w: 30, l: 42, otl: 10, pts:  70, gf: 214, ga: 271, streak: 'W2', last10: '4-6' },
          { abbreviation: 'CHI', name: 'Chicago Blackhawks',    w: 23, l: 50, otl:  9, pts:  55, gf: 195, ga: 299, streak: 'L3', last10: '2-8' },
          { abbreviation: 'ARI', name: 'Arizona Coyotes',       w: 24, l: 47, otl: 11, pts:  59, gf: 199, ga: 287, streak: 'L1', last10: '3-7' },
        ],
      },
      {
        name: 'Pacific',
        teams: [
          { abbreviation: 'VGK', name: 'Vegas Golden Knights',  w: 55, l: 22, otl:  5, pts: 115, gf: 282, ga: 225, streak: 'W3', last10: '7-3' },
          { abbreviation: 'EDM', name: 'Edmonton Oilers',       w: 52, l: 23, otl:  7, pts: 111, gf: 300, ga: 254, streak: 'W1', last10: '7-3' },
          { abbreviation: 'CGY', name: 'Calgary Flames',        w: 40, l: 31, otl: 11, pts:  91, gf: 244, ga: 250, streak: 'L1', last10: '5-5' },
          { abbreviation: 'VAN', name: 'Vancouver Canucks',     w: 38, l: 33, otl: 11, pts:  87, gf: 237, ga: 251, streak: 'W2', last10: '6-4' },
          { abbreviation: 'SEA', name: 'Seattle Kraken',        w: 37, l: 35, otl: 10, pts:  84, gf: 229, ga: 257, streak: 'L2', last10: '4-6' },
          { abbreviation: 'LAK', name: 'Los Angeles Kings',     w: 35, l: 36, otl: 11, pts:  81, gf: 225, ga: 252, streak: 'W1', last10: '5-5' },
          { abbreviation: 'ANA', name: 'Anaheim Ducks',         w: 23, l: 48, otl: 11, pts:  57, gf: 198, ga: 298, streak: 'L2', last10: '2-8' },
          { abbreviation: 'SJS', name: 'San Jose Sharks',       w: 20, l: 52, otl: 10, pts:  50, gf: 186, ga: 302, streak: 'L5', last10: '1-9' },
        ],
      },
    ],
  },
]
