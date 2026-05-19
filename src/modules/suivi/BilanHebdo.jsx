import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { supabase } from '../../lib/supabase'
import { getWeekKey } from '../../utils/dates'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const EMPTY = { note: 5, bien: '', passBien: '', lecon: '', intention: '' }

function weekKeyFromOffset(offset) {
  const d = new Date()
  d.setDate(d.getDate() + offset * 7)
  return getWeekKey(d)
}

export default function BilanHebdo() {
  const { user } = useAuth()
  const { addToast } = useApp()
  const [bilans, setBilans] = useState([])
  const [weekOffset, setWeekOffset] = useState(0)
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    if (!user || !supabase) return
    ;(async () => {
      const { data, error } = await supabase
        .from('bilans_hebdo').select('*').eq('user_id', user.id)
      if (error) { addToast('Erreur de chargement bilans', 'error'); return }
      setBilans(data ?? [])
    })()
  }, [user]) // eslint-disable-line

  const weekKey = weekKeyFromOffset(weekOffset)

  useEffect(() => {
    const found = bilans.find((b) => b.semaine === weekKey)
    setForm(found
      ? { note: found.note, bien: found.bien ?? '', passBien: found.pas_bien ?? '', lecon: found.lecon ?? '', intention: found.intention ?? '' }
      : EMPTY
    )
  }, [bilans, weekKey])

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })) }

  async function save() {
    if (!supabase || !user?.id) return
    const row = { user_id: user.id, semaine: weekKey, note: form.note, bien: form.bien, pas_bien: form.passBien, lecon: form.lecon, intention: form.intention }
    const { error } = await supabase.from('bilans_hebdo').upsert(row, { onConflict: 'user_id,semaine' })
    if (error) { addToast('Erreur de sauvegarde — réessayez', 'error'); return }
    setBilans((prev) => {
      const filtered = prev.filter((b) => b.semaine !== weekKey)
      return [...filtered, { ...row }]
    })
  }

  const isCurrentWeek = weekOffset === 0
  const historyList = [...bilans].sort((a, b) => b.semaine.localeCompare(a.semaine)).slice(0, 10)

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setWeekOffset((v) => v - 1)} aria-label="Semaine précédente" className="btn btn-ghost btn-sm" style={{ padding: '6px 8px' }}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', flex: 1, textAlign: 'center' }}>
            {isCurrentWeek ? 'Cette semaine' : `Semaine ${weekKey}`}
          </span>
          <button onClick={() => setWeekOffset((v) => v + 1)} disabled={weekOffset >= 0} aria-label="Semaine suivante" className="btn btn-ghost btn-sm" style={{ padding: '6px 8px' }}>
            <ChevronRight size={16} />
          </button>
        </div>

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
            {[
              ['bien', 'Ce qui a bien marché', 3],
              ['passBien', "Ce qui n'a pas marché", 3],
              ['lecon', 'Leçon principale', 2],
              ['intention', 'Intention semaine suivante', 2],
            ].map(([key, label, rows]) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="section-label">{label}</label>
                <textarea
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  rows={rows}
                  className="input"
                  style={{ resize: 'vertical', lineHeight: 1.6 }}
                />
              </div>
            ))}
            <button className="btn btn-primary" onClick={save}>Sauvegarder le bilan</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 180, flexShrink: 0 }}>
        <p className="section-label">Historique</p>
        {historyList.map((b) => (
          <button
            key={b.semaine}
            onClick={() => setWeekOffset(0)}
            style={{
              textAlign: 'left', padding: '10px 12px', borderRadius: 10,
              border: `1.5px solid ${b.semaine === weekKey ? 'var(--orange)' : 'var(--border)'}`,
              background: b.semaine === weekKey ? 'color-mix(in srgb, var(--orange) 6%, white)' : 'var(--surface)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <p style={{ fontSize: 12, fontWeight: 700, color: b.semaine === weekKey ? 'var(--orange)' : 'var(--text-1)' }}>{b.semaine}</p>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Note: {b.note}/10</p>
          </button>
        ))}
      </div>
    </div>
  )
}
