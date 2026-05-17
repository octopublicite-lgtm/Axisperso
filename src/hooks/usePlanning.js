import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { todayKey } from '../utils/dates'
import { v4 as uuidv4 } from 'uuid'

export function usePlanning() {
  const [rituel, setRituel] = useLocalStorage('rituel', { etapes: [], completions: {} })
  const [taches, setTaches] = useLocalStorage('taches', {})
  const [timeblocks, setTimeblocks] = useLocalStorage('timeblocks', [])

  // Rituel
  const addEtape = useCallback((data) => {
    setRituel((prev) => ({
      ...prev,
      etapes: [...prev.etapes, { ...data, id: uuidv4(), ordre: prev.etapes.length }],
    }))
  }, [setRituel])

  const removeEtape = useCallback((id) => {
    setRituel((prev) => ({
      ...prev,
      etapes: prev.etapes.filter((e) => e.id !== id),
    }))
  }, [setRituel])

  const toggleEtapeCompletion = useCallback((id, dateKey = todayKey()) => {
    setRituel((prev) => {
      const completions = prev.completions ?? {}
      const dayCompletions = completions[dateKey] ?? []
      const exists = dayCompletions.includes(id)
      return {
        ...prev,
        completions: {
          ...completions,
          [dateKey]: exists ? dayCompletions.filter((i) => i !== id) : [...dayCompletions, id],
        },
      }
    })
  }, [setRituel])

  const isEtapeComplete = useCallback(
    (id, dateKey = todayKey()) => (rituel.completions?.[dateKey] ?? []).includes(id),
    [rituel]
  )

  const reorderEtapes = useCallback((newEtapes) => {
    setRituel((prev) => ({ ...prev, etapes: newEtapes }))
  }, [setRituel])

  // Tâches du jour
  const getTaches = useCallback((dateKey = todayKey()) => taches[dateKey] ?? [], [taches])

  const addTache = useCallback((data, dateKey = todayKey()) => {
    setTaches((prev) => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] ?? []), { ...data, id: uuidv4(), done: false }],
    }))
  }, [setTaches])

  const updateTache = useCallback((id, data, dateKey = todayKey()) => {
    setTaches((prev) => ({
      ...prev,
      [dateKey]: (prev[dateKey] ?? []).map((t) => (t.id === id ? { ...t, ...data } : t)),
    }))
  }, [setTaches])

  const deleteTache = useCallback((id, dateKey = todayKey()) => {
    setTaches((prev) => ({
      ...prev,
      [dateKey]: (prev[dateKey] ?? []).filter((t) => t.id !== id),
    }))
  }, [setTaches])

  const setTachesForDay = useCallback((dateKey, newTaches) => {
    setTaches((prev) => ({ ...prev, [dateKey]: newTaches }))
  }, [setTaches])

  // Time blocks récurrents
  const addTimeblock = useCallback((data) => {
    setTimeblocks((prev) => [...prev, { ...data, id: uuidv4() }])
  }, [setTimeblocks])

  const updateTimeblock = useCallback((id, data) => {
    setTimeblocks((prev) => prev.map((tb) => (tb.id === id ? { ...tb, ...data } : tb)))
  }, [setTimeblocks])

  const deleteTimeblock = useCallback((id) => {
    setTimeblocks((prev) => prev.filter((tb) => tb.id !== id))
  }, [setTimeblocks])

  return {
    rituel,
    addEtape,
    removeEtape,
    toggleEtapeCompletion,
    isEtapeComplete,
    reorderEtapes,
    tachesMap: taches,
    getTaches,
    addTache,
    updateTache,
    deleteTache,
    setTachesForDay,
    timeblocks,
    addTimeblock,
    updateTimeblock,
    deleteTimeblock,
  }
}
