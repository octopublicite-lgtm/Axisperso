import { useState, useMemo } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts'
import { FORTUNE_ACTIF_CATEGORIES } from '../../utils/constants'
import { todayKey } from '../../utils/dates'
import { v4 as uuidv4 } from 'uuid'

const fmt = (n) => Number(n || 0).toLocaleString('fr-MA') + ' MAD'

const CAT_COLORS = [
  '#00C896', '#6C63FF', '#FF6B35', '#F5A623', '#0EA5E9',
  '#E91E8C', '#10B981', '#8B5CF6',
]

function getMonthKey(offset) {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getLast12Months() {
  return Array.from({ length: 12 }, (_, i) => getMonthKey(i - 11))
}

function getLast6Months() {
  return Array.from({ length: 6 }, (_, i) => getMonthKey(i - 5))
}

function shortMonth(key) {
  const [y, m] = key.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('fr-FR', { month: 'short' })
}

export default function Bilan() {
  const [actifs] = useLocalStorage('axislife_fortune_actifs', [])
  const [passifs] = useLocalStorage('axislife_fortune_passifs', [])
  const [historique, setHistorique] = useLocalStorage('axislife_fortune_historique', [])

  const safeActifs  = actifs  ?? []
  const safePassifs = passifs ?? []

  const totalActifs  = safeActifs.reduce((s, a) => s + a.valeur, 0)
  const totalPassifs = safePassifs.reduce((s, p) => s + p.valeur, 0)
  const fortuneNette = totalActifs - totalPassifs

  const currentMonthKey = getMonthKey(0)

  function saveSnapshot() {
    const entry = { id: uuidv4(), mois: currentMonthKey, fortune_nette: fortuneNette, total_actifs: totalActifs, total_passifs: totalPassifs }
    setHistorique((prev) => {
      const filtered = (prev ?? []).filter((h) => h.mois !== currentMonthKey)
      return [...filtered, entry].sort((a, b) => a.mois.localeCompare(b.mois))
    })
  }

  const last12 = getLast12Months()
  const last6  = getLast6Months()

  // Line chart: fortune nette history
  const lineData = last12.map((key) => {
    const snap = (historique ?? []).find((h) => h.mois === key)
    return { month: shortMonth(key), value: snap?.fortune_nette ?? null }
  })

  // Donut: actifs by category
  const donutData = useMemo(() => {
    const map = {}
    safeActifs.forEach((a) => {
      map[a.categorie] = (map[a.categorie] ?? 0) + a.valeur
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [safeActifs])

  // Bar chart: revenus vs dépenses last 6 months
  const barData = last6.map((key) => {
    const raw = localStorage.getItem(`axislife_flux_${key}`)
    let revenus = 0, depenses = 0
    if (raw) {
      try {
        const d = JSON.parse(raw)
        revenus  = (d.revenus  ?? []).reduce((s, r) => s + Number(r.montant), 0)
        depenses = (d.depenses ?? []).reduce((s, d) => s + Number(d.montant), 0)
      } catch {}
    }
    return { month: shortMonth(key), revenus, depenses }
  })

  // Indicateurs
  const last3Months = getLast12Months().slice(-3)
  const tauxMoyen = useMemo(() => {
    const rates = last3Months.map((key) => {
      const raw = localStorage.getItem(`axislife_flux_${key}`)
      if (!raw) return null
      try {
        const d = JSON.parse(raw)
        const r = (d.revenus  ?? []).reduce((s, r) => s + Number(r.montant), 0)
        const e = (d.depenses ?? []).reduce((s, d) => s + Number(d.montant), 0)
        return r > 0 ? ((r - e) / r) * 100 : null
      } catch { return null }
    }).filter((v) => v !== null)
    return rates.length ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : null
  }, [])

  const meilleureSource = useMemo(() => {
    const currentRaw = localStorage.getItem(`axislife_flux_${currentMonthKey}`)
    if (!currentRaw) return null
    try {
      const d = JSON.parse(currentRaw)
      const best = (d.revenus ?? []).reduce((a, b) => Number(b.montant) > Number(a?.montant ?? 0) ? b : a, null)
      return best ? `${best.source} (${fmt(best.montant)})` : null
    } catch { return null }
  }, [currentMonthKey])

  const grosseDepense = useMemo(() => {
    const currentRaw = localStorage.getItem(`axislife_flux_${currentMonthKey}`)
    if (!currentRaw) return null
    try {
      const d = JSON.parse(currentRaw)
      const rec = (d.depenses ?? []).filter((dp) => dp.recurrent)
      const best = rec.reduce((a, b) => Number(b.montant) > Number(a?.montant ?? 0) ? b : a, null)
      return best ? `${best.libelle} (${fmt(best.montant)})` : null
    } catch { return null }
  }, [currentMonthKey])

  const delaiLiberte = useMemo(() => {
    const last = barData[barData.length - 1]
    if (!last || last.depenses === 0 || fortuneNette <= 0) return null
    return Math.round(fortuneNette / last.depenses)
  }, [barData, fortuneNette])

  const indicators = [
    { label: 'Taux épargne moyen (3 mois)', value: tauxMoyen !== null ? `${tauxMoyen}%` : '—' },
    { label: 'Meilleure source de revenus',  value: meilleureSource ?? '—' },
    { label: 'Plus grosse dépense récurrente', value: grosseDepense ?? '—' },
    { label: 'Délai liberté financière',     value: delaiLiberte !== null ? `${delaiLiberte} mois` : '—' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Évolution fortune nette */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>Évolution Fortune Nette</p>
          <button className="btn btn-primary btn-sm" onClick={saveSnapshot}>Enregistrer le bilan du mois</button>
        </div>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#AAAAAA' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={(v) => v !== null ? fmt(v) : '—'} contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="value" stroke="#F5A623" strokeWidth={2.5} dot={{ r: 3, fill: '#F5A623' }} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bilan-charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Donut: répartition actifs */}
        <div className="card">
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 16 }}>Répartition Actifs</p>
          {donutData.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Aucun actif.</p>
          ) : (
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name">
                    {donutData.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                  <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Bar: revenus vs dépenses */}
        <div className="card">
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 16 }}>Revenus vs Dépenses (6 mois)</p>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barSize={14}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#AAAAAA' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="revenus"  fill="#00C896" radius={[4, 4, 0, 0]} name="Revenus" />
                <Bar dataKey="depenses" fill="#EF4444" radius={[4, 4, 0, 0]} name="Dépenses" />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Indicateurs clefs */}
      <div>
        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 14 }}>Indicateurs Clefs</p>
        <div className="bilan-indicators-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {indicators.map(({ label, value }) => (
            <div key={label} className="card" style={{ padding: '16px' }}>
              <p className="section-label" style={{ marginBottom: 8 }}>{label}</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.01em', wordBreak: 'break-word' }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
