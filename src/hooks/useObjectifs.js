import { useState, useCallback, useEffect, useRef } from 'react'
import { push, pull } from '../lib/cloudSync'
import { v4 as uuidv4 } from 'uuid'

function legacyLS(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') } catch { return null }
}

export function useObjectifs(userId) {
  const [objectifs, setObjectifs] = useState([])
  const mounted = useRef(false)

  // Load from Supabase on login; fall back to localStorage for initial migration
  useEffect(() => {
    if (!userId) return
    pull(userId, 'objectifs').then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setObjectifs(data)
      } else {
        const legacy = legacyLS('axislife_objectifs')
        if (Array.isArray(legacy) && legacy.length > 0) {
          setObjectifs(legacy)
          push(userId, 'objectifs', legacy)
        }
      }
    }).catch(() => {
      const legacy = legacyLS('axislife_objectifs')
      if (Array.isArray(legacy) && legacy.length > 0) setObjectifs(legacy)
    })
  }, [userId]) // eslint-disable-line

  // Push to Supabase whenever objectifs change (skip first render)
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
