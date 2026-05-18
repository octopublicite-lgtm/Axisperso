import { useState, useEffect, useRef } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useAuth } from '../../context/AuthContext'
import { push, pull } from '../../lib/cloudSync'
import { todayKey } from '../../utils/dates'
import { Plus, Trash2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

export default function PrioritesBlock() {
  const { session } = useAuth()
  const userId = session?.user?.id
  const today = todayKey()
  const [allPriorities, setAllPriorities] = useLocalStorage('all_priorites', {})
  const [input, setInput] = useState('')
  const mounted = useRef(false)

  // Load from Supabase on login
  useEffect(() => {
    if (!userId) return
    pull(userId, 'priorites').then((data) => {
      if (data && typeof data === 'object') setAllPriorities(data)
    })
  }, [userId]) // eslint-disable-line

  // Push to Supabase on change
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return }
    push(userId, 'priorites', allPriorities)
  }, [allPriorities]) // eslint-disable-line

  const priorites = allPriorities[today] ?? []
  const setPriorities = (updater) => {
    setAllPriorities((prev) => {
      const current = prev[today] ?? []
      const next = typeof updater === 'function' ? updater(current) : updater
      return { ...prev, [today]: next }
    })
  }

  const add = () => {
    if (!input.trim() || priorites.length >= 3) return
    setPriorities((prev) => [...prev, { id: uuidv4(), texte: input.trim(), done: false }])
    setInput('')
  }

  const toggle = (id) => setPriorities((prev) => prev.map((p) => (p.id === id ? { ...p, done: !p.done } : p)))
  const remove = (id) => setPriorities((prev) => prev.filter((p) => p.id !== id))

  const completed = priorites.filter((p) => p.done).length

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
            <button
              onClick={() => remove(p.id)}
              aria-label="Supprimer"
              className="btn-icon"
              style={{ marginLeft: 'auto' }}
            >
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
          <button
            onClick={add}
            disabled={!input.trim()}
            className="btn btn-primary btn-sm"
            style={{ flexShrink: 0 }}
          >
            <Plus size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
