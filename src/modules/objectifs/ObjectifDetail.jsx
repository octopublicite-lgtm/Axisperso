import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { DOMAINS, HORIZON_LABEL } from '../../utils/constants'
import { getDomainColor } from '../../utils/colors'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import PageWrapper from '../../components/layout/PageWrapper'
import ProgressBar from '../../components/ui/ProgressBar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ObjectifModal from './ObjectifModal'
import { ArrowLeft, Pencil, Plus, X } from 'lucide-react'
import { todayKey } from '../../utils/dates'
import { v4 as uuidv4 } from 'uuid'

const STATUT_COLORS = {
  'En cours': { color: '#FF6B35', bg: '#FFF0EB' },
  'Atteint':  { color: '#10B981', bg: '#E6FAF5' },
  'Suspendu': { color: '#AAAAAA', bg: '#F5F5F5' },
}

const TABS = ['Suivi', 'Notes', 'Actions', 'Rappels']

export default function ObjectifDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { objectifs, updateObjectif, toggleMilestone, addToast } = useApp()
  const [activeTab, setActiveTab] = useState(0)
  const [editModalOpen, setEditModalOpen] = useState(false)

  const o = objectifs.find((obj) => obj.id === id)

  if (!o) {
    return (
      <PageWrapper>
        <div style={{ textAlign: 'center', paddingTop: 96 }}>
          <p style={{ color: 'var(--text-3)', marginBottom: 16 }}>Objectif introuvable.</p>
          <Button onClick={() => navigate('/objectifs')} variant="secondary">
            <ArrowLeft size={15} /> Retour
          </Button>
        </div>
      </PageWrapper>
    )
  }

  const domain = DOMAINS.find((d) => d.id === o.domaine)
  const color = getDomainColor(o.domaine)
  const light = domain ? `color-mix(in srgb, ${color} 12%, white)` : '#F0F0F0'
  const statut = STATUT_COLORS[o.status] ?? STATUT_COLORS['En cours']

  return (
    <PageWrapper>
      {/* Color band */}
      <div className="detail-band" style={{ '--c': color }} />

      {/* Back */}
      <div className="detail-header" onClick={() => navigate('/objectifs')}>
        <ArrowLeft size={16} />
        <span>Objectifs</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h1 className="page-title">{o.titre}</h1>
          {o.description && <p className="page-subtitle">{o.description}</p>}
          <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
            <Badge color={color} bg={light}>{domain?.icon} {domain?.label}</Badge>
            <Badge color="#666" bg="#EEEEEE">{HORIZON_LABEL[o.horizon] ?? o.horizon}</Badge>
            <Badge color={statut.color} bg={statut.bg}>{o.status}</Badge>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" onClick={() => setEditModalOpen(true)}>
            <Pencil size={14} /> Modifier
          </Button>
        </div>
      </div>

      {/* Meta grid */}
      <div className="detail-meta-grid">
        <div className="meta-card">
          <div className="label">Progression</div>
          <div className="value" style={{ color }}>{o.progress}%</div>
          <div style={{ marginTop: 10 }}>
            <ProgressBar value={o.progress} color={color} height={8} />
          </div>
          <ProgressSlider objectif={o} color={color} updateObjectif={updateObjectif} addToast={addToast} />
        </div>
        <div className="meta-card">
          <div className="label">KPI</div>
          <div className="value" style={{ fontSize: 15 }}>{o.kpi || '—'}</div>
        </div>
        <div className="meta-card">
          <div className="label">Horizon</div>
          <div className="value">{HORIZON_LABEL[o.horizon] ?? o.horizon ?? '—'}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>{o.status}</div>
        </div>
      </div>

      {/* Tabs */}
      <TabsSection
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        objectifId={id}
        objectif={o}
        color={color}
        updateObjectif={updateObjectif}
        addToast={addToast}
        toggleMilestone={toggleMilestone}
      />

      <ObjectifModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        editTarget={o}
        defaultDomain={o.domaine}
      />
    </PageWrapper>
  )
}

function ProgressSlider({ objectif: o, color, updateObjectif, addToast }) {
  const [draft, setDraft] = useState(o.progress)
  useEffect(() => { setDraft(o.progress) }, [o.progress])

  function save() {
    updateObjectif(o.id, { progress: draft })
    addToast('Progression mise à jour')
  }

  return (
    <div style={{ marginTop: 12 }}>
      <input
        type="range" min={0} max={100}
        value={draft}
        onChange={(e) => setDraft(Number(e.target.value))}
        className="slider"
        style={{ '--val': `${draft}%` }}
      />
      {draft !== o.progress && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <Button size="sm" onClick={save} style={{ background: color }}>Enregistrer {draft}%</Button>
        </div>
      )}
    </div>
  )
}

