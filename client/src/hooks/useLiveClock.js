import { useState, useEffect, useRef } from 'react'

function parseMMSS(str) {
  if (!str || typeof str !== 'string') return null
  const parts = str.split(':')
  if (parts.length !== 2) return null
  const mins = parseInt(parts[0], 10)
  const secs = parseInt(parts[1], 10)
  if (isNaN(mins) || isNaN(secs)) return null
  return mins * 60 + secs
}

function fmtMMSS(totalSecs) {
  const m = Math.floor(totalSecs / 60)
  const s = totalSecs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Client-side countdown that syncs to server-pushed timeRemaining strings.
 * Ticks every second while isRunning=true; resets when serverTime changes.
 */
export function useLiveClock(serverTime, isRunning) {
  const [display, setDisplay] = useState(serverTime)
  const secsRef = useRef(null)

  // Reset when server pushes a new value
  useEffect(() => {
    const secs = parseMMSS(serverTime)
    secsRef.current = secs
    setDisplay(serverTime)
  }, [serverTime])

  // Tick while running
  useEffect(() => {
    if (!isRunning || secsRef.current === null) return
    const id = setInterval(() => {
      if (secsRef.current > 0) {
        secsRef.current -= 1
        setDisplay(fmtMMSS(secsRef.current))
      }
    }, 1000)
    return () => clearInterval(id)
  }, [serverTime, isRunning])

  return display ?? serverTime
}
