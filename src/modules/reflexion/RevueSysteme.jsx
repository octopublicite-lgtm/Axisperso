import { useState } from 'react'
import Badge from '../../components/ui/Badge'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { todayKey } from '../../utils/dates'
import { Plus, Trash2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

const CATEGORIES = ['Dashboard', 'Objectifs', 'Planning', 'Suivi', 'Général']
const CAT_COLORS = { Dashboard: '#FF6B35', Objectifs: '#6C63FF', Planning: '#0EA5E9', Suivi: '#00C896', Général: '#F5A623' }

export default function RevueSysteme() {
  const [revues, setRevues] = useLocalStorage('revues', [])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ texte: '', categorie: 'Général' })

  function save() {
    if (!form.texte.trim()) return
    setRevues((prev) => [{ ...form, id: uuidv4(), date: todayKey() }, ...prev])
    setForm({ texte: '', categorie: 'Général' })
    setShowForm(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 13, color: 'var(--text-2)' }}>Notes pour améliorer ton système Axis Life.</p>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
          <Plus size={14} /> Nouvelle note
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ borderColor: 'var(--orange)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <select
              value={form.categorie}
              onChange={(e) => setForm((p) => ({ ...p, categorie: e.target.value }))}
              className="input"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <textarea
              value={form.texte}
              onChange={(e) => setForm((p) => ({ ...p, texte: e.target.value }))}
              placeholder="Ta note…"
              rows={4}
              className="input"
              style={{ resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Annuler</button>
              <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={save}>Sauvegarder</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {revues.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Aucune note de revue système.</p>}
        {revues.map((r) => {
          const color = CAT_COLORS[r.categorie] ?? '#666'
          return (
            <div key={r.id} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <Badge color={color} bg={color + '20'}>{r.categorie}</Badge>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{r.date}</span>
                  </div>
                  <p style={{ fontSize: 13.5, color: 'var(--text-1)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{r.texte}</p>
                </div>
                <button
                  onClick={() => setRevues((prev) => prev.filter((x) => x.id !== r.id))}
                  aria-label="Supprimer"
                  className="btn-icon"
                  style={{ flexShrink: 0 }}
                >
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
