import { useCallback, useEffect, useRef } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { push, pull } from '../lib/cloudSync'
import { v4 as uuidv4 } from 'uuid'

export function useObjectifs(userId) {
  const [objectifs, setObjectifs] = useLocalStorage('objectifs', [])
  const mounted = useRef(false)

  // Load from Supabase on login
  useEffect(() => {
    if (!userId) return
    pull(userId, 'objectifs').then((data) => {
      if (Array.isArray(data) && data.length > 0) setObjectifs(data)
    })
  }, [userId]) // eslint-disable-line

  // Push to Supabase on every change (skip initial render)
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return }
    push(userId, 'objectifs', objectifs)
  }, [objectifs]) // eslint-disable-line

  const addObjectif = useCallback((data) => {
    const now = new Date().toISOString()
    const today = now.split('T')[0]
    setObjectifs((prev) => [
      ...prev,
      {
        ...data,
        id: uuidv4(),
        milestones: data.milestones ?? [],
        progressHistory: data.progress > 0 ? [{ date: today, value: data.progress }] : [],
        createdAt: now,
        updatedAt: now,
      },
    ])
  }, [setObjectifs])

  const updateObjectif = useCallback((id, data) => {
    setObjectifs((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o
        const updated = { ...o, ...data, updatedAt: new Date().toISOString() }
        if (data.progress !== undefined && data.progress !== o.progress) {
          const today = new Date().toISOString().split('T')[0]
          const history = o.progressHistory ?? []
          const filtered = history.filter((h) => h.date !== today)
          updated.progressHistory = [...filtered, { date: today, value: data.progress }]
        }
        return updated
      })
    )
  }, [setObjectifs])

  const deleteObjectif = useCallback((id) => {
    setObjectifs((prev) => prev.filter((o) => o.id !== id))
  }, [setObjectifs])

  const toggleMilestone = useCallback((objectifId, milestoneId) => {
    setObjectifs((prev) =>
      prev.map((o) =>
        o.id === objectifId
          ? {
              ...o,
              milestones: o.milestones.map((m) =>
                m.id === milestoneId ? { ...m, done: !m.done } : m
              ),
              updatedAt: new Date().toISOString(),
            }
          : o
      )
    )
  }, [setObjectifs])

  return { objectifs, addObjectif, updateObjectif, deleteObjectif, toggleMilestone }
}
