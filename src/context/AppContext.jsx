import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useObjectifs } from '../hooks/useObjectifs'
import { useHabitudes } from '../hooks/useHabitudes'
import { usePlanning } from '../hooks/usePlanning'
import { todayKey } from '../utils/dates'
import { SEED_DATA, DOMAINS } from '../utils/constants'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { v4 as uuidv4 } from 'uuid'

const ALL_DOMAIN_IDS = DOMAINS.map((d) => d.id)

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const { session } = useAuth()
  const [settings, setSettings] = useLocalStorage('settings', {
    nom: 'Amine',
    heureRituel: '07:00',
    domainesActifs: ALL_DOMAIN_IDS,
  })

  const userId = session?.user?.id
  const [toasts, setToasts] = useState([])
  const objectifsHook = useObjectifs(userId)
  const habitudesHook = useHabitudes(userId)
  const planningHook = usePlanning()

  // Migrate mindset/lifestyle → mindstyle (one-time)
  const [migrated, setMigrated] = useLocalStorage('migrated_mindstyle', false)
  useEffect(() => {
    if (migrated) return
    const migrateKey = (key) => {
      const raw = localStorage.getItem(key)
      if (!raw) return
      try {
        const data = JSON.parse(raw)
        const migrated = data.map((item) => {
          if (item.domaine === 'mindset' || item.domaine === 'lifestyle') {
            return { ...item, domaine: 'mindstyle' }
          }
          return item
        })
        localStorage.setItem(key, JSON.stringify(migrated))
      } catch {}
    }
    migrateKey('axislife_objectifs')
    migrateKey('axislife_habitudes')
    // Migrate domainesActifs in settings
    const rawSettings = localStorage.getItem('settings')
    if (rawSettings) {
      try {
        const s = JSON.parse(rawSettings)
        if (s.domainesActifs) {
          s.domainesActifs = s.domainesActifs
            .filter((d) => d !== 'mindset' && d !== 'lifestyle')
          if (!s.domainesActifs.includes('mindstyle')) s.domainesActifs.push('mindstyle')
          localStorage.setItem('settings', JSON.stringify(s))
        }
      } catch {}
    }
    setMigrated(true)
  }, [migrated, setMigrated])

  // Migration: fix double-prefixed fortune keys (axislife_axislife_* → axislife_*)
  const [migratedFortuneKeys, setMigratedFortuneKeys] = useLocalStorage('migrated_fortune_keys', false)
  useEffect(() => {
    if (migratedFortuneKeys) return
    const pairs = [['axislife_axislife_fortune_actifs', 'axislife_fortune_actifs'], ['axislife_axislife_fortune_passifs', 'axislife_fortune_passifs']]
    pairs.forEach(([oldKey, newKey]) => {
      const raw = localStorage.getItem(oldKey)
      if (raw && !localStorage.getItem(newKey)) {
        localStorage.setItem(newKey, raw)
        localStorage.removeItem(oldKey)
      }
    })
    setMigratedFortuneKeys(true)
  }, [migratedFortuneKeys, setMigratedFortuneKeys])

  // Migration: add 6 new domain IDs to existing domainesActifs arrays
  const [migratedDomainsV2, setMigratedDomainsV2] = useLocalStorage('migrated_domains_v2', false)
  useEffect(() => {
    if (migratedDomainsV2) return
    const raw = localStorage.getItem('axislife_settings')
    if (raw) {
      try {
        const s = JSON.parse(raw)
        if (Array.isArray(s.domainesActifs)) {
          const newIds = ['creativite', 'famille', 'voyage', 'impact', 'sante_mentale', 'reseau', 'etudes']
          let changed = false
          newIds.forEach((id) => {
            if (!s.domainesActifs.includes(id)) { s.domainesActifs.push(id); changed = true }
          })
          if (changed) localStorage.setItem('axislife_settings', JSON.stringify(s))
        }
      } catch {}
    }
    setMigratedDomainsV2(true)
  }, [migratedDomainsV2, setMigratedDomainsV2])

  // Seed data on first launch
  const [seeded, setSeeded] = useLocalStorage('seeded', false)
  useEffect(() => {
    if (!seeded) {
      const now = new Date().toISOString()
      const objectifs = SEED_DATA.objectifs.map((o) => ({
        ...o,
        id: uuidv4(),
        milestones: (o.milestones ?? []).map((m) => ({ ...m, id: uuidv4() })),
        createdAt: now,
        updatedAt: now,
      }))
      localStorage.setItem('axislife_objectifs', JSON.stringify(objectifs))

      const habitudes = SEED_DATA.habitudes.map((h) => ({ ...h, id: uuidv4(), createdAt: now }))
      localStorage.setItem('axislife_habitudes', JSON.stringify(habitudes))

      const etapes = SEED_DATA.rituel.map((e, i) => ({ ...e, id: uuidv4(), ordre: i }))
      localStorage.setItem('axislife_rituel', JSON.stringify({ etapes, completions: {} }))

      setSeeded(true)
      window.location.reload()
    }
  }, [seeded, setSeeded])

  // Daily reset
  const [lastDate, setLastDate] = useLocalStorage('last_date', '')
  useEffect(() => {
    const today = todayKey()
    if (lastDate && lastDate !== today) {
      // Reset daily priorities — they are date-keyed so nothing to do explicitly
    }
    setLastDate(today)
  }, [lastDate, setLastDate])

  const addToast = useCallback((message, type = 'success') => {
    const id = uuidv4()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2500)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // On login, clear stale device-local data so Supabase is the source of truth
  useEffect(() => {
    if (!userId) return
    const timer = setTimeout(() => {
      const dataKeys = [
        'axislife_objectifs', 'axislife_habitudes', 'axislife_habitudes_logs',
        'axislife_fortune_actifs', 'axislife_fortune_passifs',
        'axislife_all_meteo', 'axislife_all_priorites',
      ]
      dataKeys.forEach((k) => localStorage.removeItem(k))
    }, 5000)
    return () => clearTimeout(timer)
  }, [userId])

  // Load active_domains from Supabase profile when session is available
  useEffect(() => {
    if (!session?.user?.id) return
    supabase.from('profiles').select('active_domains').eq('id', session.user.id).single()
      .then(({ data }) => {
        if (data?.active_domains) {
          setSettings((prev) => ({ ...prev, domainesActifs: data.active_domains }))
        }
      })
      .catch(() => {})
  }, [session?.user?.id, setSettings])

  const saveActiveDomains = useCallback(async (ids) => {
    setSettings((prev) => ({ ...prev, domainesActifs: ids }))
    if (session?.user?.id) {
      supabase.from('profiles').upsert({ id: session.user.id, active_domains: ids }).catch(() => {})
    }
    addToast('Préférences sauvegardées')
  }, [session?.user?.id, addToast, setSettings])

  const exportData = useCallback(() => {
    const data = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith('axislife_')) {
        try { data[key] = JSON.parse(localStorage.getItem(key)) } catch { data[key] = localStorage.getItem(key) }
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `axis-life-export-${todayKey()}.json`
    a.click()
    URL.revokeObjectURL(url)
    addToast('Données exportées avec succès')
  }, [addToast])

  const importData = useCallback((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        Object.entries(data).forEach(([key, value]) => {
          localStorage.setItem(key, JSON.stringify(value))
        })
        addToast('Données importées avec succès')
        setTimeout(() => window.location.reload(), 500)
      } catch {
        addToast('Erreur lors de l\'import', 'error')
      }
    }
    reader.readAsText(file)
  }, [addToast])

  const resetAll = useCallback(() => {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith('axislife_')) keys.push(key)
    }
    keys.forEach((k) => localStorage.removeItem(k))
    window.location.reload()
  }, [])

  return (
    <AppContext.Provider value={{
      settings, setSettings, saveActiveDomains,
      ...objectifsHook,
      ...habitudesHook,
      ...planningHook,
      toasts, addToast, removeToast,
      exportData, importData, resetAll,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
