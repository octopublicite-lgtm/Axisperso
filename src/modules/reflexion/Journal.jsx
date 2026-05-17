import { useState, useEffect, useCallback } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { todayKey, addDays } from '../../utils/dates'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Journal() {
  const [currentDate, setCurrentDate] = useState(todayKey())
  const key = `journal_${currentDate}`
  const [content, setContent] = useLocalStorage(key, '')
  const [localContent, setLocalContent] = useState(content)
  const [saved, setSaved] = useState(false)
  const wordCount = localContent.trim() ? localContent.trim().split(/\s+/).length : 0

  useEffect(() => { setLocalContent(content) }, [content])

  const save = useCallback(
    (() => {
      let timer
      return (val) => {
        clearTimeout(timer)
        timer = setTimeout(() => {
          setContent(val)
          setSaved(true)
          setTimeout(() => setSaved(false), 2000)
        }, 500)
      }
    })(),
    [setContent]
  )

  function handleChange(e) {
    setLocalContent(e.target.value)
    save(e.target.value)
  }

  const isToday = currentDate === todayKey()
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
