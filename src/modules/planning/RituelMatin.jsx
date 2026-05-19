import { useState, useEffect, useRef } from 'react'
import { useApp } from '../../context/AppContext'
import { todayKey } from '../../utils/dates'
import { Plus, Trash2, Play, Pause } from 'lucide-react'

export default function RituelMatin() {
  const { rituel, addEtape, removeEtape, toggleEtapeCompletion, isEtapeComplete } = useApp()
  const [newNom, setNewNom] = useState('')
  const [newDuree, setNewDuree] = useState(5)
  const [timerActive, setTimerActive] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef(null)
  const today = todayKey()

  const etapes = rituel?.etapes ?? []
  const completions = (rituel?.completions ?? {})[today] ?? []
  const totalMinutes = etapes.reduce((acc, e) => acc + (e.duree_min ?? 0), 0)
  const completedCount = completions.length

  useEffect(() => {
    if (timerActive) {
      intervalRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [timerActive])

  function handleAdd() {
    if (!newNom.trim()) return
    addEtape({ nom: newNom.trim(), duree_min: Number(newDuree) })
    setNewNom('')
    setNewDuree(5)
  }

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <p className="section-label">Rituel Matin</p>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>{completedCount}/{etapes.length} étapes · {totalMinutes} min total</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>{formatTime(elapsed)}</span>
            <button
              onClick={() => setTimerActive((v) => !v)}
              aria-label={timerActive ? 'Pause' : 'Démarrer'}
              className="btn btn-primary btn-sm"
            >
              {timerActive ? <Pause size={14} /> : <Play size={14} />}
            </button>
          </div>
        </div>

        <div className="ritual-list" style={{ marginBottom: 14 }}>
          {etapes.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--text-3)', padding: '8px 0' }}>Ajoutez vos étapes de rituel matin.</p>
          )}
          {etapes.map((e, idx) => {
            const done = isEtapeComplete(e.id, today)
            return (
              <div key={e.id} className={`ritual-item${done ? ' done' : ''}`}>
                <div className="ritual-num">{idx + 1}</div>
                <div
                  className={`checkbox${done ? ' checked' : ''}`}
                  style={{ '--c': 'var(--orange)', width: 18, height: 18, cursor: 'pointer' }}
                  onClick={() => toggleEtapeCompletion(e.id, today)}
                >
                  {done && <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                </div>
                <span className="text">{e.nom}</span>
                <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>{e.duree_min} min</span>
                <button onClick={() => removeEtape(e.id)} aria-label="Supprimer" className="btn-icon">
                  <Trash2 size={13} />
                </button>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={newNom}
            onChange={(e) => setNewNom(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Nouvelle étape…"
            className="input"
            style={{ flex: 1 }}
          />
          <input
            type="number" min={1} max={120}
            value={newDuree}
            onChange={(e) => setNewDuree(e.target.value)}
            className="input"
            style={{ width: 64, textAlign: 'center' }}
          />
          <span style={{ fontSize: 12, color: 'var(--text-3)', flexShrink: 0 }}>min</span>
          <button onClick={handleAdd} className="btn btn-primary btn-sm"><Plus size={14} /></button>
        </div>
      </div>
    </div>
  )
}
