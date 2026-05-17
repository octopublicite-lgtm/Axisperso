import { useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { todayKey } from '../../utils/dates'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

const EMPTY_KPI = { nom: '', unite: '', cible: '', historique: [] }

export default function KPIsTab() {
  const [kpis, setKpis] = useLocalStorage('kpis', [])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_KPI)
  const [newValues, setNewValues] = useState({})

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })) }

  function addKpi() {
    if (!form.nom.trim()) return
    setKpis((prev) => [...prev, { ...form, id: uuidv4(), cible: Number(form.cible) }])
    setForm(EMPTY_KPI)
    setShowForm(false)
  }

  function addValue(kpiId) {
    const val = Number(newValues[kpiId])
    if (isNaN(val)) return
    setKpis((prev) => prev.map((k) =>
      k.id === kpiId
        ? { ...k, historique: [...(k.historique ?? []), { date: todayKey(), valeur: val }] }
        : k
    ))
    setNewValues((prev) => ({ ...prev, [kpiId]: '' }))
  }

  function deleteKpi(id) {
    if (confirm('Supprimer ce KPI ?')) setKpis((prev) => prev.filter((k) => k.id !== id))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>Mes KPIs</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
          <Plus size={14} /> Nouveau KPI
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ borderColor: 'var(--orange)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
              <input value={form.nom} onChange={(e) => set('nom', e.target.value)} placeholder="Nom *" className="input" />
              <input value={form.unite} onChange={(e) => set('unite', e.target.value)} placeholder="Unité (MAD, kg…)" className="input" />
            </div>
            <input type="number" value={form.cible} onChange={(e) => set('cible', e.target.value)} placeholder="Objectif cible" className="input" />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Annuler</button>
              <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={addKpi}>Créer</button>
            </div>
          </div>
        </div>
      )}

      {kpis.length === 0 && !showForm && (
        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Aucun KPI créé. Suivez vos métriques clés.</p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {kpis.map((kpi) => {
          const hist = kpi.historique ?? []
          const current = hist.length > 0 ? hist[hist.length - 1].valeur : null
          const prev = hist.length > 1 ? hist[hist.length - 2].valeur : null
          const diff = current !== null && prev !== null ? current - prev : null
          const pct = diff !== null && prev !== 0 ? ((diff / Math.abs(prev)) * 100).toFixed(1) : null
          const chartData = hist.slice(-12).map((h) => ({ date: h.date.slice(5), val: h.valeur }))

          return (
            <div key={kpi.id} className="kpi-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="label">{kpi.nom}</p>
                  <div className="value-row">
                    {current !== null && (
                      <span className="value">{current}</span>
                    )}
                    {kpi.unite && <span className="target">{kpi.unite}</span>}
                    {kpi.cible && current !== null && (
                      <span className="target">/ {kpi.cible}</span>
                    )}
                  </div>
                  {diff !== null && (
                    <span className={`trend ${diff >= 0 ? 'up' : 'down'}`}>
                      {diff >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {pct}%
                    </span>
                  )}
                </div>
                <button onClick={() => deleteKpi(kpi.id)} aria-label="Supprimer" className="btn-icon">
                  <Trash2 size={13} />
                </button>
              </div>

              {chartData.length > 1 && (
                <div style={{ height: 80, marginTop: 12 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#AAAAAA' }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ fontSize: 11, border: 'none', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                      <Line type="monotone" dataKey="val" stroke="#FF6B35" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <input
                  type="number"
                  value={newValues[kpi.id] ?? ''}
                  onChange={(e) => setNewValues((p) => ({ ...p, [kpi.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && addValue(kpi.id)}
                  placeholder={`Nouvelle valeur (${kpi.unite})`}
                  className="input"
                  style={{ flex: 1 }}
                />
                <button className="btn btn-primary btn-sm" onClick={() => addValue(kpi.id)}>+</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
