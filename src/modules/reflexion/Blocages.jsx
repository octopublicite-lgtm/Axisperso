import { useState, useEffect } from 'react'
import Badge from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { supabase } from '../../lib/supabase'
import { todayKey } from '../../utils/dates'
import { DOMAINS } from '../../utils/constants'
import { getDomainColor, getDomainLight } from '../../utils/colors'
import { Plus, Trash2 } from 'lucide-react'

const EMPTY = { description: '', domaine: '', impact: 3, plan: '', status: 'Ouvert' }
const IMPACT_COLORS = ['', '#10B981', '#84CC16', '#F5A623', '#F97316', '#E53E3E']

export default function Blocages() {
  const { user } = useAuth()
  const { addToast } = useApp()
  const [blocages, setBlocages] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [filterStatus, setFilterStatus] = useState('Tous')

  useEffect(() => {
    if (!user || !supabase) return
    ;(async () => {
      const { data, error } = await supabase
        .from('blocages').select('*').eq('user_id', user.id).order('date', { ascending: false })
      if (error) { addToast('Erreur de chargement blocages', 'error'); return }
      setBlocages(data ?? [])
    })()
  }, [user]) // eslint-disable-line

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })) }

  async function save() {
    if (!form.description.trim() || !supabase || !user?.id) return
    const { data, error } = await supabase.from('blocages')
      .insert({ user_id: user.id, description: form.description, domaine: form.domaine, impact: form.impact, plan: form.plan, status: form.status, date: todayKey() })
      .select('*').single()
    if (error) { addToast('Erreur de sauvegarde — réessayez', 'error'); return }
    setBlocages((prev) => [data, ...prev])
    setForm(EMPTY)
    setShowForm(false)
  }

  async function toggleStatus(id) {
    if (!supabase || !user?.id) return
    const b = blocages.find((x) => x.id === id)
    if (!b) return
    const newStatus = b.status === 'Ouvert' ? 'Résolu' : 'Ouvert'
    const { error } = await supabase.from('blocages').update({ status: newStatus }).eq('id', id)
    if (error) { addToast('Erreur de sauvegarde — réessayez', 'error'); return }
    setBlocages((prev) => prev.map((x) => x.id === id ? { ...x, status: newStatus } : x))
  }

  async function deleteBlocage(id) {
    if (!supabase || !user?.id) return
    const { error } = await supabase.from('blocages').delete().eq('id', id)
    if (error) { addToast('Erreur de sauvegarde — réessayez', 'error'); return }
    setBlocages((prev) => prev.filter((x) => x.id !== id))
  }

  const filtered = blocages.filter((b) => filterStatus === 'Tous' || b.status === filterStatus)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['Tous', 'Ouvert', 'Résolu'].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`pill${filterStatus === s ? ' active' : ''}`}>{s}</button>
          ))}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
          <Plus size={14} /> Nouveau
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ borderColor: 'var(--orange)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Description du blocage *" rows={3} className="input" style={{ resize: 'vertical' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <select value={form.domaine} onChange={(e) => set('domaine', e.target.value)} className="input">
                <option value="">Domaine</option>
                {DOMAINS.map((d) => <option key={d.id} value={d.id}>{d.icon} {d.label}</option>)}
              </select>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>Impact {form.impact}/5</span>
                <input type="range" min={1} max={5} value={form.impact} onChange={(e) => set('impact', Number(e.target.value))} className="slider" style={{ '--val': `${(form.impact - 1) / 4 * 100}%`, flex: 1 }} />
              </div>
            </div>
            <textarea value={form.plan} onChange={(e) => set('plan', e.target.value)} placeholder="Plan d'action…" rows={2} className="input" style={{ resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Annuler</button>
              <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={save}>Créer</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Aucun blocage.</p>}
        {filtered.map((b) => {
          const solved = b.status === 'Résolu'
          const color = b.domaine ? getDomainColor(b.domaine) : '#AAAAAA'
          const light = b.domaine ? getDomainLight(b.domaine) : '#F5F5F5'
          const impactColor = IMPACT_COLORS[b.impact] ?? '#AAAAAA'
          return (
            <div key={b.id} className="blocage-card" style={{ '--impact': impactColor, opacity: solved ? 0.7 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row" style={{ marginBottom: 8 }}>
                    {b.domaine && <Badge color={color} bg={light}>{DOMAINS.find((d) => d.id === b.domaine)?.label}</Badge>}
                    <span className={solved ? 'status-resolved' : 'status-open'}>{solved ? '✓ Résolu' : 'Ouvert'}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>⚡ Impact {b.impact}/5</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{b.date}</span>
                  </div>
                  <p className="desc" style={{ textDecoration: solved ? 'line-through' : 'none' }}>{b.description}</p>
                  {b.plan && <p style={{ fontSize: 12, color: 'var(--text-2)', fontStyle: 'italic', marginTop: 6 }}>Plan : {b.plan}</p>}
                  <button
                    onClick={() => toggleStatus(b.id)}
                    style={{ marginTop: 10, fontSize: 12, color: 'var(--orange)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                  >
                    {solved ? 'Marquer comme ouvert' : 'Marquer comme résolu'}
                  </button>
                </div>
                <button onClick={() => deleteBlocage(b.id)} aria-label="Supprimer" className="btn-icon" style={{ flexShrink: 0 }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
