import { useState, useCallback, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { todayKey } from '../utils/dates'

export function usePlanning() {
  const { user } = useAuth()
  const [etapes, setEtapes] = useState([])
  const [rituelLogs, setRituelLogs] = useState([])
  const [tachesRaw, setTachesRaw] = useState([])
  const [timeblocks, setTimeblocks] = useState([])

  useEffect(() => {
    if (!user || !supabase) return
    ;(async () => {
      const [
        { data: etapesData },
        { data: logsData },
        { data: tachesData },
        { data: tbData },
      ] = await Promise.all([
        supabase.from('rituel_etapes').select('*').eq('user_id', user.id).order('ordre'),
        supabase.from('rituel_logs').select('*').eq('user_id', user.id),
        supabase.from('taches_jour').select('*').eq('user_id', user.id).order('ordre'),
        supabase.from('time_blocks').select('*').eq('user_id', user.id),
      ])
      if (etapesData) setEtapes(etapesData)
      if (logsData) setRituelLogs(logsData)
      if (tachesData) setTachesRaw(tachesData)
      if (tbData) setTimeblocks(tbData)
    })()
  }, [user]) // eslint-disable-line

  const rituel = useMemo(() => {
    const completions = {}
    rituelLogs.forEach((log) => {
      if (!completions[log.date]) completions[log.date] = []
      completions[log.date].push(log.etape_id)
    })
    return { etapes, completions }
  }, [etapes, rituelLogs])

  const tachesMap = useMemo(() => {
    const map = {}
    tachesRaw.forEach((t) => {
      if (!map[t.date]) map[t.date] = []
      map[t.date].push(t)
    })
    return map
  }, [tachesRaw])

  const addEtape = useCallback(async (data) => {
    if (!supabase || !user?.id) return
    const { data: row, error } = await supabase.from('rituel_etapes')
      .insert({ user_id: user.id, ordre: etapes.length, ...data })
      .select('*').single()
    if (error) { console.error('[addEtape]', error.message); return }
    setEtapes((prev) => [...prev, row])
  }, [user, etapes])

  const removeEtape = useCallback(async (id) => {
    if (!supabase || !user?.id) return
    const { error } = await supabase.from('rituel_etapes').delete().eq('id', id)
    if (error) { console.error('[removeEtape]', error.message); return }
    setEtapes((prev) => prev.filter((e) => e.id !== id))
  }, [user])

  const toggleEtapeCompletion = useCallback(async (id, dateKey = todayKey()) => {
    if (!supabase || !user?.id) return
    const existingLog = rituelLogs.find((l) => l.etape_id === id && l.date === dateKey)
    if (existingLog) {
      const { error } = await supabase.from('rituel_logs').delete().eq('id', existingLog.id)
      if (error) { console.error('[toggleEtapeCompletion] delete', error.message); return }
      setRituelLogs((prev) => prev.filter((l) => l.id !== existingLog.id))
    } else {
      const { data: row, error } = await supabase.from('rituel_logs')
        .insert({ user_id: user.id, etape_id: id, date: dateKey })
        .select('*').single()
      if (error) { console.error('[toggleEtapeCompletion] insert', error.message); return }
      setRituelLogs((prev) => [...prev, row])
    }
  }, [user, rituelLogs])

  const isEtapeComplete = useCallback(
    (id, dateKey = todayKey()) => rituelLogs.some((l) => l.etape_id === id && l.date === dateKey),
    [rituelLogs]
  )

  const reorderEtapes = useCallback(async (newEtapes) => {
    if (!supabase || !user?.id) return
    setEtapes(newEtapes)
    await Promise.all(
      newEtapes.map((e, i) => supabase.from('rituel_etapes').update({ ordre: i }).eq('id', e.id))
    )
  }, [user])

  const getTaches = useCallback((dateKey = todayKey()) => tachesMap[dateKey] ?? [], [tachesMap])

  const addTache = useCallback(async (data, dateKey = todayKey()) => {
    if (!supabase || !user?.id) return
    const ordre = (tachesMap[dateKey] ?? []).length
    const { data: row, error } = await supabase.from('taches_jour')
      .insert({ user_id: user.id, date: dateKey, done: false, ordre, ...data })
      .select('*').single()
    if (error) { console.error('[addTache]', error.message); return }
    setTachesRaw((prev) => [...prev, row])
  }, [user, tachesMap])

  const updateTache = useCallback(async (id, data) => {
    if (!supabase || !user?.id) return
    const { error } = await supabase.from('taches_jour').update(data).eq('id', id)
    if (error) { console.error('[updateTache]', error.message); return }
    setTachesRaw((prev) => prev.map((t) => t.id === id ? { ...t, ...data } : t))
  }, [user])

  const deleteTache = useCallback(async (id) => {
    if (!supabase || !user?.id) return
    const { error } = await supabase.from('taches_jour').delete().eq('id', id)
    if (error) { console.error('[deleteTache]', error.message); return }
    setTachesRaw((prev) => prev.filter((t) => t.id !== id))
  }, [user])

  const setTachesForDay = useCallback(async (dateKey, newTaches) => {
    if (!supabase || !user?.id) return
    setTachesRaw((prev) => {
      const others = prev.filter((t) => t.date !== dateKey)
      return [...others, ...newTaches.map((t, i) => ({ ...t, date: dateKey, ordre: i }))]
    })
    await Promise.all(
      newTaches.map((t, i) => supabase.from('taches_jour').update({ ordre: i }).eq('id', t.id))
    )
  }, [user])

  const addTimeblock = useCallback(async (data) => {
    if (!supabase || !user?.id) return
    const { data: row, error } = await supabase.from('time_blocks')
      .insert({ user_id: user.id, ...data })
      .select('*').single()
    if (error) { console.error('[addTimeblock]', error.message); return }
    setTimeblocks((prev) => [...prev, row])
  }, [user])

  const updateTimeblock = useCallback(async (id, data) => {
    if (!supabase || !user?.id) return
    const { error } = await supabase.from('time_blocks').update(data).eq('id', id)
    if (error) { console.error('[updateTimeblock]', error.message); return }
    setTimeblocks((prev) => prev.map((tb) => tb.id === id ? { ...tb, ...data } : tb))
  }, [user])

  const deleteTimeblock = useCallback(async (id) => {
    if (!supabase || !user?.id) return
    const { error } = await supabase.from('time_blocks').delete().eq('id', id)
    if (error) { console.error('[deleteTimeblock]', error.message); return }
    setTimeblocks((prev) => prev.filter((tb) => tb.id !== id))
  }, [user])

  return {
    rituel,
    addEtape,
    removeEtape,
    toggleEtapeCompletion,
    isEtapeComplete,
    reorderEtapes,
    tachesMap,
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
