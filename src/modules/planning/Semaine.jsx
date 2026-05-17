import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { getWeekDays, getWeekDayLabels, formatDateShortFR, todayKey } from '../../utils/dates'
import { getDomainColor } from '../../utils/colors'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Semaine() {
  const { getTaches, timeblocks } = useApp()
  const [weekOffset, setWeekOffset] = useState(0)

  const baseDate = new Date()
  baseDate.setDate(baseDate.getDate() + weekOffset * 7)
  const weekDays = getWeekDays(new Date(baseDate))
  const labels = getWeekDayLabels()
  const today = todayKey()

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            aria-label="Semaine précédente"
            className="btn btn-ghost btn-sm"
            style={{ padding: '6px 8px' }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>
            {formatDateShortFR(weekDays[0])} – {formatDateShortFR(weekDays[6])}
          </span>
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            aria-label="Semaine suivante"
            className="btn btn-ghost btn-sm"
            style={{ padding: '6px 8px' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <button onClick={() => setWeekOffset(0)} style={{ fontSize: 12, color: 'var(--orange)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
          Aujourd'hui
        </button>
      </div>

      <div className="week-scroll-wrapper">
      <div className="week-grid">
        {weekDays.map((day, i) => {
          const taches = getTaches(day)
          const isToday = day === today
          const tbs = timeblocks.filter((tb) => {
            const dayIndex = new Date(day + 'T00:00:00').getDay()
            const adjusted = dayIndex === 0 ? 6 : dayIndex - 1
            return tb.jours?.includes(adjusted)
          })
          return (
            <div key={day} className={`week-col${isToday ? ' today' : ''}`}>
              <div className="week-day-header">
                {labels[i]}
                <span className="date">{day.split('-')[2]}</span>
              </div>
              {tbs.map((tb) => (
                <div key={tb.id} className="week-block" style={{ '--c': getDomainColor(tb.domaine) }}>
                  {tb.nom}
                  <div className="time">{tb.debut} – {tb.fin}</div>
                </div>
              ))}
              {taches.map((t) => (
                <div
                  key={t.id}
                  className="week-block"
                  style={{
                    '--c': t.domaine ? getDomainColor(t.domaine) : 'var(--text-3)',
                    opacity: t.done ? 0.5 : 1,
                    textDecoration: t.done ? 'line-through' : 'none',
                  }}
                >
                  {t.nom}
                  {(t.debut || t.fin) && <div className="time">{t.debut}{t.debut && t.fin && ' – '}{t.fin}</div>}
                </div>
              ))}
            </div>
          )
        })}
      </div>
      </div>
    </div>
  )
}
