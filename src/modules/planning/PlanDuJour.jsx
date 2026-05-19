import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { todayKey, formatDateFR } from '../../utils/dates'
import { DOMAINS } from '../../utils/constants'
import { getDomainColor, getDomainLight } from '../../utils/colors'
import { Plus, Trash2 } from 'lucide-react'

const PRIO_COLORS = { haute: '#E53E3E', moyenne: '#F5A623', basse: '#10B981' }

const START_HOUR = 5
const END_HOUR = 23
const HOUR_HEIGHT = 60 // px per hour

export default function PlanDuJour() {
  const { getTaches, addTache, updateTache, deleteTache } = useApp()
  const today = todayKey()
  const taches = getTaches(today)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nom: '', debut: '', fin: '', domaine: '', priorite: 'moyenne' })
  const [currentTimeY, setCurrentTimeY] = useState(null)

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })) }

  function handleAdd() {
    if (!form.nom.trim()) return
    addTache(form, today)
    setForm({ nom: '', debut: '', fin: '', domaine: '', priorite: 'moyenne' })
    setShowForm(false)
  }

  useEffect(() => {
    function tick() {
      const now = new Date()
      const h = now.getHours()
      const offset = (h - START_HOUR) * HOUR_HEIGHT + (now.getMinutes() / 60) * HOUR_HEIGHT
      setCurrentTimeY(h >= START_HOUR && h < END_HOUR ? offset : null)
    }
    tick()
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])

  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR)
  const timedTasks = taches.filter((t) => t.debut)
  const untimedTasks = taches.filter((t) => !t.debut)

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

      {/* ── LEFT 40%: Task list ── */}
      <div style={{ flex: '0 0 40%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)' }}>{formatDateFR()}</p>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
            <Plus size={14} /> Ajouter
          </button>
        </div>

        {showForm && (
          <div className="card" style={{ borderColor: 'var(--orange)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                value={form.nom}
                onChange={(e) => set('nom', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="Titre *"
                className="input"
                autoFocus
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>Heure début</label>
                  <input type="time" value={form.debut} onChange={(e) => set('debut', e.target.value)} className="input" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>Heure fin</label>
                  <input type="time" value={form.fin} onChange={(e) => set('fin', e.target.value)} className="input" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <select value={form.priorite} onChange={(e) => set('priorite', e.target.value)} className="input">
                  <option value="haute">🔴 Haute</option>
                  <option value="moyenne">🟡 Normale</option>
                  <option value="basse">🟢 Basse</option>
                </select>
                <select value={form.domaine} onChange={(e) => set('domaine', e.target.value)} className="input">
                  <option value="">Domaine (optionnel)</option>
                  {DOMAINS.map((d) => <option key={d.id} value={d.id}>{d.icon} {d.label}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Annuler</button>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={handleAdd} disabled={!form.nom.trim()}>Ajouter</button>
              </div>
            </div>
          </div>
        )}

        {taches.length === 0 && !showForm && (
          <p style={{ fontSize: 13, color: 'var(--text-3)', padding: '16px 0' }}>Aucune tâche planifiée pour aujourd'hui.</p>
        )}

        <div className="task-list">
          {taches.map((t) => {
            const domColor = t.domaine ? getDomainColor(t.domaine) : null
            const prioColor = PRIO_COLORS[t.priorite] ?? 'var(--text-3)'
            const timeBg = t.domaine ? getDomainLight(t.domaine) : '#FFF0EB'
            const timeColor = domColor ?? 'var(--orange)'
            return (
              <div
                key={t.id}
                className={`task-item${t.done ? ' done' : ''}`}
                style={{ '--c': domColor ?? 'var(--text-3)', '--prio': prioColor }}
              >
                <div
                  className={`checkbox${t.done ? ' checked' : ''}`}
                  style={{ '--c': domColor ?? 'var(--orange)', width: 18, height: 18, cursor: 'pointer', flexShrink: 0 }}
                  onClick={() => updateTache(t.id, { done: !t.done })}
                >
                  {t.done && <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                </div>
                <div className="prio" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="text">{t.nom}</span>
                  {t.debut && (
                    <span style={{
                      display: 'inline-block', marginLeft: 8,
                      fontSize: 10, fontWeight: 700,
                      color: timeColor, background: timeBg,
                      padding: '1px 7px', borderRadius: 99,
                    }}>
                      {t.debut}{t.fin ? ` → ${t.fin}` : ''}
                    </span>
                  )}
                </div>
                <button onClick={() => deleteTache(t.id)} aria-label="Supprimer" className="btn-icon">
                  <Trash2 size={13} />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── RIGHT 60%: Timeline — hidden on mobile via #timeline-panel CSS ── */}
      <div id="timeline-panel" style={{ flex: '0 0 60%', minWidth: 0 }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

          {/* Unscheduled tasks strip */}
          {untimedTasks.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
              <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, alignSelf: 'center', flexShrink: 0 }}>
                Sans heure :
              </span>
              {untimedTasks.map((t) => {
                const color = t.domaine ? getDomainColor(t.domaine) : '#AAAAAA'
                const bg = t.domaine ? getDomainLight(t.domaine) : '#F5F5F5'
                return (
                  <span
                    key={t.id}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: 11, fontWeight: 600, color,
                      padding: '2px 8px', borderRadius: 99, background: bg,
                      textDecoration: t.done ? 'line-through' : 'none',
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    {t.nom}
                  </span>
                )
              })}
            </div>
          )}

          {/* Scrollable hour grid */}
          <div style={{ position: 'relative', overflowY: 'auto', maxHeight: 640 }}>

            {/* Hour rows */}
            {hours.map((h, i) => (
              <div
                key={h}
                style={{
                  height: HOUR_HEIGHT,
                  display: 'flex',
                  alignItems: 'flex-start',
                  borderTop: i === 0 ? 'none' : '1px solid var(--border)',
                  position: 'relative',
                }}
              >
                <span style={{
                  fontSize: 10, fontWeight: 600, color: 'var(--text-3)',
                  width: 44, paddingLeft: 10, paddingTop: 5, flexShrink: 0,
                }}>
                  {String(h).padStart(2, '0')}:00
                </span>
              </div>
            ))}
            <div style={{ height: 0, borderTop: '1px solid var(--border)' }} />

            {/* Current time indicator */}
            {currentTimeY !== null && (
              <div style={{
                position: 'absolute', top: currentTimeY, left: 0, right: 0,
                display: 'flex', alignItems: 'center', zIndex: 10, pointerEvents: 'none',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--orange)', flexShrink: 0, marginLeft: 40 }} />
                <div style={{ flex: 1, height: 2, background: 'var(--orange)' }} />
              </div>
            )}

            {/* Timed task blocks */}
            {timedTasks.map((t) => {
              const [startH, startM] = t.debut.split(':').map(Number)
              if (startH < START_HOUR || startH >= END_HOUR) return null
              const topPx = (startH - START_HOUR) * HOUR_HEIGHT + (startM / 60) * HOUR_HEIGHT

              let heightPx = HOUR_HEIGHT
              if (t.fin) {
                const [endH, endM] = t.fin.split(':').map(Number)
                const dur = (endH - startH) * 60 + (endM - startM)
                if (dur > 0) heightPx = Math.max(28, (dur / 60) * HOUR_HEIGHT)
              }

              const color = t.domaine ? getDomainColor(t.domaine) : 'var(--orange)'
              const bg = t.domaine ? getDomainLight(t.domaine) : '#FFF0EB'

              return (
                <div
                  key={t.id}
                  style={{
                    position: 'absolute', top: topPx, left: 52, right: 8,
                    height: heightPx, minHeight: 28,
                    background: bg, borderLeft: `4px solid ${color}`,
                    borderRadius: 8, padding: '5px 10px',
                    overflow: 'hidden', opacity: t.done ? 0.45 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {t.nom}
                  </div>
                  {heightPx >= 40 && (
                    <div style={{ fontSize: 10, color: 'var(--text-2)', marginTop: 2 }}>
                      {t.debut}{t.fin && ` → ${t.fin}`}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
