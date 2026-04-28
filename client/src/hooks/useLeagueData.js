import { useState, useEffect } from 'react'

/**
 * Fetches standings or playoffs data for a given league.
 * Re-fetches whenever league or type changes.
 *
 * @param {'standings'|'playoffs'} type
 * @param {'mlb'|'nhl'|'nba'} league
 * @returns {{ data: any, isLoading: boolean, error: string|null }}
 */
export function useLeagueData(type, league) {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)
    setData(null)

    fetch(`/api/${type}/${league}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((json) => {
        if (!cancelled) {
          setData(json)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message)
          setIsLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [type, league])

  return { data, isLoading, error }
}
