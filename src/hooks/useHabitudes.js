import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { todayKey } from '../utils/dates'
import { v4 as uuidv4 } from 'uuid'

export function useHabitudes() {
  const [habitudes, setHabitudes] = useLocalStorage('habitudes', [])
  const [logs, setLogs] = useLocalStorage('habitudes_logs', {})

  const addHabitude = useCallback((data) => {
    setHabitudes((prev) => [...prev, { ...data, id: uuidv4() }])
  }, [setHabitudes])

  const updateHabitude = useCallback((id, data) => {
    setHabitudes((prev) => prev.map((h) => (h.id === id ? { ...h, ...data } : h)))
  }, [setHabitudes])

  const deleteHabitude = useCallback((id) => {
    setHabitudes((prev) => prev.filter((h) => h.id !== id))
  }, [setHabitudes])

  const toggleLog = useCallback((habitudeId, dateKey = todayKey()) => {
    setLogs((prev) => {
      const dayLogs = prev[dateKey] ?? []
      const exists = dayLogs.includes(habitudeId)
      return {
        ...prev,
        [dateKey]: exists ? dayLogs.filter((id) => id !== habitudeId) : [...dayLogs, habitudeId],
      }
    })
  }, [setLogs])

  const isLogged = useCallback(
    (habitudeId, dateKey = todayKey()) => (logs[dateKey] ?? []).includes(habitudeId),
    [logs]
  )

  const getStreak = useCallback(
    (habitudeId) => {
      let streak = 0
      const today = new Date()
      for (let i = 0; i < 365; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        const key = d.toISOString().split('T')[0]
        if ((logs[key] ?? []).includes(habitudeId)) {
          streak++
        } else {
          break
        }
      }
      return streak
    },
    [logs]
  )

  const getCompletionForDay = useCallback(
    (dateKey) => {
      if (!habitudes.length) return 0
      const dayLogs = logs[dateKey] ?? []
      const dailyHabitudes = habitudes.filter((h) => h.frequence?.toLowerCase() === 'quotidien')
      if (!dailyHabitudes.length) return 0
      return Math.round((dayLogs.filter((id) => dailyHabitudes.find((h) => h.id === id)).length / dailyHabitudes.length) * 100)
    },
    [habitudes, logs]
  )

  return { habitudes, logs, addHabitude, updateHabitude, deleteHabitude, toggleLog, isLogged, getStreak, getCompletionForDay }
}
