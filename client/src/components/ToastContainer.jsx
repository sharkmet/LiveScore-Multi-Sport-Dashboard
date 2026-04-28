import { useState, useEffect, useRef } from 'react'
import Toast from './Toast.jsx'

const MAX_TOASTS = 5

export default function ToastContainer({ alerts }) {
  const [toasts, setToasts] = useState([])
  const timerRefs = useRef(new Map())
  const seenIds = useRef(new Set())

  useEffect(() => {
    alerts.forEach((alert) => {
      if (seenIds.current.has(alert.id)) return
      seenIds.current.add(alert.id)

      setToasts((prev) => {
        const next = [alert, ...prev].slice(0, MAX_TOASTS)
        return next
      })

      if (alert.severity !== 'critical') {
        const timerId = setTimeout(() => {
          dismiss(alert.id)
        }, 5000)
        timerRefs.current.set(alert.id, timerId)
      }
    })
  }, [alerts])

  useEffect(() => {
    const timers = timerRefs.current
    return () => {
      timers.forEach((id) => clearTimeout(id))
      timers.clear()
    }
  }, [])

  function dismiss(alertId) {
    setToasts((prev) => prev.filter((t) => t.id !== alertId))
    const timerId = timerRefs.current.get(alertId)
    if (timerId) {
      clearTimeout(timerId)
      timerRefs.current.delete(alertId)
    }
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} alert={toast} onDismiss={() => dismiss(toast.id)} />
      ))}
    </div>
  )
}
