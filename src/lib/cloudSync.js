import { supabase } from './supabase'

// ─── Objectifs ───────────────────────────────────────────────────────────────
// DB columns: id, user_id, domaine_id, titre, description, horizon, statut,
//             progress, kpi, notes, created_at, updated_at
// milestones + progressHistory are encoded into the notes column as JSON.

function toDbObjectif(o, userId) {
  let notesEncoded = ''
  try {
    notesEncoded = JSON.stringify({
      text: typeof o.notes === 'string' ? o.notes : '',
      milestones: o.milestones ?? [],
      progressHistory: o.progressHistory ?? [],
    })
  } catch { notesEncoded = '' }

  return {
    id: o.id,
    user_id: userId,
    domaine_id: o.domaine ?? o.domaine_id ?? '',
    titre: o.titre ?? '',
    description: o.description ?? '',
    horizon: o.horizon ?? '',
    statut: o.statut ?? 'actif',
    progress: o.progress ?? 0,
    kpi: o.kpi ?? '',
    notes: notesEncoded,
    updated_at: new Date().toISOString(),
  }
}

function fromDbObjectif(row) {
  let notes = '', milestones = [], progressHistory = []
  try {
    const parsed = JSON.parse(row.notes ?? '')
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      notes = parsed.text ?? ''
      milestones = parsed.milestones ?? []
      progressHistory = parsed.progressHistory ?? []
    } else {
      notes = row.notes ?? ''
    }
  } catch {
    notes = row.notes ?? ''
  }
  return {
    id: row.id,
    domaine: row.domaine_id,
    titre: row.titre,
    description: row.description ?? '',
    horizon: row.horizon ?? '',
    statut: row.statut,
    progress: row.progress ?? 0,
    kpi: row.kpi ?? '',
    notes,
    milestones,
    progressHistory,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function objectifsPush(userId, objectifs) {
  if (!supabase || !userId || !Array.isArray(objectifs) || objectifs.length === 0) return
  const rows = objectifs.map((o) => toDbObjectif(o, userId))
  try {
    const { error } = await supabase
      .from('objectifs')
      .upsert(rows, { onConflict: 'id' })
    if (error) console.error('[push] objectifs error:', error.message)
  } catch (err) {
    console.error('[push] objectifs sync error:', err)
  }
}

async function objectifsPull(userId) {
  if (!supabase || !userId) return null
  try {
    const { data, error } = await supabase
      .from('objectifs')
      .select('*')
      .eq('user_id', userId)
    if (error) { console.error('[pull] objectifs error:', error.message); return null }
    if (!data || data.length === 0) return null
    return data.map(fromDbObjectif)
  } catch (err) {
    console.error('[pull] objectifs error:', err)
    return null
  }
}

// ─── Habitudes ───────────────────────────────────────────────────────────────
// DB columns: id, user_id, domaine_id, titre, description, icon, frequence,
//             actif, created_at

function toDbHabitude(h, userId) {
  return {
    id: h.id,
    user_id: userId,
    domaine_id: h.domaine ?? h.domaine_id ?? '',
    titre: h.titre ?? '',
    description: h.description ?? '',
    icon: h.icon ?? '',
    frequence: h.frequence ?? 'Quotidien',
    actif: h.actif !== false,
  }
}

function fromDbHabitude(row) {
  return {
    id: row.id,
    domaine: row.domaine_id,
    titre: row.titre,
    description: row.description ?? '',
    icon: row.icon ?? '',
    frequence: row.frequence ?? 'Quotidien',
    actif: row.actif !== false,
    createdAt: row.created_at,
  }
}

async function habitudesPush(userId, habitudes) {
  if (!supabase || !userId || !Array.isArray(habitudes) || habitudes.length === 0) return
  const rows = habitudes.map((h) => toDbHabitude(h, userId))
  try {
    const { error } = await supabase
      .from('habitudes')
      .upsert(rows, { onConflict: 'id' })
    if (error) console.error('[push] habitudes error:', error.message)
  } catch (err) {
    console.error('[push] habitudes sync error:', err)
  }
}

async function habitudesPull(userId) {
  if (!supabase || !userId) return null
  try {
    const { data, error } = await supabase
      .from('habitudes')
      .select('*')
      .eq('user_id', userId)
    if (error) { console.error('[pull] habitudes error:', error.message); return null }
    if (!data || data.length === 0) return null
    return data.map(fromDbHabitude)
  } catch (err) {
    console.error('[pull] habitudes error:', err)
    return null
  }
}

// ─── habitude_logs ───────────────────────────────────────────────────────────
// DB columns: id, habitude_id, user_id, date, created_at
// UNIQUE(user_id, habitude_id, date)

async function logsPush(userId, logsMap) {
  if (!supabase || !userId || !logsMap) return
  const rows = []
  for (const [date, ids] of Object.entries(logsMap)) {
    for (const habitude_id of (ids ?? [])) {
      rows.push({ user_id: userId, habitude_id, date })
    }
  }
  if (!rows.length) return
  try {
    const { error } = await supabase
      .from('habitude_logs')
      .upsert(rows, { onConflict: 'user_id,habitude_id,date' })
    if (error) console.error('[push] habitude_logs error:', error.message)
  } catch (err) {
    console.error('[push] habitude_logs sync error:', err)
  }
}

async function logsPull(userId) {
  if (!supabase || !userId) return null
  try {
    const { data: rows, error } = await supabase
      .from('habitude_logs')
      .select('habitude_id, date')
      .eq('user_id', userId)
    if (error) { console.error('[pull] habitude_logs error:', error.message); return null }
    const map = {}
    for (const row of rows ?? []) {
      if (!map[row.date]) map[row.date] = []
      if (!map[row.date].includes(row.habitude_id)) map[row.date].push(row.habitude_id)
    }
    return Object.keys(map).length > 0 ? map : null
  } catch (err) {
    console.error('[pull] habitude_logs error:', err)
    return null
  }
}

// ─── Blob tables (meteo_mentale, priorites_jour, fortune_actifs, fortune_passifs)
// Schema: (user_id uuid UNIQUE, data jsonb, updated_at timestamptz)

async function blobPush(userId, table, data) {
  if (!supabase || !userId || data == null) return
  try {
    const { error } = await supabase
      .from(table)
      .upsert(
        { user_id: userId, data, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )
    if (error) console.error('[push] error:', table, error.message)
  } catch (err) {
    console.error('[push] sync error:', table, err)
  }
}

async function blobPull(userId, table) {
  if (!supabase || !userId) return null
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) { console.error('[pull] error:', table, error.message); return null }
    return data?.data ?? null
  } catch (err) {
    console.error('[pull] error:', table, err)
    return null
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

const BLOB_TABLE = {
  meteo:           'meteo_mentale',
  priorites:       'priorites_jour',
  fortune_actifs:  'fortune_actifs',
  fortune_passifs: 'fortune_passifs',
}

export function push(userId, key, data) {
  switch (key) {
    case 'objectifs':     objectifsPush(userId, data); return
    case 'habitudes':     habitudesPush(userId, data); return
    case 'habitude_logs': logsPush(userId, data); return
  }
  const table = BLOB_TABLE[key]
  if (!table) { console.warn('[push] unknown key:', key); return }
  blobPush(userId, table, data)
}

export async function pull(userId, key) {
  switch (key) {
    case 'objectifs':     return objectifsPull(userId)
    case 'habitudes':     return habitudesPull(userId)
    case 'habitude_logs': return logsPull(userId)
  }
  const table = BLOB_TABLE[key]
  if (!table) { console.warn('[pull] unknown key:', key); return null }
  return blobPull(userId, table)
}
