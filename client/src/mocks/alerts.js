import { LIVE_GAME_ID, FINAL_GAME_ID } from './games.js'

const now = new Date()

export const mockAlerts = [
  {
    id: 'alert-001',
    gameId: LIVE_GAME_ID,
    type: 'upset',
    severity: 'warning',
    title: 'Upset Alert',
    message: 'Blue Jays (51-49) lead Yankees (58-42) 4-3 in the 6th inning.',
    timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'alert-002',
    gameId: FINAL_GAME_ID,
    type: 'comeback',
    severity: 'critical',
    title: 'Comeback Complete',
    message: 'Red Sox rallied from 0-3 deficit to win 7-2 over Baltimore.',
    timestamp: new Date(now.getTime() - 65 * 60 * 1000).toISOString(),
  },
  {
    id: 'alert-003',
    gameId: FINAL_GAME_ID,
    type: 'blowout',
    severity: 'info',
    title: 'Blowout Alert',
    message: 'Red Sox cruise to a 7-2 victory over the Orioles.',
    timestamp: new Date(now.getTime() - 70 * 60 * 1000).toISOString(),
  },
]
