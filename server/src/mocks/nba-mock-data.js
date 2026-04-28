/**
 * NBA mock data — 4 normalized GameEvent objects.
 * Used when USE_MOCK_DATA=true or cdn.nba.com is unreachable.
 */

export const NBA_MOCK_GAMES = [
  // ── Game 1: Live — LAL @ BOS, Q3 9:46, BOS leads 78-72 ──────────────────
  {
    gameId: 'nba_0022301001',
    league: 'nba',
    status: 'live',
    startTime: '2026-04-14T23:30:00Z',
    venue: 'TD Garden',
    homeTeam: {
      id: 'bos',
      name: 'Celtics',
      city: 'Boston',
      abbreviation: 'BOS',
      score: 78,
      record: '58-20',
      color: '#007A33',
    },
    awayTeam: {
      id: 'lal',
      name: 'Lakers',
      city: 'Los Angeles',
      abbreviation: 'LAL',
      score: 72,
      record: '44-34',
      color: '#552583',
    },
    score: { home: 78, away: 72 },
    period: {
      current: 3,
      label: 'Q3',
      totalPeriods: 4,
      timeRemaining: '9:46',
      inHalftime: false,
    },
    matchup: {
      period: 3,
      timeoutsHome: 4,
      timeoutsAway: 5,
      foulsHome: 3,
      foulsAway: 4,
      homeInBonus: false,
      awayInBonus: false,
      possession: 'home',
    },
    winProbability: { home: 0.612, away: 0.388 },
    winProbTimeline: [
      { period: 0, home: 0.5, away: 0.5, periodLabel: 'Pre' },
      { period: 1, home: 0.531, away: 0.469, periodLabel: 'Q1' },
      { period: 2, home: 0.571, away: 0.429, periodLabel: 'Q2' },
    ],
    linescore: [
      { period: 1, periodLabel: 'Q1', homeScore: 28, awayScore: 26 },
      { period: 2, periodLabel: 'Q2', homeScore: 24, awayScore: 20 },
    ],
    scoringPlays: [
      {
        period: 3, clock: '11:48', teamAbbrev: 'BOS', playerName: 'Jayson Tatum',
        actionType: '3pt', description: 'Tatum 3-pointer (26 PTS)', scoreHome: 68, scoreAway: 65,
      },
      {
        period: 3, clock: '10:55', teamAbbrev: 'LAL', playerName: 'LeBron James',
        actionType: 'layup', description: 'LeBron driving layup (22 PTS)', scoreHome: 68, scoreAway: 67,
      },
      {
        period: 3, clock: '10:21', teamAbbrev: 'BOS', playerName: 'Jaylen Brown',
        actionType: '2pt', description: 'Brown mid-range (18 PTS)', scoreHome: 70, scoreAway: 67,
      },
      {
        period: 3, clock: '9:46', teamAbbrev: 'BOS', playerName: 'Kristaps Porzingis',
        actionType: '2pt', description: 'Porzingis post-up (14 PTS)', scoreHome: 72, scoreAway: 67,
      },
    ],
    gameLeaders: {
      home: { name: 'Jayson Tatum', points: 26, rebounds: 8, assists: 5 },
      away: { name: 'LeBron James', points: 22, rebounds: 9, assists: 7 },
    },
    boxScore: {
      home: {
        players: [
          {
            name: 'Jayson Tatum', jerseyNum: '0', position: 'F', oncourt: true,
            statistics: {
              points: 26, rebounds: 8, assists: 5, steals: 1, blocks: 0,
              fieldGoalsMade: 9, fieldGoalsAttempted: 18,
              threePointersMade: 3, threePointersAttempted: 7,
              freeThrowsMade: 5, freeThrowsAttempted: 6,
              turnovers: 2, foulsPersonal: 2, minutes: '26:14',
            },
          },
          {
            name: 'Jaylen Brown', jerseyNum: '7', position: 'G', oncourt: true,
            statistics: {
              points: 18, rebounds: 4, assists: 2, steals: 2, blocks: 1,
              fieldGoalsMade: 7, fieldGoalsAttempted: 14,
              threePointersMade: 1, threePointersAttempted: 4,
              freeThrowsMade: 3, freeThrowsAttempted: 4,
              turnovers: 1, foulsPersonal: 1, minutes: '25:30',
            },
          },
          {
            name: 'Kristaps Porzingis', jerseyNum: '8', position: 'C', oncourt: true,
            statistics: {
              points: 14, rebounds: 5, assists: 1, steals: 0, blocks: 2,
              fieldGoalsMade: 5, fieldGoalsAttempted: 10,
              threePointersMade: 2, threePointersAttempted: 4,
              freeThrowsMade: 2, freeThrowsAttempted: 2,
              turnovers: 0, foulsPersonal: 3, minutes: '20:00',
            },
          },
          {
            name: 'Derrick White', jerseyNum: '9', position: 'G', oncourt: true,
            statistics: {
              points: 10, rebounds: 3, assists: 4, steals: 2, blocks: 1,
              fieldGoalsMade: 4, fieldGoalsAttempted: 9,
              threePointersMade: 2, threePointersAttempted: 5,
              freeThrowsMade: 0, freeThrowsAttempted: 0,
              turnovers: 1, foulsPersonal: 1, minutes: '24:10',
            },
          },
          {
            name: 'Al Horford', jerseyNum: '42', position: 'C', oncourt: true,
            statistics: {
              points: 8, rebounds: 6, assists: 2, steals: 0, blocks: 1,
              fieldGoalsMade: 3, fieldGoalsAttempted: 7,
              threePointersMade: 2, threePointersAttempted: 4,
              freeThrowsMade: 0, freeThrowsAttempted: 0,
              turnovers: 0, foulsPersonal: 2, minutes: '22:00',
            },
          },
        ],
        teamStats: {
          points: 78, rebounds: 22, assists: 18, steals: 4, blocks: 3,
          fieldGoalsMade: 29, fieldGoalsAttempted: 62,
          threePointersMade: 10, threePointersAttempted: 28,
          freeThrowsMade: 10, freeThrowsAttempted: 13,
          turnovers: 6, foulsPersonal: 12,
        },
      },
      away: {
        players: [
          {
            name: 'LeBron James', jerseyNum: '23', position: 'F', oncourt: true,
            statistics: {
              points: 22, rebounds: 9, assists: 7, steals: 1, blocks: 0,
              fieldGoalsMade: 8, fieldGoalsAttempted: 15,
              threePointersMade: 1, threePointersAttempted: 3,
              freeThrowsMade: 5, freeThrowsAttempted: 6,
              turnovers: 3, foulsPersonal: 2, minutes: '28:00',
            },
          },
          {
            name: 'Anthony Davis', jerseyNum: '3', position: 'C', oncourt: true,
            statistics: {
              points: 20, rebounds: 11, assists: 2, steals: 0, blocks: 3,
              fieldGoalsMade: 7, fieldGoalsAttempted: 13,
              threePointersMade: 0, threePointersAttempted: 1,
              freeThrowsMade: 6, freeThrowsAttempted: 8,
              turnovers: 1, foulsPersonal: 3, minutes: '26:45',
            },
          },
          {
            name: "D'Angelo Russell", jerseyNum: '1', position: 'G', oncourt: true,
            statistics: {
              points: 12, rebounds: 2, assists: 5, steals: 1, blocks: 0,
              fieldGoalsMade: 4, fieldGoalsAttempted: 10,
              threePointersMade: 2, threePointersAttempted: 5,
              freeThrowsMade: 2, freeThrowsAttempted: 2,
              turnovers: 2, foulsPersonal: 1, minutes: '22:00',
            },
          },
          {
            name: 'Austin Reaves', jerseyNum: '15', position: 'G', oncourt: true,
            statistics: {
              points: 9, rebounds: 2, assists: 3, steals: 1, blocks: 0,
              fieldGoalsMade: 3, fieldGoalsAttempted: 7,
              threePointersMade: 1, threePointersAttempted: 3,
              freeThrowsMade: 2, freeThrowsAttempted: 2,
              turnovers: 1, foulsPersonal: 2, minutes: '21:30',
            },
          },
          {
            name: 'Rui Hachimura', jerseyNum: '28', position: 'F', oncourt: true,
            statistics: {
              points: 7, rebounds: 4, assists: 1, steals: 0, blocks: 0,
              fieldGoalsMade: 3, fieldGoalsAttempted: 6,
              threePointersMade: 1, threePointersAttempted: 2,
              freeThrowsMade: 0, freeThrowsAttempted: 0,
              turnovers: 0, foulsPersonal: 1, minutes: '18:00',
            },
          },
        ],
        teamStats: {
          points: 72, rebounds: 26, assists: 17, steals: 5, blocks: 4,
          fieldGoalsMade: 26, fieldGoalsAttempted: 58,
          threePointersMade: 8, threePointersAttempted: 22,
          freeThrowsMade: 12, freeThrowsAttempted: 16,
          turnovers: 9, foulsPersonal: 14,
        },
      },
    },
    alerts: [],
    lastUpdated: new Date().toISOString(),
  },

  // ── Game 2: Live — GSW @ PHX, Halftime, PHX leads 58-54 ─────────────────
  {
    gameId: 'nba_0022301002',
    league: 'nba',
    status: 'live',
    startTime: '2026-04-14T22:00:00Z',
    venue: 'Footprint Center',
    homeTeam: {
      id: 'phx',
      name: 'Suns',
      city: 'Phoenix',
      abbreviation: 'PHX',
      score: 58,
      record: '45-33',
      color: '#1D1160',
    },
    awayTeam: {
      id: 'gsw',
      name: 'Warriors',
      city: 'Golden State',
      abbreviation: 'GSW',
      score: 54,
      record: '40-38',
      color: '#1D428A',
    },
    score: { home: 58, away: 54 },
    period: {
      current: 2,
      label: 'Halftime',
      totalPeriods: 4,
      timeRemaining: '0:00',
      inHalftime: true,
    },
    matchup: {
      period: 2,
      timeoutsHome: 5,
      timeoutsAway: 4,
      foulsHome: 5,
      foulsAway: 6,
      homeInBonus: false,
      awayInBonus: false,
      possession: null,
    },
    winProbability: { home: 0.578, away: 0.422 },
    winProbTimeline: [
      { period: 0, home: 0.5, away: 0.5, periodLabel: 'Pre' },
      { period: 1, home: 0.528, away: 0.472, periodLabel: 'Q1' },
      { period: 2, home: 0.578, away: 0.422, periodLabel: 'Q2' },
    ],
    linescore: [
      { period: 1, periodLabel: 'Q1', homeScore: 28, awayScore: 26 },
      { period: 2, periodLabel: 'Q2', homeScore: 30, awayScore: 28 },
    ],
    scoringPlays: [
      {
        period: 2, clock: '0:42', teamAbbrev: 'PHX', playerName: 'Devin Booker',
        actionType: '3pt', description: 'Booker buzzer-beater 3 (28 PTS)', scoreHome: 58, scoreAway: 54,
      },
    ],
    gameLeaders: {
      home: { name: 'Devin Booker', points: 28, rebounds: 3, assists: 4 },
      away: { name: 'Stephen Curry', points: 21, rebounds: 2, assists: 6 },
    },
    boxScore: {
      home: {
        players: [
          {
            name: 'Devin Booker', jerseyNum: '1', position: 'G', oncourt: false,
            statistics: {
              points: 28, rebounds: 3, assists: 4, steals: 1, blocks: 0,
              fieldGoalsMade: 10, fieldGoalsAttempted: 18,
              threePointersMade: 4, threePointersAttempted: 8,
              freeThrowsMade: 4, freeThrowsAttempted: 4,
              turnovers: 2, foulsPersonal: 1, minutes: '20:00',
            },
          },
          {
            name: 'Kevin Durant', jerseyNum: '35', position: 'F', oncourt: false,
            statistics: {
              points: 16, rebounds: 6, assists: 3, steals: 0, blocks: 1,
              fieldGoalsMade: 6, fieldGoalsAttempted: 12,
              threePointersMade: 1, threePointersAttempted: 3,
              freeThrowsMade: 3, freeThrowsAttempted: 4,
              turnovers: 1, foulsPersonal: 2, minutes: '20:00',
            },
          },
        ],
        teamStats: {
          points: 58, rebounds: 18, assists: 14, steals: 3, blocks: 2,
          fieldGoalsMade: 22, fieldGoalsAttempted: 46,
          threePointersMade: 8, threePointersAttempted: 20,
          freeThrowsMade: 6, freeThrowsAttempted: 8,
          turnovers: 5, foulsPersonal: 10,
        },
      },
      away: {
        players: [
          {
            name: 'Stephen Curry', jerseyNum: '30', position: 'G', oncourt: false,
            statistics: {
              points: 21, rebounds: 2, assists: 6, steals: 2, blocks: 0,
              fieldGoalsMade: 7, fieldGoalsAttempted: 16,
              threePointersMade: 3, threePointersAttempted: 9,
              freeThrowsMade: 4, freeThrowsAttempted: 4,
              turnovers: 2, foulsPersonal: 1, minutes: '20:00',
            },
          },
          {
            name: 'Klay Thompson', jerseyNum: '11', position: 'G', oncourt: false,
            statistics: {
              points: 14, rebounds: 3, assists: 1, steals: 0, blocks: 1,
              fieldGoalsMade: 5, fieldGoalsAttempted: 12,
              threePointersMade: 3, threePointersAttempted: 7,
              freeThrowsMade: 1, freeThrowsAttempted: 2,
              turnovers: 0, foulsPersonal: 2, minutes: '20:00',
            },
          },
        ],
        teamStats: {
          points: 54, rebounds: 16, assists: 15, steals: 4, blocks: 3,
          fieldGoalsMade: 20, fieldGoalsAttempted: 44,
          threePointersMade: 9, threePointersAttempted: 22,
          freeThrowsMade: 5, freeThrowsAttempted: 7,
          turnovers: 7, foulsPersonal: 12,
        },
      },
    },
    alerts: [],
    lastUpdated: new Date().toISOString(),
  },

  // ── Game 3: Final/OT — MIL @ NYK, NYK wins 121-118 ──────────────────────
  {
    gameId: 'nba_0022301003',
    league: 'nba',
    status: 'final',
    startTime: '2026-04-14T17:30:00Z',
    venue: 'Madison Square Garden',
    homeTeam: {
      id: 'nyk',
      name: 'Knicks',
      city: 'New York',
      abbreviation: 'NYK',
      score: 121,
      record: '49-29',
      color: '#006BB6',
    },
    awayTeam: {
      id: 'mil',
      name: 'Bucks',
      city: 'Milwaukee',
      abbreviation: 'MIL',
      score: 118,
      record: '47-31',
      color: '#00471B',
    },
    score: { home: 121, away: 118 },
    period: {
      current: 5,
      label: 'Final/OT',
      totalPeriods: 5,
      timeRemaining: '0:00',
      inHalftime: false,
    },
    matchup: null,
    winProbability: { home: 1.0, away: 0.0 },
    winProbTimeline: [
      { period: 0, home: 0.5, away: 0.5, periodLabel: 'Pre' },
      { period: 1, home: 0.521, away: 0.479, periodLabel: 'Q1' },
      { period: 2, home: 0.489, away: 0.511, periodLabel: 'Q2' },
      { period: 3, home: 0.543, away: 0.457, periodLabel: 'Q3' },
      { period: 4, home: 0.5, away: 0.5, periodLabel: 'Q4' },
      { period: 5, home: 0.97, away: 0.03, periodLabel: 'OT' },
    ],
    linescore: [
      { period: 1, periodLabel: 'Q1', homeScore: 28, awayScore: 26 },
      { period: 2, periodLabel: 'Q2', homeScore: 24, awayScore: 27 },
      { period: 3, periodLabel: 'Q3', homeScore: 30, awayScore: 27 },
      { period: 4, periodLabel: 'Q4', homeScore: 24, awayScore: 26 },
      { period: 5, periodLabel: 'OT', homeScore: 15, awayScore: 12 },
    ],
    scoringPlays: [
      {
        period: 5, clock: '1:22', teamAbbrev: 'NYK', playerName: 'Jalen Brunson',
        actionType: '2pt', description: 'Brunson go-ahead pull-up (36 PTS)', scoreHome: 119, scoreAway: 118,
      },
      {
        period: 5, clock: '0:08', teamAbbrev: 'NYK', playerName: 'Jalen Brunson',
        actionType: 'free throw', description: 'Brunson 2 free throws (38 PTS)', scoreHome: 121, scoreAway: 118,
      },
    ],
    gameLeaders: {
      home: { name: 'Jalen Brunson', points: 38, rebounds: 4, assists: 9 },
      away: { name: 'Giannis Antetokounmpo', points: 34, rebounds: 15, assists: 7 },
    },
    boxScore: {
      home: {
        players: [
          {
            name: 'Jalen Brunson', jerseyNum: '11', position: 'G', oncourt: false,
            statistics: {
              points: 38, rebounds: 4, assists: 9, steals: 2, blocks: 0,
              fieldGoalsMade: 13, fieldGoalsAttempted: 24,
              threePointersMade: 4, threePointersAttempted: 8,
              freeThrowsMade: 8, freeThrowsAttempted: 9,
              turnovers: 3, foulsPersonal: 2, minutes: '44:12',
            },
          },
          {
            name: 'Julius Randle', jerseyNum: '30', position: 'F', oncourt: false,
            statistics: {
              points: 24, rebounds: 10, assists: 4, steals: 1, blocks: 1,
              fieldGoalsMade: 9, fieldGoalsAttempted: 18,
              threePointersMade: 2, threePointersAttempted: 5,
              freeThrowsMade: 4, freeThrowsAttempted: 6,
              turnovers: 2, foulsPersonal: 4, minutes: '40:00',
            },
          },
        ],
        teamStats: {
          points: 121, rebounds: 40, assists: 28, steals: 6, blocks: 4,
          fieldGoalsMade: 44, fieldGoalsAttempted: 90,
          threePointersMade: 12, threePointersAttempted: 34,
          freeThrowsMade: 21, freeThrowsAttempted: 26,
          turnovers: 11, foulsPersonal: 22,
        },
      },
      away: {
        players: [
          {
            name: 'Giannis Antetokounmpo', jerseyNum: '34', position: 'F', oncourt: false,
            statistics: {
              points: 34, rebounds: 15, assists: 7, steals: 1, blocks: 3,
              fieldGoalsMade: 12, fieldGoalsAttempted: 20,
              threePointersMade: 0, threePointersAttempted: 1,
              freeThrowsMade: 10, freeThrowsAttempted: 14,
              turnovers: 4, foulsPersonal: 4, minutes: '43:00',
            },
          },
          {
            name: 'Damian Lillard', jerseyNum: '0', position: 'G', oncourt: false,
            statistics: {
              points: 28, rebounds: 3, assists: 8, steals: 1, blocks: 0,
              fieldGoalsMade: 9, fieldGoalsAttempted: 22,
              threePointersMade: 4, threePointersAttempted: 11,
              freeThrowsMade: 6, freeThrowsAttempted: 7,
              turnovers: 3, foulsPersonal: 2, minutes: '42:30',
            },
          },
        ],
        teamStats: {
          points: 118, rebounds: 38, assists: 26, steals: 5, blocks: 5,
          fieldGoalsMade: 42, fieldGoalsAttempted: 88,
          threePointersMade: 13, threePointersAttempted: 36,
          freeThrowsMade: 21, freeThrowsAttempted: 28,
          turnovers: 13, foulsPersonal: 24,
        },
      },
    },
    alerts: [],
    lastUpdated: new Date().toISOString(),
  },

  // ── Game 4: Scheduled — DEN @ LAC ────────────────────────────────────────
  {
    gameId: 'nba_0022301004',
    league: 'nba',
    status: 'scheduled',
    startTime: '2026-04-15T02:30:00Z',
    venue: 'Crypto.com Arena',
    homeTeam: {
      id: 'lac',
      name: 'Clippers',
      city: 'LA',
      abbreviation: 'LAC',
      score: 0,
      record: '42-36',
      color: '#C8102E',
    },
    awayTeam: {
      id: 'den',
      name: 'Nuggets',
      city: 'Denver',
      abbreviation: 'DEN',
      score: 0,
      record: '55-23',
      color: '#0E2240',
    },
    score: { home: 0, away: 0 },
    period: {
      current: 0,
      label: 'Scheduled',
      totalPeriods: 4,
      timeRemaining: null,
      inHalftime: false,
    },
    matchup: null,
    winProbability: { home: 0.5, away: 0.5 },
    winProbTimeline: [
      { period: 0, home: 0.5, away: 0.5, periodLabel: 'Pre' },
    ],
    linescore: [],
    scoringPlays: [],
    gameLeaders: null,
    boxScore: null,
    alerts: [],
    lastUpdated: new Date().toISOString(),
  },
]
