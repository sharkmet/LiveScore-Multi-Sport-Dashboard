/**
 * useWebSocket — connects to the backend WS server with exponential backoff reconnect.
 *
 * Returns:
 *   status: "connecting" | "connected" | "disconnected" | "reconnecting"
 *   lastMessage: parsed JSON object of the most recent message, or null
 */

import { useState, useEffect, useRef, useCallback } from 'react'

const WS_URL = 'ws://localhost:3001'
const MAX_BACKOFF_MS = 30_000

export function useWebSocket() {
  const [status, setStatus] = useState('connecting')
  const [lastMessage, setLastMessage] = useState(null)

  const wsRef = useRef(null)
  const attemptRef = useRef(0)
  const timerRef = useRef(null)
  const mountedRef = useRef(true)

  const connect = useCallback(() => {
    if (!mountedRef.current) return

    const attempt = attemptRef.current
    if (attempt > 0) {
      setStatus('reconnecting')
    } else {
      setStatus('connecting')
    }

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      if (!mountedRef.current) return
      console.log('[ws] Connected')
      attemptRef.current = 0
      setStatus('connected')
    }

    ws.onmessage = (event) => {
      if (!mountedRef.current) return
      try {
        const data = JSON.parse(event.data)
        setLastMessage(data)
      } catch {
        // ignore malformed messages
      }
    }

    ws.onclose = () => {
      if (!mountedRef.current) return
      setStatus('disconnected')
      scheduleReconnect()
    }

    ws.onerror = () => {
      // onclose fires after onerror — no extra handling needed
    }
  }, [])

  const scheduleReconnect = useCallback(() => {
    if (!mountedRef.current) return
    attemptRef.current += 1
    const delay = Math.min(1_000 * 2 ** (attemptRef.current - 1), MAX_BACKOFF_MS)
    console.log(`[ws] Reconnecting in ${delay}ms (attempt ${attemptRef.current})`)
    timerRef.current = setTimeout(connect, delay)
  }, [connect])

  useEffect(() => {
    mountedRef.current = true
    connect()

    return () => {
      mountedRef.current = false
      clearTimeout(timerRef.current)
      if (wsRef.current) {
        wsRef.current.onclose = null  // prevent reconnect loop on unmount
        wsRef.current.close()
      }
    }
  }, [connect])

  return { status, lastMessage }
}
