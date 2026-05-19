import { useMemo, useRef, useState, useEffect } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  BarChart, Bar, Cell, LabelList,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import { getDomainColor } from '../../utils/colors'
import { DOMAINS } from '../../utils/constants'
import { getISOWeek } from '../../utils/dates'

function ChartCard({ title, subtitle, children, style }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: 24,
      border: '1.5px solid #EEEEEE', ...style,
    }}>
      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 2px' }}>{title}</p>
      {subtitle && <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '0 0 16px' }}>{subtitle}</p>}
      {children}
    </div>
  )
}

function getLast8Weeks() {
  const weeks = []
  for (let i = 7; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i * 7)
    const day = d.getDay()
    const monday = new Date(d)
    monday.setDate(d.getDate() - day + (day === 0 ? -6 : 1))
    monday.setHours(0, 0, 0, 0)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    const fmt = (dt) => dt.toISOString().split('T')[0]
    weeks.push({ label: `S${getISOWeek(monday)}`, start: fmt(monday), end: fmt(sunday) })
  }
  return weeks
}

const CustomTooltip = ({ active, payload, label, suffix = '%', prefix = '' }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #EEE', borderRadius: 10, padding: '8px 14px', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-1)' }}>{label}</p>
      <p style={{ margin: '2px 0 0', color: '#FF6B35' }}>{prefix}{payload[0].value}{suffix}</p>
    </div>
  )
}

export default function DisciplineCharts({ allLogs, habitudes }) {
  const sectionRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // ── Chart 1: Weekly completion rate (last 8 weeks) ────────────────────────
  const weeklyData = useMemo(() => {
    if (!allLogs.length || !habitudes.length) return []
    const weeks = getLast8Weeks()
    return weeks.map(({ label, start, end }) => {
      const pairs = new Set(
        allLogs
          .filter((l) => l.date >= start && l.date <= end)
          .map((l) => `${l.habitude_id}|${l.date}`)
      )
      const pct = Math.round((pairs.size / (habitudes.length * 7)) * 100)
      return { week: label, pct: Math.min(pct, 100) }
    })
  }, [allLogs, habitudes])

  // ── Chart 2: Top habits by total days ────────────────────────────────────
  const topHabitsData = useMemo(() => {
    if (!allLogs.length || !habitudes.length) return []
    const counts = {}
    allLogs.forEach((l) => { counts[l.habitude_id] = (counts[l.habitude_id] ?? 0) + 1 })
    return habitudes
      .map((h) => ({ id: h.id, name: h.titre || h.nom || '', days: counts[h.id] ?? 0, domaine: h.domaine }))
      .sort((a, b) => b.days - a.days)
      .slice(0, 8)
  }, [allLogs, habitudes])

  // ── Chart 3: Domain consistency this month ────────────────────────────────
  const radarData = useMemo(() => {
    if (!allLogs.length || !habitudes.length) return []
    const now = new Date()
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const daysSoFar = now.getDate()
    const logsThisMonth = allLogs.filter((l) => l.date.startsWith(monthStr))
    const domainsUsed = DOMAINS.filter((d) => habitudes.some((h) => h.domaine === d.id)).slice(0, 8)
    return domainsUsed.map((domain) => {
      const inDomain = habitudes.filter((h) => h.domaine === domain.id)
      const possible = inDomain.length * daysSoFar
      if (!possible) return { domain: `${domain.icon} ${domain.label.split(' ')[0]}`, pct: 0 }
      const done = new Set(
        logsThisMonth
          .filter((l) => inDomain.some((h) => h.id === l.habitude_id))
          .map((l) => `${l.habitude_id}|${l.date}`)
      ).size
      return { domain: `${domain.icon} ${domain.label.split(' ')[0]}`, pct: Math.round((done / possible) * 100) }
    })
  }, [allLogs, habitudes])

  const maxDays = Math.max(...topHabitsData.map((d) => d.days), 1)

  if (!habitudes.length) return null

  return (
    <div ref={sectionRef} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
        📈 Développement de la discipline
      </p>

      {/* Chart 1 — Full width area */}
      <ChartCard
        title="Taux de réalisation hebdomadaire"
        subtitle="% d'habitudes complétées par semaine sur les 8 dernières semaines"
      >
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={weeklyData} margin={{ top: 10, right: 56, left: -14, bottom: 0 }}>
            <defs>
              <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6B35" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#FF6B35" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#F5F5F7" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#BBB' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#BBB' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip suffix="%" />} labelFormatter={(l) => `Semaine ${l}`} />
            <ReferenceLine
              y={80} stroke="#FF6B35" strokeDasharray="5 4" strokeWidth={1.5}
              label={{ value: 'Objectif 80%', position: 'right', fontSize: 11, fill: '#FF6B35', fontWeight: 600 }}
            />
            <Area
              type="monotone" dataKey="pct"
              stroke="#FF6B35" strokeWidth={2.5}
              fill="url(#orangeGrad)"
              dot={{ fill: '#FF6B35', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#FF6B35' }}
              isAnimationActive={isVisible}
              animationBegin={0}
              animationDuration={1200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Chart 2 + Chart 3 side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Chart 2 — Horizontal bars */}
        <ChartCard title="Top habitudes" subtitle="Jours complétés au total (toutes périodes)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart layout="vertical" data={topHabitsData} margin={{ top: 0, right: 36, left: 4, bottom: 0 }}>
              <CartesianGrid stroke="#F5F5F7" horizontal={false} />
              <XAxis type="number" domain={[0, maxDays]} tick={{ fontSize: 11, fill: '#BBB' }} axisLine={false} tickLine={false} />
              <YAxis
                type="category" dataKey="name" width={88}
                tick={{ fontSize: 11, fill: '#555', width: 85 }}
                axisLine={false} tickLine={false}
              />
              <Tooltip
                formatter={(v) => [`${v} jours`, 'Complétés']}
                contentStyle={{ borderRadius: 10, border: '1px solid #EEE', fontSize: 12 }}
              />
              <Bar dataKey="days" radius={[0, 6, 6, 0]} isAnimationActive={isVisible} animationBegin={0} animationDuration={900}>
                {topHabitsData.map((entry, i) => (
                  <Cell key={entry.id} fill={getDomainColor(entry.domaine)} />
                ))}
                <LabelList dataKey="days" position="right" style={{ fontSize: 11, fontWeight: 700, fill: '#999' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 3 — Radar */}
        <ChartCard title="Consistance par domaine" subtitle="% de complétion ce mois par domaine de vie">
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData} margin={{ top: 10, right: 24, left: 24, bottom: 10 }}>
              <PolarGrid stroke="#EEEEEE" />
              <PolarAngleAxis dataKey="domain" tick={{ fontSize: 10, fill: '#888' }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: '#CCC' }} tickCount={4} />
              <Radar
                dataKey="pct"
                stroke="#FF6B35" fill="#FF6B35" fillOpacity={0.18} strokeWidth={2}
                isAnimationActive={isVisible}
                animationBegin={0}
                animationDuration={800}
              />
              <Tooltip
                formatter={(v) => [`${v}%`, 'Complétion']}
                contentStyle={{ borderRadius: 10, border: '1px solid #EEE', fontSize: 12 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </div>
  )
}
