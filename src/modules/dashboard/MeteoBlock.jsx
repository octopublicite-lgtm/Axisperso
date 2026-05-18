import { useEffect, useRef } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useAuth } from '../../context/AuthContext'
import { push, pull } from '../../lib/cloudSync'
import { todayKey } from '../../utils/dates'
import { METEO_OPTIONS } from '../../utils/constants'

export default function MeteoBlock() {
  const { session } = useAuth()
  const userId = session?.user?.id
  const today = todayKey()
  const [allMeteo, setAllMeteo] = useLocalStorage('all_meteo', {})
  const mounted = useRef(false)

  // Load from Supabase on login
  useEffect(() => {
    if (!userId) return
    pull(userId, 'meteo').then((data) => {
      if (data && typeof data === 'object') setAllMeteo(data)
    })
  }, [userId]) // eslint-disable-line

  // Push to Supabase on change
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return }
    push(userId, 'meteo', allMeteo)
  }, [allMeteo]) // eslint-disable-line

  const meteo = allMeteo[today] ?? null
  const setMeteo = (emoji) => setAllMeteo((prev) => ({ ...prev, [today]: emoji }))

  return (
    <div className="mood-row">
      <span className="mood-label">Météo mentale</span>
      <div className="mood-btns">
        {METEO_OPTIONS.map((opt) => (
          <button
            key={opt.emoji}
            onClick={() => setMeteo(opt.emoji)}
            aria-label={opt.label}
            className={`mood-btn${meteo === opt.emoji ? ' active' : ''}`}
            title={opt.label}
          >
            {opt.emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
