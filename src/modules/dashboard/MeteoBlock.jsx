import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { push, pull } from '../../lib/cloudSync'
import { todayKey } from '../../utils/dates'
import { METEO_OPTIONS } from '../../utils/constants'

function legacyLS(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') } catch { return null }
}

export default function MeteoBlock() {
  const { user } = useAuth()
  const today = todayKey()
  const [allMeteo, setAllMeteo] = useState({})
  const mounted = useRef(false)

  useEffect(() => {
    if (!user) return
    const userId = user.id
    console.log('[MeteoBlock] fetching for userId:', userId)
    pull(userId, 'meteo').then((data) => {
      console.log('[MeteoBlock] fetched:', data)
      if (data && typeof data === 'object') {
        setAllMeteo(data)
      } else {
        const legacy = legacyLS('axislife_all_meteo')
        if (legacy && typeof legacy === 'object') {
          setAllMeteo(legacy)
          push(userId, 'meteo', legacy)
        }
      }
    }).catch((err) => {
      console.error('[MeteoBlock] pull failed:', err)
      const legacy = legacyLS('axislife_all_meteo')
      if (legacy && typeof legacy === 'object') setAllMeteo(legacy)
    })
  }, [user]) // eslint-disable-line

  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return }
    if (user?.id) push(user.id, 'meteo', allMeteo)
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