/* ── Tabs container ── */
function TabsSection({ activeTab, setActiveTab, objectifId, objectif, color, updateObjectif, addToast, toggleMilestone }) {
  const [rappels] = useLocalStorage(`obj_rappels_${objectifId}`, [])

  const upcomingCount = useMemo(() => {
    const now = new Date()
    const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return rappels.filter((r) => {
      const d = new Date(r.date + 'T' + (r.heure || '00:00'))
      return d >= now && d <= in7
    }).length
  }, [rappels])

  return (
    <div>
      <div className="tabs">
        {TABS.map((t, i) => (
          <div
            key={t}
            className={`tab${activeTab === i ? ' active' : ''}`}
            style={activeTab === i ? { '--c': color } : undefined}
            onClick={() => setActiveTab(i)}
          >
            {t}
            {t === 'Rappels' && upcomingCount > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 16, height: 16, borderRadius: '50%',
                background: color, color: 'white',
                fontSize: 9, fontWeight: 700, marginLeft: 6
              }}>
                {upcomingCount}
              </span>
            )}
          </div>
        ))}
      </div>

      {activeTab === 0 && <SuiviTab objectif={objectif} color={color} updateObjectif={updateObjectif} addToast={addToast} />}
      {activeTab === 1 && <NotesTab objectifId={objectifId} color={color} />}
      {activeTab === 2 && <ActionsTab objectifId={objectifId} color={color} />}
      {activeTab === 3 && <RappelsTab objectifId={objectifId} color={color} />}
    </div>
  )
}

