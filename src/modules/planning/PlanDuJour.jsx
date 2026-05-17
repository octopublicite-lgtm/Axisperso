import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { todayKey, formatDateFR } from '../../utils/dates'
import { DOMAINS } from '../../utils/constants'
import { getDomainColor } from '../../utils/colors'
import { Plus, Trash2 } from 'lucide-react'

const PRIO_COLORS = { haute: '#E53E3E', moyenne: '#F5A623', basse: '#10B981' }
const PRIO_ICONS = { haute: '🔴', moyenne: '🟡', basse: '🟢' }

export default function PlanDuJour() {
  const { getTaches, addTache, updateTache, deleteTache } = useApp()
  const today = todayKey()
  const taches = getTaches(today)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nom: '', debut: '', fin: '', domaine: '', priorite: 'moyenne' })

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })) }

  function handleAdd() {
    if (!form.nom.trim()) return
    addTache(form, today)
    setForm({ nom: '', debut: '', fin: '', domaine: '', priorite: 'moyenne' })
    setShowForm(false)
  }

  const hoursRange = Array.from({ length: 18 }, (_, i) => i + 6)

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
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
                value={form.nom} onChange={(e) => set('nom', e.target.value)}
                placeholder="Nom de la tâche *"
                className="input"
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>Début</label>
                  <input type="time" value={form.debut} onChange={(e) => set('debut', e.target.value)} className="input" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>Fin</label>
                  <input type="time" value={form.fin} onChange={(e) => set('fin', e.target.value)} className="input" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <select value={form.domaine} onChange={(e) => set('domaine', e.target.value)} className="input">
                  <option value="">Domaine (optionnel)</option>
                  {DOMAINS.map((d) => <option key={d.id} value={d.id}>{d.icon} {d.label}</option>)}
                </select>
                <select value={form.priorite} onChange={(e) => set('priorite', e.target.value)} className="input">
                  <option value="haute">🔴 Haute</option>
                  <option value="moyenne">🟡 Moyenne</option>
                  <option value="basse">🟢 Basse</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Annuler</button>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={handleAdd}>Ajouter</button>
              </div>
            </div>
          </div>
        )}

        {taches.length === 0 && !showForm && (
          <p style={{ fontSize: 13, color: 'var(--text-3)', padding: '16px 0' }}>Aucune tâche planifiée pour aujourd'hui.</p>
        )}

        <div className="task-list">
          {taches.map((t) => (
            <div
              key={t.id}
              className={`task-item${t.done ? ' done' : ''}`}
              style={{ '--c': t.domaine ? getDomainColor(t.domaine) : 'var(--text-3)', '--prio': PRIO_COLORS[t.priorite] ?? 'var(--text-3)' }}
            >
              <div
                className={`checkbox${t.done ? ' checked' : ''}`}
                style={{ '--c': t.domaine ? getDomainColor(t.domaine) : 'var(--orange)', width: 18, height: 18, cursor: 'pointer', flexShrink: 0 }}
                onClick={() => updateTache(t.id, { done: !t.done }, today)}
              >
                {t.done && <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
              </div>
              <div className="prio" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className="text">{t.nom}</span>
                {(t.debut || t.fin) && (
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{t.debut}{t.debut && t.fin && ' → '}{t.fin}</p>
                )}
              </div>
              <button onClick={() => deleteTache(t.id, today)} aria-label="Supprimer" className="btn-icon">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="timeline" style={{ width: 160, flexShrink: 0, display: 'none' }} id="timeline-panel">
        <div className="timeline-grid" style={{ position: 'relative' }}>
          {hoursRange.map((h) => (
            <div key={h} style={{ height: 40, position: 'relative', display: 'flex', alignItems: 'flex-start', paddingLeft: 8 }}>
              <span className="timeline-hour" style={{ position: 'absolute', left: -48, top: 0, textAlign: 'right', width: 40 }}>{String(h).padStart(2, '0')}:00</span>
              {taches.filter((t) => t.debut && parseInt(t.debut) === h).map((t) => {
                const color = t.domaine ? getDomainColor(t.domaine) : '#AAAAAA'
                const startMin = parseInt(t.debut?.split(':')[1] ?? 0)
                const endH = parseInt(t.fin?.split(':')[0] ?? h + 1)
                const endMin = parseInt(t.fin?.split(':')[1] ?? 0)
                const heightPx = Math.max(24, ((endH - h) * 60 + (endMin - startMin)) / 60 * 40)
                return (
                  <div key={t.id} className="timeline-block" style={{ '--c': color, top: (startMin / 60) * 40, height: heightPx, position: 'absolute', left: 12, right: 0 }}>
                    <div className="b-title">{t.nom}</div>
                    {t.debut && <div className="b-meta">{t.debut}{t.fin && ` → ${t.fin}`}</div>}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
