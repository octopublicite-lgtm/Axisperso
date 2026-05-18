import { useState, useCallback, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { push, pull } from '../lib/cloudSync'
import { supabase } from '../lib/supabase'
import { todayKey } from '../utils/dates'
import { v4 as uuidv4 } from 'uuid'

function legacyLS(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') } catch { return null }
}

export function useHabitudes() {
  const { user } = useAuth()
  const [habitudes, setHabitudes] = useState([])
  const [logs, setLogs] = useState({})
  const habitudesMounted = useRef(false)
  const logsMounted = useRef(false)

  // Load from Supabase once user is confirmed; fall back to localStorage for migration
  useEffect(() => {
    if (!user) return
    const userId = user.id
    console.log('[useHabitudes] fetching for userId:', userId)

    pull(userId, 'habitudes').then((data) => {
      console.log('[useHabitudes] habitudes fetched:', data)
      if (Array.isArray(data) && data.length > 0) {
        setHabitudes(data)
      } else {
        const legacy = legacyLS('axislife_habitudes')
        if (Array.isArray(legacy) && legacy.length > 0) {
          console.log('[useHabitudes] migrating habitudes from localStorage:', legacy.length)
          setHabitudes(legacy)
          push(userId, 'habitudes', legacy)
        }
      }
    }).catch((err) => {
      console.error('[useHabitudes] habitudes pull failed:', err)
      const legacy = legacyLS('axislife_habitudes')
      if (Array.isArray(legacy) && legacy.length > 0) setHabitudes(legacy)
    })

    pull(userId, 'habitude_logs').then((data) => {
      console.log('[useHabitudes] logs fetched:', data)
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        setLogs(data)
      } else {
        const legacy = legacyLS('axislife_habitudes_logs')
        if (legacy && typeof legacy === 'object' && !Array.isArray(legacy)) {
          console.log('[useHabitudes] migrating logs from localStorage')
          setLogs(legacy)
          push(userId, 'habitude_logs', legacy)
        }
      }
    }).catch((err) => {
      console.error('[useHabitudes] logs pull failed:', err)
      const legacy = legacyLS('axislife_habitudes_logs')
      if (legacy && typeof legacy === 'object') setLogs(legacy)
    })
  }, [user]) // eslint-disable-line

  // Push habitudes to Supabase on change
  useEffect(() => {
    if (!habitudesMounted.current) { habitudesMounted.current = true; return }
    if (user?.id) push(user.id, 'habitudes', habitudes)
  }, [habitudes]) // eslint-disable-line

  // Push logs to Supabase on change
  useEffect(() => {
    if (!logsMounted.current) { logsMounted.current = true; return }
    if (user?.id) push(user.id, 'habitude_logs', logs)
  }, [logs]) // eslint-disable-line

  const addHabitude = useCallback((data) => {
    setHabitudes((prev) => [...prev, { ...data, id: uuidv4() }])
  }, [])

  const updateHabitude = useCallback((id, data) => {
    setHabitudes((prev) => prev.map((h) => (h.id === id ? { ...h, ...data } : h)))
  }, [])

  const deleteHabitude = useCallback(async (id) => {
    if (user?.id && supabase) {
      const { error } = await supabase.from('habitudes').delete().eq('id', id)
      if (error) { console.error('[deleteHabitude] error:', error.message); return }
    }
    setHabitudes((prev) => prev.filter((h) => h.id !== id))
  }, [user])

  const toggleLog = useCallback(async (habitudeId, dateKey = todayKey()) => {
    const dayLogs = logs[dateKey] ?? []
    const exists = dayLogs.includes(habitudeId)
    if (exists && user?.id && supabase) {
      const { error } = await supabase.from('habitude_logs')
        .delete()
        .eq('user_id', user.id)
        .eq('habitude_id', habitudeId)
        .eq('date', dateKey)
      if (error) { console.error('[toggleLog] delete error:', error.message); return }
    }
    setLogs((prev) => {
      const dayLogs = prev[dateKey] ?? []
      const exists = dayLogs.includes(habitudeId)
      return {
        ...prev,
        [dateKey]: exists ? dayLogs.filter((id) => id !== habitudeId) : [...dayLogs, habitudeId],
      }
    })
  }, [logs, user]) // eslint-disable-line

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
        if ((logs[key] ?? []).includes(habitudeId)) streak++
        else break
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
