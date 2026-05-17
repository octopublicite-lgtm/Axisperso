import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    let resolved = false

    // 5-second hard timeout — never freeze the UI waiting for Supabase
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

  return (
    <AuthContext.Provider value={{ session, loading: session === undefined, timedOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
