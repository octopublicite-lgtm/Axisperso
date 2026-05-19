import { useState, useEffect } from 'react'
import ProgressBar from '../../components/ui/ProgressBar'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { supabase } from '../../lib/supabase'
import { getMonthKey } from '../../utils/dates'
import { getDomainColor } from '../../utils/colors'
import { DOMAINS } from '../../utils/constants'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const EMPTY = { note: 5, bien: '', passBien: '', lecon: '', intention: '' }

function monthKeyFromOffset(offset) {
  const d = new Date()
  d.setMonth(d.getMonth() + offset)
  return getMonthKey(d)
}

export default function BilanMensuel() {
  const { user } = useAuth()
  const { addToast, objectifs } = useApp()
  const [bilans, setBilans] = useState([])
  const [monthOffset, setMonthOffset] = useState(0)
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    if (!user || !supabase) return
    ;(async () => {
      const { data, error } = await supabase
        .from('bilans_mensuels').select('*').eq('user_id', user.id)
      if (error) { addToast('Erreur de chargement bilans', 'error'); return }
      setBilans(data ?? [])
    })()
  }, [user]) // eslint-disable-line

  const monthKey = monthKeyFromOffset(monthOffset)

  useEffect(() => {
    const found = bilans.find((b) => b.mois === monthKey)
    setForm(found
      ? { note: found.note, bien: found.bien ?? '', passBien: found.pas_bien ?? '', lecon: found.lecon ?? '', intention: found.intention ?? '' }
      : EMPTY
    )
  }, [bilans, monthKey])

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })) }

  async function save() {
    if (!supabase || !user?.id) return
    const row = { user_id: user.id, mois: monthKey, note: form.note, bien: form.bien, pas_bien: form.passBien, lecon: form.lecon, intention: form.intention }
    const { error } = await supabase.from('bilans_mensuels').upsert(row, { onConflict: 'user_id,mois' })
    if (error) { addToast('Erreur de sauvegarde — réessayez', 'error'); return }
    setBilans((prev) => {
      const filtered = prev.filter((b) => b.mois !== monthKey)
      return [...filtered, { ...row }]
    })
  }

  const baseDate = new Date()
  baseDate.setMonth(baseDate.getMonth() + monthOffset)
  const monthLabel = baseDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  const activeObjectifs = (objectifs ?? []).filter((o) => o.status === 'En cours')
  const radarData = DOMAINS.map((d) => {
    const domainObjs = activeObjectifs.filter((o) => o.domaine === d.id)
    const avg = domainObjs.length > 0 ? Math.round(domainObjs.reduce((a, o) => a + o.progress, 0) / domainObjs.length) : 0
    return { domain: d.label.split(' ')[0], value: avg }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => setMonthOffset((v) => v - 1)} aria-label="Mois précédent" className="btn btn-ghost btn-sm" style={{ padding: '6px 8px' }}>
          <ChevronLeft size={16} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', flex: 1, textAlign: 'center', textTransform: 'capitalize' }}>{monthLabel}</span>
        <button onClick={() => setMonthOffset((v) => v + 1)} disabled={monthOffset >= 0} aria-label="Mois suivant" className="btn btn-ghost btn-sm" style={{ padding: '6px 8px' }}>
          <ChevronRight size={16} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <p className="section-label" style={{ marginBottom: 8 }}>Note globale : {form.note}/10</p>
              <input
                type="range" min={1} max={10} value={form.note}
                onChange={(e) => set('note', Number(e.target.value))}
                className="slider"
                style={{ '--val': `${(form.note - 1) / 9 * 100}%` }}
              />
            </div>
            {[['bien', 'Ce qui a bien marché'], ['passBien', "Ce qui n'a pas marché"], ['intention', 'Intention mois prochain']].map(([key, label]) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="section-label">{label}</label>
                <textarea value={form[key]} onChange={(e) => set(key, e.target.value)} rows={2} className="input" style={{ resize: 'vertical' }} />
              </div>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="section-label">Leçon principale</label>
              <input value={form.lecon} onChange={(e) => set('lecon', e.target.value)} className="input" />
            </div>
            <button className="btn btn-primary" onClick={save}>Sauvegarder</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <p className="section-label" style={{ marginBottom: 12 }}>Score par domaine</p>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="domain" tick={{ fontSize: 10, fill: '#666' }} />
                  <Radar dataKey="value" stroke="#FF6B35" fill="#FF6B35" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <p className="section-label" style={{ marginBottom: 12 }}>Objectifs en cours</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activeObjectifs.slice(0, 5).map((o) => (
                <div key={o.id}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-1)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>{o.titre}</p>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)' }}>{o.progress}%</span>
                  </div>
                  <ProgressBar value={o.progress} color={getDomainColor(o.domaine)} height={5} />
                </div>
              ))}
              {activeObjectifs.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Aucun objectif en cours.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
