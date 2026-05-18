import { useState, useCallback, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { push, pull } from '../lib/cloudSync'
import { supabase } from '../lib/supabase'
import { v4 as uuidv4 } from 'uuid'

function legacyLS(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') } catch { return null }
}

export function useObjectifs() {
  const { user } = useAuth()
  const [objectifs, setObjectifs] = useState([])
  const mounted = useRef(false)

  // Load from Supabase once user is confirmed; fall back to localStorage for migration
  useEffect(() => {
    if (!user) return
    const userId = user.id
    console.log('[useObjectifs] fetching for userId:', userId)
    pull(userId, 'objectifs').then((data) => {
      console.log('[useObjectifs] fetched:', data)
      if (Array.isArray(data) && data.length > 0) {
        setObjectifs(data)
      } else {
        const legacy = legacyLS('axislife_objectifs')
        if (Array.isArray(legacy) && legacy.length > 0) {
          console.log('[useObjectifs] migrating from localStorage:', legacy.length, 'items')
          setObjectifs(legacy)
          push(userId, 'objectifs', legacy)
        }
      }
    }).catch((err) => {
      console.error('[useObjectifs] pull failed:', err)
      const legacy = legacyLS('axislife_objectifs')
      if (Array.isArray(legacy) && legacy.length > 0) setObjectifs(legacy)
    })
  }, [user]) // eslint-disable-line

  // Push to Supabase on every change (skip the initial empty render)
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return }
    if (user?.id) push(user.id, 'objectifs', objectifs)
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
  }, [])

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
  }, [])

  const deleteObjectif = useCallback(async (id) => {
    if (user?.id && supabase) {
      const { error } = await supabase.from('objectifs').delete().eq('id', id)
      if (error) { console.error('[deleteObjectif] error:', error.message); return }
    }
    setObjectifs((prev) => prev.filter((o) => o.id !== id))
  }, [user])

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
  }, [])

  return { objectifs, addObjectif, updateObjectif, deleteObjectif, toggleMilestone }
}
