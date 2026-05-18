import { supabase } from './supabase'

export function push(userId, key, data) {
  if (!userId || !supabase || data === null || data === undefined) return
  console.log('[push]', key, '→ userId:', userId)
  try {
    supabase
      .from('user_data')
      .upsert({ user_id: userId, key, data, updated_at: new Date().toISOString() }, { onConflict: 'user_id,key' })
      .catch((err) => console.error('[push] error:', key, err))
  } catch (err) {
    console.error('[push] sync error:', key, err)
  }
}

export async function pull(userId, key) {
  if (!userId || !supabase) {
    console.log('[pull] skipped —', !userId ? 'no userId' : 'no supabase client')
    return null
  }
  console.log('[pull] fetching:', key, '→ userId:', userId)
  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('data')
      .eq('user_id', userId)
      .eq('key', key)
      .maybeSingle()
    console.log('[pull] result:', key, '→', data?.data ?? null, error ? '| error:' + error.message : '')
    return data?.data ?? null
  } catch (err) {
    console.error('[pull] error:', key, err)
    return null
  }
}
