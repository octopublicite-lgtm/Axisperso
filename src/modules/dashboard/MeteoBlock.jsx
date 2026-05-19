import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { supabase } from '../../lib/supabase'
import { todayKey } from '../../utils/dates'
import { METEO_OPTIONS } from '../../utils/constants'

export default function MeteoBlock() {
  const { user } = useAuth()
  const { addToast } = useApp()
  const today = todayKey()
  const [allMeteo, setAllMeteo] = useState({})

  useEffect(() => {
    if (!user || !supabase) return
    ;(async () => {
      const { data, error } = await supabase
        .from('meteo_mentale').select('*').eq('user_id', user.id).maybeSingle()
      if (error) { addToast('Erreur de chargement météo', 'error'); return }
      if (data?.data) setAllMeteo(data.data)
    })()
  }, [user]) // eslint-disable-line

  const meteo = allMeteo[today] ?? null

  async function setMeteo(emoji) {
    if (!supabase || !user?.id) return
    const updated = { ...allMeteo, [today]: emoji }
    const { error } = await supabase.from('meteo_mentale').upsert(
      { user_id: user.id, data: updated, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    if (error) { addToast('Erreur de sauvegarde — réessayez', 'error'); return }
    setAllMeteo(updated)
  }

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