/* ── TAB Suivi ── */
function SuiviTab({ objectif: o, color, updateObjectif, addToast }) {
  const [date, setDate] = useState(todayKey())
  const [progress, setProgress] = useState(o.progress)
  const [note, setNote] = useState('')

  const history = o.progressHistory ?? []

  const chartData = useMemo(() => {
    return [...history]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((h) => ({ date: h.date.slice(5).replace('-', '/'), value: h.value, full: h.date }))
  }, [history])

  function handleSave() {
    const today = todayKey()
    const filtered = history.filter((h) => h.date !== date)
    const newHistory = [...filtered, { date, value: progress, note: note.trim() || undefined }]
      .sort((a, b) => a.date.localeCompare(b.date))
    updateObjectif(o.id, { progress, progressHistory: newHistory })
    addToast('Progression enregistrée')
    setNote('')
    setDate(today)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card">
        <p className="section-label" style={{ marginBottom: 16 }}>Évolution de la progression</p>
        {chartData.length <= 1 ? (
          <p style={{ fontSize: 13, color: 'var(--text-3)', fontStyle: 'italic', textAlign: 'center', padding: '32px 0' }}>
            Ajoutez au moins 2 entrées pour voir le graphique.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F5" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} width={32} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v) => [`${v}%`, 'Progression']} contentStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={{ r: 4, fill: color }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {history.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <p className="section-label">Historique</p>
          </div>
          <table style={{ width: '100%', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '8px 20px', fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>Date</th>
                <th style={{ textAlign: 'left', padding: '8px 20px', fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>Progression</th>
                <th style={{ textAlign: 'left', padding: '8px 20px', fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>Note</th>
              </tr>
            </thead>
            <tbody>
              {[...history].sort((a, b) => b.date.localeCompare(a.date)).map((h, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 20px', color: 'var(--text-2)' }}>{h.date}</td>
                  <td style={{ padding: '10px 20px', fontWeight: 700, color }}>{h.value}%</td>
                  <td style={{ padding: '10px 20px', color: 'var(--text-3)', fontSize: 12 }}>{h.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card">
        <p className="section-label" style={{ marginBottom: 16 }}>Ajouter une mise à jour</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="rappels-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Progression : {progress}%</label>
              <input
                type="range" min={0} max={100}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="slider"
                style={{ '--val': `${progress}%`, marginTop: 8 }}
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Note (optionnelle)</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Contexte, observations…" className="input" />
          </div>
          <Button onClick={handleSave} style={{ background: color }}>Enregistrer</Button>
        </div>
      </div>
    </div>
  )
}

/* ── TAB Notes ── */
function NotesTab({ objectifId, color }) {
  const storageKey = `obj_notes_${objectifId}`
  const [saved, setSaved] = useLocalStorage(storageKey, '')
  const [draft, setDraft] = useState(saved)
  const [lastSaved, setLastSaved] = useState(null)
  const timerRef = useRef(null)

  function handleChange(e) {
    const val = e.target.value
    setDraft(val)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setSaved(val)
      setLastSaved(new Date())
    }, 500)
  }

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <p className="section-label">Notes libres</p>
        {lastSaved && (
          <span className="saved-pill">
            <span className="dot" />
            Sauvegardé à {lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
      <textarea
        value={draft}
        onChange={handleChange}
        placeholder="Écris tes notes, réflexions, idées…"
        className="journal-textarea"
        style={{ minHeight: 320 }}
      />
    </div>
  )
}

/* ── TAB Actions (Kanban) ── */
const COLONNES = [
  { id: 'todo',  label: 'À faire' },
  { id: 'doing', label: 'En cours' },
  { id: 'done',  label: 'Fait' },
]
const COLONNE_COLORS = { todo: '#AAAAAA', doing: '#F5A623', done: '#00C896' }

function ActionsTab({ objectifId, color }) {
  const [tasks, setTasks] = useLocalStorage(`obj_tasks_${objectifId}`, [])
  const [newTask, setNewTask] = useState({ todo: '', doing: '', done: '' })

  function addTask(colonne) {
    const titre = newTask[colonne].trim()
    if (!titre) return
    setTasks((prev) => [...prev, { id: uuidv4(), titre, colonne, createdAt: new Date().toISOString() }])
    setNewTask((prev) => ({ ...prev, [colonne]: '' }))
  }

  function moveTask(taskId, toColonne) {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, colonne: toColonne } : t))
  }

  function deleteTask(taskId) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
  }

  return (
    <div className="kanban-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
      {COLONNES.map((col) => {
        const colTasks = tasks.filter((t) => t.colonne === col.id)
        const colColor = COLONNE_COLORS[col.id]
        const nextCols = COLONNES.filter((c) => c.id !== col.id)
        return (
          <div key={col.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: colColor, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', flex: 1 }}>{col.label}</span>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{colTasks.length}</span>
            </div>
            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 120 }}>
              {colTasks.map((task) => (
                <div key={task.id} className="card" style={{ padding: '10px 12px', background: 'var(--bg)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 8 }}>
                    <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-1)', lineHeight: 1.4, flex: 1 }}>{task.titre}</p>
                    <button onClick={() => deleteTask(task.id)} className="btn-icon" style={{ width: 20, height: 20 }}>
                      <X size={11} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {nextCols.map((nc) => (
                      <button
                        key={nc.id}
                        onClick={() => moveTask(task.id, nc.id)}
                        style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, border: '1px solid var(--border)', color: 'var(--text-3)', cursor: 'pointer', background: 'none', fontFamily: 'inherit' }}
                      >
                        → {nc.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                <input
                  value={newTask[col.id]}
                  onChange={(e) => setNewTask((p) => ({ ...p, [col.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && addTask(col.id)}
                  placeholder="Nouvelle tâche…"
                  className="input"
                  style={{ fontSize: 12, padding: '6px 10px', flex: 1 }}
                />
                <button
                  onClick={() => addTask(col.id)}
                  className="btn btn-secondary btn-sm"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── TAB Rappels ── */
const FREQ_RAPPEL = ['Une fois', 'Quotidien', 'Hebdomadaire']

function RappelsTab({ objectifId, color }) {
  const [rappels, setRappels] = useLocalStorage(`obj_rappels_${objectifId}`, [])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ message: '', date: todayKey(), heure: '09:00', frequence: 'Une fois' })

  function setF(k, v) { setForm((p) => ({ ...p, [k]: v })) }

  function addRappel() {
    if (!form.message.trim()) return
    setRappels((prev) => [...prev, { ...form, id: uuidv4(), createdAt: new Date().toISOString() }])
    setForm({ message: '', date: todayKey(), heure: '09:00', frequence: 'Une fois' })
    setShowForm(false)
  }

  function deleteRappel(id) {
    setRappels((prev) => prev.filter((r) => r.id !== id))
  }

  const now = new Date()
  const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const isUpcoming = (r) => {
    const d = new Date(r.date + 'T' + (r.heure || '00:00'))
    return d >= now && d <= in7
  }

  const sorted = useMemo(() => [...rappels].sort((a, b) => a.date.localeCompare(b.date)), [rappels])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>Rappels &amp; alertes</p>
        <Button size="sm" onClick={() => setShowForm((v) => !v)} style={{ background: color }}>
          <Plus size={13} /> Ajouter
        </Button>
      </div>

      {showForm && (
        <div className="card" style={{ borderColor: color, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            value={form.message}
            onChange={(e) => setF('message', e.target.value)}
            placeholder="Message du rappel *"
            className="input"
          />
          <div className="rappels-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <input type="date" value={form.date} onChange={(e) => setF('date', e.target.value)} className="input" />
            <input type="time" value={form.heure} onChange={(e) => setF('heure', e.target.value)} className="input" />
            <select value={form.frequence} onChange={(e) => setF('frequence', e.target.value)} className="input">
              {FREQ_RAPPEL.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" size="sm" onClick={() => setShowForm(false)} className="flex-1">Annuler</Button>
            <Button size="sm" onClick={addRappel} disabled={!form.message.trim()} style={{ flex: 1, background: color }}>
              Enregistrer
            </Button>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: '32px 0' }}>
          Aucun rappel configuré.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sorted.map((r) => {
            const upcoming = isUpcoming(r)
            return (
              <div
                key={r.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: 14, background: 'var(--bg)', borderRadius: 10,
                  border: `1.5px solid ${upcoming ? color : 'var(--border)'}`,
                }}
              >
                {upcoming && <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{r.message}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{r.date} à {r.heure} · {r.frequence}</p>
                </div>
                {upcoming && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: color + '22', color }}>
                    Bientôt
                  </span>
                )}
                <button onClick={() => deleteRappel(r.id)} className="btn-icon">
                  <X size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
