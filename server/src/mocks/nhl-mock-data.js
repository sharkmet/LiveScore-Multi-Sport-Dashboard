/**
 * Mock NHL game data — normalized GameEvent shape.
 * Used as fallback when the NHL API is unreachable or USE_MOCK_DATA=true.
 */

const now = new Date()

const NHL_MOCK_GAMES = [
  // ─── Live: BOS @ TOR — 2nd period, power play ──────────────────────────────
  {
    gameId: 'nhl-2024-001',
    league: 'nhl',
    status: 'live',
    scheduleDay: 'today',
    startTime: new Date(now.getTime() - 50 * 60 * 1000).toISOString(),
    updatedAt: now.toISOString(),
    homeTeam: { id: 'TOR', name: 'Toronto Maple Leafs', abbreviation: 'TOR', record: '45-22-9' },
    awayTeam: { id: 'BOS', name: 'Boston Bruins',       abbreviation: 'BOS', record: '55-12-9' },
    score: { home: 2, away: 3 },
    period: { current: 2, label: '2nd', totalPeriods: 3 },
    lastPlay: 'Pastrnak scores on the power play — Marchand, McAvoy assist',
    timeline: [
      { periodLabel: '1st', homeScore: 1, awayScore: 2 },
      { periodLabel: '2nd', homeScore: 1, awayScore: 1, inProgress: true },
    ],
    winProbability: { home: 0.38, away: 0.62, source: 'model' },
    winProbabilityTimeline: [
      { period: 0, home: 0.45, away: 0.55, periodLabel: 'Pre' },
      { period: 1, home: 0.38, away: 0.62, periodLabel: '1st' },
      { period: 2, home: 0.34, away: 0.66, periodLabel: '2nd' },
    ],
    matchup: {
      period: { current: 2, label: '2nd', timeRemaining: '14:23', inIntermission: false },
      strength: 'PP',
      strengthLabel: '5v4',
      shotsOnGoal: { home: 14, away: 18 },
      homeOnIce: [
        { id: 't1', name: 'M. Rielly',   number: '44', position: 'D'  },
        { id: 't2', name: 'W. Nylander', number: '88', position: 'RW' },
        { id: 't3', name: 'A. Matthews', number: '34', position: 'C'  },
        { id: 't4', name: 'M. Marner',   number: '16', position: 'RW' },
      ],
      awayOnIce: [
        { id: 'b1', name: 'D. Pastrnak',  number: '88', position: 'RW' },
        { id: 'b2', name: 'B. Marchand',  number: '63', position: 'LW' },
        { id: 'b3', name: 'P. Bergeron',  number: '37', position: 'C'  },
        { id: 'b4', name: 'C. McAvoy',    number: '73', position: 'D'  },
        { id: 'b5', name: 'M. Grzelcyk', number: '48', position: 'D'  },
      ],
      penalties: [
        { team: 'TOR', player: 'T. Bertuzzi', infraction: 'Tripping', timeRemaining: '1:42' },
      ],
    },
    goals: [
      { period: '1st', time: '3:45',  team: 'BOS', scorer: 'D. Pastrnak', assists: ['B. Marchand', 'C. McAvoy'],   type: 'EV' },
      { period: '1st', time: '11:20', team: 'BOS', scorer: 'B. Marchand', assists: ['D. Pastrnak', 'P. Bergeron'], type: 'PP' },
      { period: '1st', time: '16:08', team: 'TOR', scorer: 'A. Matthews', assists: ['M. Marner', 'W. Nylander'],   type: 'EV' },
      { period: '2nd', time: '5:37',  team: 'BOS', scorer: 'D. Pastrnak', assists: ['B. Marchand', 'C. McAvoy'],   type: 'PP' },
      { period: '2nd', time: '12:19', team: 'TOR', scorer: 'M. Marner',   assists: ['A. Matthews'],                type: 'EV' },
    ],
    boxScore: null,
  },

  // ─── Final: NYR 4 @ PHI 1 ──────────────────────────────────────────────────
  {
    gameId: 'nhl-2024-002',
    league: 'nhl',
    status: 'final',
    scheduleDay: 'today',
    startTime: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: now.toISOString(),
    homeTeam: { id: 'PHI', name: 'Philadelphia Flyers', abbreviation: 'PHI', record: '30-36-10' },
    awayTeam: { id: 'NYR', name: 'New York Rangers',    abbreviation: 'NYR', record: '52-20-4'  },
    score: { home: 1, away: 4 },
    period: { current: 3, label: 'Final', totalPeriods: 3 },
    lastPlay: 'Game over — NYR wins 4-1',
    timeline: [
      { periodLabel: '1st', homeScore: 0, awayScore: 1 },
      { periodLabel: '2nd', homeScore: 1, awayScore: 2 },
      { periodLabel: '3rd', homeScore: 0, awayScore: 1 },
    ],
    winProbability: { home: 0.04, away: 0.96, source: 'model' },
    winProbabilityTimeline: [
      { period: 0, home: 0.38, away: 0.62, periodLabel: 'Pre' },
      { period: 1, home: 0.31, away: 0.69, periodLabel: '1st' },
      { period: 2, home: 0.18, away: 0.82, periodLabel: '2nd' },
      { period: 3, home: 0.04, away: 0.96, periodLabel: '3rd' },
    ],
    matchup: null,
    goals: [
      { period: '1st', time: '9:14',  team: 'NYR', scorer: 'A. Panarin',  assists: ['V. Trocheck', 'A. Fox'],  type: 'EV' },
      { period: '2nd', time: '4:52',  team: 'PHI', scorer: 'T. Konecny',  assists: ['S. Laughton'],            type: 'PP' },
      { period: '2nd', time: '11:33', team: 'NYR', scorer: 'V. Trocheck', assists: ['A. Panarin', 'J. Jones'], type: 'EV' },
      { period: '2nd', time: '18:44', team: 'NYR', scorer: 'A. Fox',      assists: ['A. Panarin'],             type: 'PP' },
      { period: '3rd', time: '14:02', team: 'NYR', scorer: 'K. Kakko',    assists: ['M. Zibanejad'],           type: 'EV' },
    ],
    boxScore: {
      away: {
        skaters: [
          { name: 'A. Panarin',   goals: 1, assists: 2, points: 3, plusMinus:  2, pim: 0, shots: 4, timeOnIce: '21:14' },
          { name: 'V. Trocheck',  goals: 1, assists: 1, points: 2, plusMinus:  1, pim: 0, shots: 3, timeOnIce: '18:44' },
          { name: 'A. Fox',       goals: 1, assists: 1, points: 2, plusMinus:  2, pim: 0, shots: 2, timeOnIce: '24:10' },
          { name: 'K. Kakko',     goals: 1, assists: 0, points: 1, plusMinus:  1, pim: 0, shots: 3, timeOnIce: '16:32' },
          { name: 'M. Zibanejad', goals: 0, assists: 1, points: 1, plusMinus:  0, pim: 0, shots: 2, timeOnIce: '19:55' },
          { name: 'J. Jones',     goals: 0, assists: 1, points: 1, plusMinus:  1, pim: 2, shots: 1, timeOnIce: '14:08' },
          { name: 'B. Trouba',    goals: 0, assists: 0, points: 0, plusMinus:  0, pim: 0, shots: 1, timeOnIce: '22:47' },
        ],
        goalies: [
          { name: 'I. Shesterkin', goalsAgainst: 1, shotsAgainst: 22, savePercentage: '.955', timeOnIce: '60:00' },
        ],
        totals: { goals: 4, shotsOnGoal: 31, powerPlayGoals: 1, powerPlayOpportunities: 2, pim: 4 },
      },
      home: {
        skaters: [
          { name: 'T. Konecny',  goals: 1, assists: 0, points: 1, plusMinus: -1, pim: 0, shots: 3, timeOnIce: '17:22' },
          { name: 'S. Laughton', goals: 0, assists: 1, points: 1, plusMinus:  0, pim: 0, shots: 1, timeOnIce: '14:11' },
          { name: 'S. Farabee',  goals: 0, assists: 0, points: 0, plusMinus: -2, pim: 2, shots: 2, timeOnIce: '15:03' },
          { name: 'O. Makar',    goals: 0, assists: 0, points: 0, plusMinus: -1, pim: 0, shots: 1, timeOnIce: '23:18' },
          { name: 'I. Provorov', goals: 0, assists: 0, points: 0, plusMinus: -1, pim: 0, shots: 0, timeOnIce: '20:44' },
        ],
        goalies: [
          { name: 'S. Ersson', goalsAgainst: 3, shotsAgainst: 20, savePercentage: '.850', timeOnIce: '40:00' },
          { name: 'C. Delia',  goalsAgainst: 1, shotsAgainst: 11, savePercentage: '.909', timeOnIce: '20:00' },
        ],
        totals: { goals: 1, shotsOnGoal: 22, powerPlayGoals: 1, powerPlayOpportunities: 3, pim: 6 },
      },
    },
  },

  // ─── Final/OT: EDM 3 @ CGY 2 ───────────────────────────────────────────────
  {
    gameId: 'nhl-2024-003',
    league: 'nhl',
    status: 'final',
    scheduleDay: 'today',
    startTime: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
    updatedAt: now.toISOString(),
    homeTeam: { id: 'CGY', name: 'Calgary Flames',  abbreviation: 'CGY', record: '38-30-8' },
    awayTeam: { id: 'EDM', name: 'Edmonton Oilers', abbreviation: 'EDM', record: '49-21-6' },
    score: { home: 2, away: 3 },
    period: { current: 4, label: 'Final/OT', totalPeriods: 4 },
    lastPlay: 'Draisaitl (OT 3:22) wins it — McDavid assists',
    timeline: [
      { periodLabel: '1st', homeScore: 1, awayScore: 1 },
      { periodLabel: '2nd', homeScore: 1, awayScore: 1 },
      { periodLabel: '3rd', homeScore: 0, awayScore: 0 },
      { periodLabel: 'OT',  homeScore: 0, awayScore: 1 },
    ],
    winProbability: { home: 0.02, away: 0.98, source: 'model' },
    winProbabilityTimeline: [
      { period: 0, home: 0.47, away: 0.53, periodLabel: 'Pre' },
      { period: 1, home: 0.47, away: 0.53, periodLabel: '1st' },
      { period: 2, home: 0.45, away: 0.55, periodLabel: '2nd' },
      { period: 3, home: 0.44, away: 0.56, periodLabel: '3rd' },
      { period: 4, home: 0.02, away: 0.98, periodLabel: 'OT'  },
    ],
    matchup: null,
    goals: [
      { period: '1st', time: '7:11',  team: 'CGY', scorer: 'E. Lindholm',  assists: ['N. Backlund', 'M. Tanev'],  type: 'EV' },
      { period: '1st', time: '14:30', team: 'EDM', scorer: 'L. Draisaitl', assists: ['C. McDavid', 'Z. Hyman'],  type: 'PP' },
      { period: '2nd', time: '2:48',  team: 'EDM', scorer: 'C. McDavid',   assists: ['L. Draisaitl', 'E. Kane'], type: 'EV' },
      { period: '2nd', time: '17:55', team: 'CGY', scorer: 'T. Toffoli',   assists: ['B. Gaudreau'],              type: 'EV' },
      { period: 'OT',  time: '3:22',  team: 'EDM', scorer: 'L. Draisaitl', assists: ['C. McDavid'],               type: 'EV' },
    ],
    boxScore: {
      away: {
        skaters: [
          { name: 'L. Draisaitl', goals: 2, assists: 1, points: 3, plusMinus:  1, pim: 0, shots: 5, timeOnIce: '23:48' },
          { name: 'C. McDavid',   goals: 1, assists: 2, points: 3, plusMinus:  2, pim: 0, shots: 4, timeOnIce: '25:14' },
          { name: 'Z. Hyman',     goals: 0, assists: 1, points: 1, plusMinus:  1, pim: 0, shots: 2, timeOnIce: '17:30' },
          { name: 'E. Kane',      goals: 0, assists: 1, points: 1, plusMinus:  0, pim: 2, shots: 1, timeOnIce: '14:55' },
          { name: 'D. Nurse',     goals: 0, assists: 0, points: 0, plusMinus:  0, pim: 0, shots: 1, timeOnIce: '24:02' },
        ],
        goalies: [
          { name: 'S. Skinner', goalsAgainst: 2, shotsAgainst: 28, savePercentage: '.929', timeOnIce: '63:22' },
        ],
        totals: { goals: 3, shotsOnGoal: 33, powerPlayGoals: 1, powerPlayOpportunities: 3, pim: 4 },
      },
      home: {
        skaters: [
          { name: 'E. Lindholm', goals: 1, assists: 0, points: 1, plusMinus:  0, pim: 0, shots: 3, timeOnIce: '18:11' },
          { name: 'T. Toffoli',  goals: 1, assists: 0, points: 1, plusMinus: -1, pim: 0, shots: 3, timeOnIce: '16:44' },
          { name: 'N. Backlund', goals: 0, assists: 1, points: 1, plusMinus:  1, pim: 0, shots: 1, timeOnIce: '15:22' },
          { name: 'B. Gaudreau', goals: 0, assists: 1, points: 1, plusMinus: -1, pim: 2, shots: 2, timeOnIce: '19:08' },
          { name: 'M. Tanev',    goals: 0, assists: 1, points: 1, plusMinus:  0, pim: 0, shots: 0, timeOnIce: '22:31' },
        ],
        goalies: [
          { name: 'J. Markstrom', goalsAgainst: 3, shotsAgainst: 33, savePercentage: '.909', timeOnIce: '63:22' },
        ],
        totals: { goals: 2, shotsOnGoal: 28, powerPlayGoals: 0, powerPlayOpportunities: 2, pim: 4 },
      },
    },
  },

  // ─── Scheduled: WSH @ PIT ──────────────────────────────────────────────────
  {
    gameId: 'nhl-2024-004',
    league: 'nhl',
    status: 'scheduled',
    scheduleDay: 'today',
    startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: now.toISOString(),
    homeTeam: { id: 'PIT', name: 'Pittsburgh Penguins', abbreviation: 'PIT', record: '32-37-7' },
    awayTeam: { id: 'WSH', name: 'Washington Capitals', abbreviation: 'WSH', record: '40-30-6' },
    score: { home: 0, away: 0 },
    period: { current: 0, label: 'Scheduled', totalPeriods: 3 },
    lastPlay: null,
    timeline: [],
    winProbability: { home: 0.48, away: 0.52, source: 'model' },
    winProbabilityTimeline: [],
    matchup: null,
    goals: [],
    boxScore: null,
  },
]

export default NHL_MOCK_GAMES
