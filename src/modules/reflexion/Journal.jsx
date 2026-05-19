import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { supabase } from '../../lib/supabase'
import { todayKey, addDays } from '../../utils/dates'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Journal() {
  const { user } = useAuth()
  const { addToast } = useApp()
  const [currentDate, setCurrentDate] = useState(todayKey())
  const [localContent, setLocalContent] = useState('')
  const [saved, setSaved] = useState(false)
  const saveTimer = useRef(null)

  useEffect(() => {
    if (!user || !supabase) return
    setLocalContent('')
    ;(async () => {
      const { data, error } = await supabase
        .from('journal')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', currentDate)
        .maybeSingle()
      if (error) { addToast('Erreur de chargement journal', 'error'); return }
      setLocalContent(data?.contenu ?? '')
    })()
  }, [user, currentDate]) // eslint-disable-line

  async function saveToSupabase(val) {
    if (!supabase || !user?.id) return
    const { error } = await supabase.from('journal').upsert(
      { user_id: user.id, date: currentDate, contenu: val, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,date' }
    )
    if (error) { addToast('Erreur de sauvegarde — réessayez', 'error'); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleChange(e) {
    const val = e.target.value
    setLocalContent(val)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveToSupabase(val), 500)
  }

  const isToday = currentDate === todayKey()
  const wordCount = localContent.trim() ? localContent.trim().split(/\s+/).length : 0
  const displayDate = new Date(currentDate + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="journal-nav">
        <button onClick={() => setCurrentDate((d) => addDays(d, -1))} aria-label="Jour précédent" className="btn btn-ghost btn-sm" style={{ padding: '6px 8px' }}>
          <ChevronLeft size={16} />
        </button>
        <span className="journal-date">{displayDate}</span>
        <button onClick={() => setCurrentDate((d) => addDays(d, 1))} disabled={isToday} aria-label="Jour suivant" className="btn btn-ghost btn-sm" style={{ padding: '6px 8px' }}>
          <ChevronRight size={16} />
        </button>
      </div>

      <textarea
        value={localContent}
        onChange={handleChange}
        placeholder="Écrivez librement…"
        className="journal-textarea"
      />

      <div className="journal-foot">
        <span>{wordCount} mot{wordCount !== 1 ? 's' : ''}</span>
        {saved && (
          <span className="saved-pill">
            <span className="dot" />
            Sauvegardé
          </span>
        )}
        {!isToday && <span style={{ color: 'var(--text-3)', fontStyle: 'italic' }}>Lecture seule</span>}
      </div>
    </div>
  )
}
