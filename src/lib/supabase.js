import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = (url && key) ? createClient(url, key) : null

export function withTimeout(promise, ms = 8000) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('supabase_timeout')), ms)
  )
  return Promise.race([promise, timeout])
}
