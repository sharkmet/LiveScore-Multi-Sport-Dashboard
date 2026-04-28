// ---- Mock data that matches the real app's shapes ----

const TEAM = (abbreviation, name, record, color) => ({ abbreviation, name, record, color });

const T = {
  TOR: TEAM('TOR', 'Blue Jays',   '58-47', '#134A8E'),
  LAD: TEAM('LAD', 'Dodgers',     '63-42', '#005A9C'),
  NYY: TEAM('NYY', 'Yankees',     '61-44', '#0C2340'),
  BOS: TEAM('BOS', 'Red Sox',     '55-49', '#BD3039'),
  HOU: TEAM('HOU', 'Astros',      '60-45', '#EB6E1F'),
  SEA: TEAM('SEA', 'Mariners',    '54-51', '#0C2C56'),
  SF:  TEAM('SF',  'Giants',      '52-53', '#FD5A1E'),
  ATL: TEAM('ATL', 'Braves',      '59-46', '#13274F'),

  // NHL
  TBL: TEAM('TBL', 'Lightning',   '38-22-6', '#002868'),
  TORH:TEAM('TOR', 'Maple Leafs', '41-20-4', '#00205B'),
  EDM: TEAM('EDM', 'Oilers',      '44-18-5', '#FC4C02'),
  VGK: TEAM('VGK', 'Golden Knights','39-22-5','#B4975A'),

  // NBA
  BOSN:TEAM('BOS', 'Celtics',     '48-18', '#007A33'),
  NYK: TEAM('NYK', 'Knicks',      '38-28', '#006BB6'),
  DEN: TEAM('DEN', 'Nuggets',     '44-22', '#0E2240'),
  LAL: TEAM('LAL', 'Lakers',      '36-30', '#552583'),
  GSW: TEAM('GSW', 'Warriors',    '39-27', '#1D428A'),
  OKC: TEAM('OKC', 'Thunder',     '50-16', '#007AC1'),
};

const GAMES = [
  // HERO — the featured live game
  {
    gameId:'g1', league:'mlb', status:'live',
    awayTeam:T.TOR, homeTeam:T.LAD,
    score:{away:4, home:3},
    period:{ label:'Top 7th', short:'T7' },
    situation:'2 out · Runner on 2nd',
    venue:'Dodger Stadium · Los Angeles',
    startTime: '2026-04-17T19:10',
    featured:true,
  },
  // live
  {
    gameId:'g2', league:'mlb', status:'live',
    awayTeam:T.BOS, homeTeam:T.NYY,
    score:{away:2, home:5},
    period:{ label:'Bot 5th', short:'B5' },
    situation:'1 out · Bases empty',
  },
  // warmup
  {
    gameId:'g3', league:'mlb', status:'warmup',
    awayTeam:T.HOU, homeTeam:T.SEA,
    score:{away:0, home:0},
    period:{ label:'Warmup' },
  },
  // delayed
  {
    gameId:'g4', league:'mlb', status:'delayed',
    awayTeam:T.SF, homeTeam:T.ATL,
    score:{away:1, home:1},
    period:{ label:'Rain Delay · Top 4th' },
  },
  // upcoming
  {
    gameId:'g5', league:'mlb', status:'scheduled',
    awayTeam:T.NYY, homeTeam:T.HOU,
    score:{away:null, home:null},
    period:{ label:'' },
    startTime:'2026-04-17T22:05',
  },
  {
    gameId:'g6', league:'mlb', status:'scheduled',
    awayTeam:T.SEA, homeTeam:T.SF,
    score:{away:null, home:null},
    period:{ label:'' },
    startTime:'2026-04-17T22:35',
  },
  // final
  {
    gameId:'g7', league:'mlb', status:'final',
    awayTeam:T.ATL, homeTeam:T.BOS,
    score:{away:6, home:3},
    period:{ label:'Final' },
  },
  {
    gameId:'g8', league:'mlb', status:'final',
    awayTeam:T.LAD, homeTeam:T.TOR,
    score:{away:5, home:2},
    period:{ label:'Final' },
  },
];

// NHL / NBA games for the "All" tab
const GAMES_NHL = [
  { gameId:'n1', league:'nhl', status:'live',
    awayTeam:T.TBL, homeTeam:T.TORH, score:{away:2,home:3},
    period:{ label:'2nd · 08:42', short:'P2' } },
  { gameId:'n2', league:'nhl', status:'scheduled',
    awayTeam:T.EDM, homeTeam:T.VGK, score:{away:null,home:null},
    startTime:'2026-04-17T22:00' },
];
const GAMES_NBA = [
  { gameId:'b1', league:'nba', status:'live',
    awayTeam:T.OKC, homeTeam:T.DEN, score:{away:78, home:82},
    period:{ label:'Q3 · 4:11', short:'Q3' } },
  { gameId:'b2', league:'nba', status:'final',
    awayTeam:T.LAL, homeTeam:T.GSW, score:{away:112, home:118},
    period:{ label:'Final' } },
];

