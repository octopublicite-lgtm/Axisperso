import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { supabase } from '../../lib/supabase'
import { todayKey } from '../../utils/dates'
import { Plus, Trash2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

export default function PrioritesBlock() {
  const { user } = useAuth()
  const { addToast } = useApp()
  const today = todayKey()
  const [allPriorities, setAllPriorities] = useState({})
  const [input, setInput] = useState('')

  useEffect(() => {
    if (!user || !supabase) return
    ;(async () => {
      const { data, error } = await supabase
        .from('priorites_jour').select('*').eq('user_id', user.id).maybeSingle()
      if (error) { addToast('Erreur de chargement priorités', 'error'); return }
      if (data?.data) setAllPriorities(data.data)
    })()
  }, [user]) // eslint-disable-line

  const priorites = allPriorities[today] ?? []

  async function persist(updated) {
    if (!supabase || !user?.id) return
    const { error } = await supabase.from('priorites_jour').upsert(
      { user_id: user.id, data: updated, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    if (error) { addToast('Erreur de sauvegarde — réessayez', 'error'); return }
    setAllPriorities(updated)
  }

  function updateToday(updater) {
    const current = allPriorities[today] ?? []
    const next = typeof updater === 'function' ? updater(current) : updater
    persist({ ...allPriorities, [today]: next })
  }

  const add = () => {
    if (!input.trim() || priorites.length >= 3) return
    updateToday((prev) => [...prev, { id: uuidv4(), texte: input.trim(), done: false }])
    setInput('')
  }

  const toggle = (id) => updateToday((prev) => prev.map((p) => p.id === id ? { ...p, done: !p.done } : p))
  const remove = (id) => updateToday((prev) => prev.filter((p) => p.id !== id))

  return (
    <div className="card" style={{ padding: '4px 16px' }}>
      <div className="priority-list">
        {priorites.length === 0 && (
          <div className="priority-item">
            <span style={{ fontSize: 13, color: 'var(--text-3)', fontStyle: 'italic', paddingLeft: 4 }}>
              Aucune priorité définie pour aujourd'hui.
            </span>
          </div>
        )}
        {priorites.map((p, i) => (
          <div key={p.id} className={`priority-item${p.done ? ' done' : ''}`}>
            <span className="priority-num">{i + 1}</span>
            <div
              className={`checkbox${p.done ? ' checked' : ''}`}
              style={{ '--c': '#FF6B35' }}
              onClick={() => toggle(p.id)}
            >
              {p.done && (
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span className="text">{p.texte}</span>
            <button onClick={() => remove(p.id)} aria-label="Supprimer" className="btn-icon" style={{ marginLeft: 'auto' }}>
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {priorites.length < 3 && (
        <div style={{ display: 'flex', gap: 8, padding: '12px 4px 8px' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="Ajouter une priorité…"
            className="input"
            style={{ flex: 1 }}
          />
          <button onClick={add} disabled={!input.trim()} className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
            <Plus size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
