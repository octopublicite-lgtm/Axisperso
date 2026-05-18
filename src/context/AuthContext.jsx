import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = still loading
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (!supabase) {
      setSession(null)
      return
    }

    let resolved = false

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true
        setTimedOut(true)
        setSession(null)
      }
    }, 5000)

    supabase.auth.getSession()
      .then(({ data }) => {
        if (!resolved) {
          resolved = true
          clearTimeout(timer)
          setSession(data.session ?? null)
        }
      })
      .catch(() => {
        if (!resolved) {
          resolved = true
          clearTimeout(timer)
          setTimedOut(true)
          setSession(null)
        }
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!resolved) {
        resolved = true
        clearTimeout(timer)
      }
      setSession(s ?? null)
    })

    return () => {
      resolved = true
      clearTimeout(timer)
      subscription.unsubscribe()
    }
  }, [])

  const user = session?.user ?? null

  // Block ALL child components from mounting until the session is confirmed.
  // This guarantees hooks never race against an unresolved auth state.
  if (session === undefined) {
    return <div style={{ minHeight: '100vh' }} />
  }

  return (
    <AuthContext.Provider value={{ session, user, loading: false, timedOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