const ALL_GAMES = { mlb: GAMES, nhl: GAMES_NHL, nba: GAMES_NBA };

// ---- Standings ----
const MLB_STANDINGS = {
  columns: ['W','L','PCT','GB','L10','STRK'],
  divisions: {
    'AL East': [
      { abbreviation:'TOR', name:'Toronto Blue Jays', wins:58, losses:47, pct:'.552', gamesBack:'—', last10:'7-3', streak:'W3', playoffStatus:'in', clinchIndicator:'' },
      { abbreviation:'NYY', name:'New York Yankees',  wins:56, losses:49, pct:'.533', gamesBack:'2',  last10:'6-4', streak:'L1', playoffStatus:'in',     clinchIndicator:'' },
      { abbreviation:'BAL', name:'Baltimore Orioles', wins:52, losses:53, pct:'.495', gamesBack:'6',  last10:'5-5', streak:'W1', playoffStatus:'bubble', clinchIndicator:'' },
      { abbreviation:'BOS', name:'Boston Red Sox',    wins:51, losses:54, pct:'.486', gamesBack:'7',  last10:'4-6', streak:'L2', playoffStatus:'bubble', clinchIndicator:'' },
      { abbreviation:'TB',  name:'Tampa Bay Rays',    wins:45, losses:60, pct:'.429', gamesBack:'13', last10:'3-7', streak:'L4', playoffStatus:'out' },
    ],
    'AL Central': [
      { abbreviation:'CLE', name:'Cleveland Guardians', wins:60, losses:45, pct:'.571', gamesBack:'—', last10:'7-3', streak:'W2', playoffStatus:'in', clinchIndicator:'' },
      { abbreviation:'KC',  name:'Kansas City Royals',  wins:55, losses:50, pct:'.524', gamesBack:'5', last10:'5-5', streak:'W1', playoffStatus:'bubble' },
      { abbreviation:'MIN', name:'Minnesota Twins',     wins:53, losses:52, pct:'.505', gamesBack:'7', last10:'6-4', streak:'W1', playoffStatus:'out' },
      { abbreviation:'DET', name:'Detroit Tigers',      wins:49, losses:56, pct:'.467', gamesBack:'11',last10:'4-6', streak:'L3', playoffStatus:'out' },
      { abbreviation:'CWS', name:'Chicago White Sox',   wins:34, losses:71, pct:'.324', gamesBack:'26',last10:'2-8', streak:'L7', playoffStatus:'eliminated' },
    ],
  }
};

const NL_STANDINGS = {
  divisions: {
    'NL West': [
      { abbreviation:'LAD', name:'Los Angeles Dodgers', wins:63, losses:42, pct:'.600', gamesBack:'—', last10:'8-2', streak:'W4', playoffStatus:'in', clinchIndicator:'' },
      { abbreviation:'ARI', name:'Arizona D-backs',     wins:55, losses:50, pct:'.524', gamesBack:'8', last10:'6-4', streak:'L1', playoffStatus:'bubble' },
      { abbreviation:'SF',  name:'San Francisco Giants', wins:52, losses:53, pct:'.495', gamesBack:'11',last10:'4-6', streak:'W2', playoffStatus:'bubble' },
      { abbreviation:'SD',  name:'San Diego Padres',     wins:51, losses:54, pct:'.486', gamesBack:'12',last10:'5-5', streak:'L2', playoffStatus:'out' },
      { abbreviation:'COL', name:'Colorado Rockies',    wins:38, losses:67, pct:'.362', gamesBack:'25',last10:'3-7', streak:'L3', playoffStatus:'eliminated' },
    ],
    'NL East': [
      { abbreviation:'ATL', name:'Atlanta Braves', wins:59, losses:46, pct:'.562', gamesBack:'—', last10:'6-4', streak:'W1', playoffStatus:'in' },
      { abbreviation:'PHI', name:'Philadelphia Phillies', wins:58, losses:47, pct:'.552', gamesBack:'1', last10:'7-3', streak:'W2', playoffStatus:'in' },
      { abbreviation:'NYM', name:'New York Mets',  wins:50, losses:55, pct:'.476', gamesBack:'9', last10:'4-6', streak:'L2', playoffStatus:'out' },
      { abbreviation:'WSH', name:'Washington Nationals', wins:45, losses:60, pct:'.429', gamesBack:'14', last10:'5-5', streak:'W1', playoffStatus:'out' },
      { abbreviation:'MIA', name:'Miami Marlins', wins:41, losses:64, pct:'.390', gamesBack:'18', last10:'3-7', streak:'L1', playoffStatus:'eliminated' },
    ],
  }
};

