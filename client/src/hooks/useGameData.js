import { useReducer, useEffect, useRef, useState } from 'react'
import { mockGames, mockGamesByDay } from '../mocks/games.js'
import { mockAlerts } from '../mocks/alerts.js'
import { useWebSocket } from './useWebSocket.js'

const MOCK_FALLBACK_TIMEOUT_MS = 5_000

const STATUS_PRIORITY = {
  live: 0,
  warmup: 1,
  delayed: 2,
  scheduled: 3,
  final: 4,
}

function sortGames(gamesMap) {
  return Array.from(gamesMap.values()).sort((a, b) => {
    const pa = STATUS_PRIORITY[a.status] ?? 5
    const pb = STATUS_PRIORITY[b.status] ?? 5
    if (pa !== pb) return pa - pb
    return new Date(a.startTime) - new Date(b.startTime)
  })
}

const EMPTY_GAMES_BY_DAY = { yesterday: [], today: [], tomorrow: [] }

function reducer(state, action) {
  switch (action.type) {
    case 'INIT_GAMES': {
      const gamesMap = new Map()
      action.games.forEach((g) => gamesMap.set(g.gameId, g))
      return { ...state, games: gamesMap }
    }
    case 'INIT_GAMES_BY_DAY': {
      // action.gamesByDay: { yesterday: [], today: [], tomorrow: [] }
      const { yesterday = [], today = [], tomorrow = [] } = action.gamesByDay
      const gamesMap = new Map()
      today.forEach((g) => gamesMap.set(g.gameId, g))
      return {
        ...state,
        games: gamesMap,
        gamesByDay: { yesterday, today, tomorrow },
      }
    }
    case 'UPDATE_GAME': {
      const gamesMap = new Map(state.games)
      gamesMap.set(action.game.gameId, action.game)
      // Sync into gamesByDay.today if the game lives there
      const day = action.game.scheduleDay ?? 'today'
      const dayGames = state.gamesByDay[day] ?? []
      const idx = dayGames.findIndex((g) => g.gameId === action.game.gameId)
      const updatedDay = idx >= 0
        ? [...dayGames.slice(0, idx), action.game, ...dayGames.slice(idx + 1)]
        : [...dayGames, action.game]
      return {
        ...state,
        games: gamesMap,
        gamesByDay: { ...state.gamesByDay, [day]: updatedDay },
      }
    }
    case 'SELECT_GAME':
      return { ...state, selectedGameId: action.gameId }
    case 'CLEAR_SELECTION':
      return { ...state, selectedGameId: null }
    case 'INIT_ALERTS':
      return { ...state, alerts: action.alerts }
    case 'ADD_ALERT':
      return { ...state, alerts: [action.alert, ...state.alerts] }
    case 'INIT_PLAYOFFS':
      return { ...state, playoffs: { ...state.playoffs, ...action.playoffs } }
    case 'UPDATE_PLAYOFFS':
      return { ...state, playoffs: { ...state.playoffs, [action.league]: action.bracket } }
    default:
      return state
  }
}

const initialState = {
  games: new Map(),
  gamesByDay: EMPTY_GAMES_BY_DAY,
  selectedGameId: null,
  alerts: [],
  playoffs: { mlb: null, nhl: null, nba: null },
}

export function useGameData() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [isLoading, setIsLoading] = useState(true)
  const [newAlerts, setNewAlerts] = useState([])
  const { status: wsStatus, lastMessage } = useWebSocket()
  const connectedRef = useRef(false)
  const fallbackTimerRef = useRef(null)
  const usingMockRef = useRef(false)

  // 5s fallback: if WS never delivers a snapshot, load mock data
  useEffect(() => {
    fallbackTimerRef.current = setTimeout(() => {
      if (!connectedRef.current) {
        console.warn('[useGameData] WS snapshot not received — loading mock data')
        usingMockRef.current = true
        dispatch({ type: 'INIT_GAMES_BY_DAY', gamesByDay: mockGamesByDay })
        dispatch({ type: 'INIT_ALERTS', alerts: mockAlerts })
        setIsLoading(false)
      }
    }, MOCK_FALLBACK_TIMEOUT_MS)

    return () => clearTimeout(fallbackTimerRef.current)
  }, [])

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (!lastMessage) return

    if (lastMessage.type === 'snapshot') {
      connectedRef.current = true
      usingMockRef.current = false
      clearTimeout(fallbackTimerRef.current)
      setIsLoading(false)

      // Support both old shape (games: []) and new shape (games: { yesterday, today, tomorrow })
      const rawGames = lastMessage.games ?? []
      if (Array.isArray(rawGames)) {
        dispatch({ type: 'INIT_GAMES', games: rawGames })
      } else {
        dispatch({ type: 'INIT_GAMES_BY_DAY', gamesByDay: rawGames })
      }
      dispatch({ type: 'INIT_ALERTS', alerts: lastMessage.alerts ?? [] })
      if (lastMessage.playoffs) {
        dispatch({ type: 'INIT_PLAYOFFS', playoffs: lastMessage.playoffs })
      }
    } else if (lastMessage.type === 'gameUpdate') {
      dispatch({ type: 'UPDATE_GAME', game: lastMessage.game })
    } else if (lastMessage.type === 'alert') {
      dispatch({ type: 'ADD_ALERT', alert: lastMessage.alert })
      setNewAlerts((prev) => [lastMessage.alert, ...prev])
    } else if (lastMessage.type === 'playoffsUpdate') {
      dispatch({ type: 'UPDATE_PLAYOFFS', league: lastMessage.league, bracket: lastMessage.bracket })
    }
  }, [lastMessage])

  const games = sortGames(state.games)

  // Search today first, then yesterday/tomorrow
  const selectedGame = state.selectedGameId
    ? (state.games.get(state.selectedGameId)
        ?? state.gamesByDay.yesterday.find((g) => g.gameId === state.selectedGameId)
        ?? state.gamesByDay.tomorrow.find((g) => g.gameId === state.selectedGameId)
        ?? null)
    : null

  const alerts = [...state.alerts].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  )

  const connectionStatus = usingMockRef.current && wsStatus !== 'connected'
    ? 'mock'
    : wsStatus

  return {
    games,
    gamesByDay: state.gamesByDay,
    selectedGame,
    selectGame: (id) => dispatch({ type: 'SELECT_GAME', gameId: id }),
    clearSelection: () => dispatch({ type: 'CLEAR_SELECTION' }),
    alerts,
    newAlerts,
    wsStatus: connectionStatus,
    isLoading,
    dispatch,
    playoffs: state.playoffs,
    getPlayoffs: (league) => state.playoffs[league] ?? null,
  }
}
