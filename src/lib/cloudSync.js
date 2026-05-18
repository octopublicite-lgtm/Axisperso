import { supabase } from './supabase'

export function push(userId, key, data) {
  if (!userId || !supabase || data === null || data === undefined) return
  try {
    supabase
      .from('user_data')
      .upsert({ user_id: userId, key, data, updated_at: new Date().toISOString() }, { onConflict: 'user_id,key' })
      .catch(() => {})
  } catch {}
}

export async function pull(userId, key) {
  if (!userId || !supabase) return null
  try {
    const { data } = await supabase
      .from('user_data')
      .select('data')
      .eq('user_id', userId)
      .eq('key', key)
      .maybeSingle()
    return data?.data ?? null
  } catch {
    return null
  }
}
