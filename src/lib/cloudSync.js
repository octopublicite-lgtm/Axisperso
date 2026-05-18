import { supabase } from './supabase'

// Logical push/pull key → actual Supabase table name (blob tables)
// Schema expected: (user_id uuid UNIQUE, data jsonb, updated_at timestamptz)
const BLOB_TABLE = {
  objectifs:       'objectifs',
  habitudes:       'habitudes',
  meteo:           'meteo_mentale',
  priorites:       'priorites_jour',
  fortune_actifs:  'fortune_actifs',
  fortune_passifs: 'fortune_passifs',
}

// ─── Blob tables: one JSON row per user ──────────────────────────────────────

function blobPush(userId, table, data) {
  if (!supabase || !userId || data == null) return
  console.log('[push]', table, '→ userId:', userId)
  try {
    supabase
      .from(table)
      .upsert(
        { user_id: userId, data, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )
      .catch((err) => console.error('[push] error:', table, err?.message))
  } catch (err) {
    console.error('[push] sync error:', table, err)
  }
}

async function blobPull(userId, table) {
  if (!supabase || !userId) return null
  console.log('[pull] fetching:', table, '→ userId:', userId)
  try {
    const { data, error } = await supabase
      .from(table)
      .select('data')
      .eq('user_id', userId)
      .maybeSingle()
    console.log('[pull] result:', table, '→', data?.data ?? null, error ? '| error: ' + error.message : '')
    return data?.data ?? null
  } catch (err) {
    console.error('[pull] error:', table, err)
    return null
  }
}

// ─── habitude_logs: individual rows (user_id, habitude_id, date) ─────────────
// Schema expected: (user_id, habitude_id, date) with UNIQUE(user_id, habitude_id, date)

function logsPush(userId, logsMap) {
  if (!supabase || !userId || !logsMap) return
  const rows = []
  for (const [date, ids] of Object.entries(logsMap)) {
    for (const habitude_id of (ids ?? [])) {
      rows.push({ user_id: userId, habitude_id, date })
    }
  }
  if (!rows.length) return
  console.log('[push] habitude_logs →', rows.length, 'rows, userId:', userId)
  try {
    supabase
      .from('habitude_logs')
      .upsert(rows, { onConflict: 'user_id,habitude_id,date' })
      .catch((err) => console.error('[push] habitude_logs error:', err?.message))
  } catch (err) {
    console.error('[push] habitude_logs sync error:', err)
  }
}

async function logsPull(userId) {
  if (!supabase || !userId) {
    console.log('[pull] skipped habitude_logs —', !userId ? 'no userId' : 'no supabase')
    return null
  }
  console.log('[pull] fetching: habitude_logs → userId:', userId)
  try {
    const { data: rows, error } = await supabase
      .from('habitude_logs')
      .select('habitude_id, date')
      .eq('user_id', userId)
    if (error) {
      console.error('[pull] habitude_logs error:', error.message)
      return null
    }
    // Reconstruct { date: [habitude_id, ...] } map
    const map = {}
    for (const row of rows ?? []) {
      if (!map[row.date]) map[row.date] = []
      if (!map[row.date].includes(row.habitude_id)) map[row.date].push(row.habitude_id)
    }
    console.log('[pull] result: habitude_logs →', Object.keys(map).length, 'days')
    return Object.keys(map).length > 0 ? map : null
  } catch (err) {
    console.error('[pull] habitude_logs error:', err)
    return null
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function push(userId, key, data) {
  if (key === 'habitude_logs') {
    logsPush(userId, data)
    return
  }
  const table = BLOB_TABLE[key]
  if (!table) { console.warn('[push] unknown key:', key); return }
  blobPush(userId, table, data)
}

export async function pull(userId, key) {
  if (key === 'habitude_logs') return logsPull(userId)
  const table = BLOB_TABLE[key]
  if (!table) { console.warn('[pull] unknown key:', key); return null }
  return blobPull(userId, table)
}