// ---- Playoffs ----
const PLAYOFFS = {
  started: true,
  rounds: [
    {
      roundNumber:1, roundName:'Wild Card Series',
      series:[
        { seriesId:'alwc1', conference:'AL', neededToWin:2,
          topSeed:{abbreviation:'HOU', wins:2, seed:4}, bottomSeed:{abbreviation:'MIN', wins:0, seed:5}, status:'complete' },
        { seriesId:'alwc2', conference:'AL', neededToWin:2,
          topSeed:{abbreviation:'TEX', wins:0, seed:4}, bottomSeed:{abbreviation:'TOR', wins:2, seed:5}, status:'complete' },
        { seriesId:'nlwc1', conference:'NL', neededToWin:2,
          topSeed:{abbreviation:'LAD', wins:2, seed:3}, bottomSeed:{abbreviation:'MIA', wins:0, seed:6}, status:'complete' },
        { seriesId:'nlwc2', conference:'NL', neededToWin:2,
          topSeed:{abbreviation:'ATL', wins:1, seed:3}, bottomSeed:{abbreviation:'PHI', wins:2, seed:6}, status:'complete' },
      ]
    },
    {
      roundNumber:2, roundName:'Division Series',
      series:[
        { seriesId:'alds1', conference:'AL', neededToWin:3,
          topSeed:{abbreviation:'NYY', wins:2, seed:1}, bottomSeed:{abbreviation:'HOU', wins:1, seed:4}, status:'live' },
        { seriesId:'alds2', conference:'AL', neededToWin:3,
          topSeed:{abbreviation:'CLE', wins:1, seed:2}, bottomSeed:{abbreviation:'TOR', wins:1, seed:5}, status:'live' },
        { seriesId:'nlds1', conference:'NL', neededToWin:3,
          topSeed:{abbreviation:'LAD', wins:3, seed:1}, bottomSeed:{abbreviation:'PHI', wins:2, seed:3}, status:'live' },
        { seriesId:'nlds2', conference:'NL', neededToWin:3,
          topSeed:{abbreviation:'ATL', wins:0, seed:2}, bottomSeed:{abbreviation:'TBD',wins:0, seed:0}, status:'upcoming' },
      ]
    },
    {
      roundNumber:3, roundName:'Championship Series',
      series:[
        { seriesId:'alcs', conference:'AL', neededToWin:4,
          topSeed:{abbreviation:'TBD', wins:0}, bottomSeed:{abbreviation:'TBD', wins:0}, status:'upcoming' },
        { seriesId:'nlcs', conference:'NL', neededToWin:4,
          topSeed:{abbreviation:'TBD', wins:0}, bottomSeed:{abbreviation:'TBD', wins:0}, status:'upcoming' },
      ]
    },
    {
      roundNumber:4, roundName:'World Series',
      series:[
        { seriesId:'ws', conference:null, neededToWin:4,
          topSeed:{abbreviation:'TBD', wins:0}, bottomSeed:{abbreviation:'TBD', wins:0}, status:'upcoming' },
      ]
    },
  ]
};

// ---- Alerts ----
const ALERTS = [
  { id:'a1', severity:'critical', type:'score_change', title:'TOR 4 — 3 LAD',
    message:'Vladimir Guerrero Jr. solo HR, top 7th.', timestamp:'1m ago', gameId:'g1' },
  { id:'a2', severity:'info',     type:'lineup',       title:'Lineup posted',
    message:'NYY vs HOU lineups announced.', timestamp:'12m ago', gameId:'g5' },
  { id:'a3', severity:'warning',  type:'delay',        title:'Rain delay',
    message:'SF @ ATL delayed in the 4th inning.', timestamp:'24m ago', gameId:'g4' },
  { id:'a4', severity:'info',     type:'final',        title:'Final: ATL 6, BOS 3',
    message:'Atlanta sweeps the series.', timestamp:'58m ago', gameId:'g7' },
];

window.LS_DATA = { T, GAMES, ALL_GAMES, MLB_STANDINGS, NL_STANDINGS, PLAYOFFS, ALERTS };
