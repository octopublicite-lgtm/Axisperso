import { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { getWeekDaysForOffset, getLast365Days, todayKey } from '../../utils/dates'
import { getDomainColor } from '../../utils/colors'
import { DOMAINS } from '../../utils/constants'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2, ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react'

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const SECTIONS = [
  { id: 'quotidien', label: '📅 Quotidiennes',             freqs: ['Quotidien'] },
  { id: 'semaine',   label: '🔄 Plusieurs fois / semaine', freqs: ['3x/semaine', '5x/semaine'] },
  { id: 'hebdo',     label: '📆 Hebdomadaires',            freqs: ['Hebdomadaire'] },
]

const EMPTY = { titre: '', icon: '✅', domaine: 'mindstyle', frequence: 'Quotidien' }

function DayDots({ h, weekDays, today, isLogged, onToggle, readOnly }) {
  const color = getDomainColor(h.domaine)
  return (
    <div className="mini-dots">
      {weekDays.map((d) => {
        const logged = isLogged(h.id, d)
        return (
          <span
            key={d}
            style={{
              cursor: readOnly ? 'default' : 'pointer',
              height: 28, width: 28, borderRadius: 6,
              background: logged ? color : '#EEEEEE',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: readOnly && !logged ? 0.5 : 1,
            }}
            onClick={() => !readOnly && onToggle(h.id, d)}
            title={readOnly ? d : undefined}
          >
            {logged && <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
          </span>
        )
      })}
    </div>
  )
}

function HabitRow({ h, weekDays, today, isLogged, onToggle, getStreak, deleteHabitude, readOnly }) {
  const streak = getStreak(h.id)
  return (
    <div className="habit-row" style={{ '--c': getDomainColor(h.domaine) }}>
      <div className="name">
        <span>{h.icon}</span>
        <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)' }}>{h.titre || h.nom}</span>
        {!readOnly && (
          <button
            onClick={() => { if (confirm(`Supprimer "${h.titre || h.nom}" ?`)) deleteHabitude(h.id) }}
            aria-label="Supprimer"
            className="btn-icon"
            style={{ opacity: 0.4 }}
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
      <div className="streak">
        {streak > 0 ? <><span>🔥</span>{streak}j</> : <span style={{ color: 'var(--text-3)' }}>—</span>}
      </div>
      <DayDots h={h} weekDays={weekDays} today={today} isLogged={isLogged} onToggle={onToggle} readOnly={readOnly} />
    </div>
  )
}

export default function HabitudesTab() {
  const { habitudes, addHabitude, deleteHabitude, toggleLog, isLogged, getStreak, getCompletionForDay, addToast } = useApp()
  const { session } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [weekOffset, setWeekOffset] = useState(0)
  const [collapsed, setCollapsed] = useLocalStorage('habit_sections', { quotidien: false, semaine: false, hebdo: true })
  const today = todayKey()
  const last365 = useMemo(() => getLast365Days(), [])

  const weekDays = useMemo(() => getWeekDaysForOffset(weekOffset), [weekOffset])
  const readOnly = weekOffset < 0

  const weekLabel = useMemo(() => {
    const monday = new Date(weekDays[0] + 'T00:00:00')
    return 'Semaine du ' + monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }, [weekDays])

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })) }

  function toggleSection(id) {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function handleAdd() {
    if (!form.titre.trim()) return
    addHabitude({ ...form, createdAt: new Date().toISOString(), actif: true })
    setForm(EMPTY)
    setShowForm(false)
    addToast('Habitude ajoutée')
  }

  async function handleToggle(habitudeId, dateKey) {
    const wasLogged = isLogged(habitudeId, dateKey)
    toggleLog(habitudeId, dateKey)
    if (!wasLogged && session?.user?.id && supabase) {
      try {
        const { error } = await supabase.from('habitude_logs').insert({
          habitude_id: habitudeId,
          user_id: session.user.id,
          date: dateKey,
        })
        if (error) console.error('[handleToggle] habitude_logs error:', error.message)
      } catch {}
    }
  }

  const grouped = useMemo(() => {
    const map = {}
    SECTIONS.forEach((s) => { map[s.id] = [] })
    habitudes.forEach((h) => {
      const section = SECTIONS.find((s) => s.freqs.includes(h.frequence))
      if (section) map[section.id].push(h)
      else map['quotidien'].push(h)
    })
    return map
  }, [habitudes])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>Mes habitudes</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
          <Plus size={14} /> Nouvelle
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ borderColor: 'var(--orange)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={form.icon} onChange={(e) => set('icon', e.target.value)}
                className="input" style={{ width: 56, textAlign: 'center', fontSize: 18 }} />
              <input value={form.titre} onChange={(e) => set('titre', e.target.value)} placeholder="Nom de l'habitude *"
                className="input" style={{ flex: 1 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <select value={form.domaine} onChange={(e) => set('domaine', e.target.value)} className="input">
                {DOMAINS.map((d) => <option key={d.id} value={d.id}>{d.icon} {d.label}</option>)}
              </select>
              <select value={form.frequence} onChange={(e) => set('frequence', e.target.value)} className="input">
                <option value="Quotidien">Quotidien</option>
                <option value="3x/semaine">3x/semaine</option>
                <option value="5x/semaine">5x/semaine</option>
                <option value="Hebdomadaire">Hebdomadaire</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Annuler</button>
              <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={handleAdd}>Créer</button>
            </div>
          </div>
        </div>
      )}

      {/* Week navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <button className="btn btn-ghost btn-sm" style={{ padding: '6px 8px' }} onClick={() => setWeekOffset((v) => v - 1)}>
          <ChevronLeft size={16} />
        </button>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)', minWidth: 200, textAlign: 'center' }}>{weekLabel}</span>
        <button
          className="btn btn-ghost btn-sm"
          style={{ padding: '6px 8px' }}
          onClick={() => setWeekOffset((v) => v + 1)}
          disabled={weekOffset >= 0}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* 7-day habit grid */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {habitudes.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-3)', padding: 20 }}>Aucune habitude créée.</p>
        ) : (
          <>
            {/* Column headers with day + date number */}
            <div className="habit-row" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 8, paddingTop: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Habitude</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Streak</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {weekDays.map((d, i) => {
                  const isToday = d === today
                  const dayNum = parseInt(d.split('-')[2], 10)
                  return (
                    <div key={d} style={{ width: 28, textAlign: 'center' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: isToday ? 'var(--orange)' : 'var(--text-3)', textTransform: 'uppercase', lineHeight: 1.2 }}>
                        {DAY_LABELS[i]}
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: isToday ? 'var(--orange)' : 'var(--text-3)', lineHeight: 1.3 }}>
                        {dayNum}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Frequency sections */}
            {SECTIONS.map((section) => {
              const items = grouped[section.id]
              if (items.length === 0) return null
              const isCollapsed = collapsed[section.id]
              return (
                <div key={section.id}>
                  <div
                    onClick={() => toggleSection(section.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 16px', background: '#F7F7F9', cursor: 'pointer',
                      borderBottom: '1px solid var(--border)', userSelect: 'none',
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
                      {section.label}
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', marginLeft: 8 }}>· {items.length}</span>
                    </span>
                    {isCollapsed
                      ? <ChevronRight size={15} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                      : <ChevronDown size={15} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                    }
                  </div>
                  {!isCollapsed && items.map((h) => (
                    <HabitRow
                      key={h.id}
                      h={h}
                      weekDays={weekDays}
                      today={today}
                      isLogged={isLogged}
                      onToggle={handleToggle}
                      getStreak={getStreak}
                      deleteHabitude={deleteHabitude}
                      readOnly={readOnly}
                    />
                  ))}
                </div>
              )
            })}
          </>
        )}
      </div>

      {/* Heatmap annuelle */}
      <div className="card">
        <p className="section-label" style={{ marginBottom: 12 }}>Heatmap annuelle</p>
        <div className="heatmap-wrap">
          <div className="heatmap">
            {last365.map((day) => {
              const pct = getCompletionForDay(day)
              const alpha = pct === 0 ? 0 : pct < 33 ? 0.25 : pct < 66 ? 0.55 : 1
              const bg = pct === 0 ? '#EEEEEE' : `rgba(0, 200, 150, ${alpha})`
              return (
                <div key={day} className="heat-cell" style={{ '--cell': bg }} title={`${day} — ${pct}%`} />
              )
            })}
          </div>
          <div className="heat-legend">
            <span>Moins</span>
            <div className="scale">
              <span style={{ background: '#EEEEEE' }} />
              <span style={{ background: 'rgba(0,200,150,0.25)' }} />
              <span style={{ background: 'rgba(0,200,150,0.55)' }} />
              <span style={{ background: 'rgba(0,200,150,1)' }} />
            </div>
            <span>Plus</span>
          </div>
        </div>
      </div>
    </div>
  )
}
