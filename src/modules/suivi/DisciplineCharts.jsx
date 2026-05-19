import { useMemo, useRef, useState, useEffect } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  BarChart, Bar, Cell, LabelList,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import { getDomainColor } from '../../utils/colors'
import { DOMAINS } from '../../utils/constants'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────────────────────────

function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1) }

function getMonthMeta(monthOffset) {
  const now = new Date()
  const ref = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  const year = ref.getFullYear()
  const month = ref.getMonth()
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const label = capitalize(ref.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }))
  return { year, month, monthStr, daysInMonth, label }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ChartCard({ title, subtitle, children, style, header }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: 24, border: '1.5px solid #EEEEEE', ...style }}>
      {header && <div style={{ marginBottom: 12 }}>{header}</div>}
      {!header && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>{title}</p>
          {subtitle && <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '3px 0 0' }}>{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

function DailyTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  if (d.pct === null) return null
  const date = new Date(d.dateStr + 'T00:00:00')
  const label = capitalize(date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }))
  return (
    <div style={{ background: '#fff', border: '1px solid #EEE', borderRadius: 10, padding: '9px 14px', fontSize: 12, boxShadow: '0 4px 14px rgba(0,0,0,0.09)' }}>
      <p style={{ margin: '0 0 4px', fontWeight: 700, color: 'var(--text-1)' }}>{label}</p>
      <p style={{ margin: 0, color: '#FF6B35', fontWeight: 600 }}>
        {d.done}/{d.total} habitudes ({d.pct}%)
      </p>
    </div>
  )
}

function renderDot(today) {
  return function Dot({ cx, cy, payload }) {
    if (payload.pct === null) return null
    if (payload.dateStr === today) {
      return <circle cx={cx} cy={cy} r={7} fill="#FF6B35" stroke="#fff" strokeWidth={2} />
    }
    return <circle cx={cx} cy={cy} r={3} fill="#FF6B35" strokeWidth={0} />
  }
}

function StatPill({ children }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 12, fontWeight: 600, color: 'var(--text-2)',
      background: '#F7F7F9', borderRadius: 99, padding: '5px 12px',
      border: '1px solid #EEEEEE',
    }}>
      {children}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DisciplineCharts({ allLogs, habitudes }) {
  const sectionRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const [monthOffset, setMonthOffset] = useState(0)

  const todayStr = new Date().toISOString().split('T')[0]

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

  // ── Chart 1: Daily completion for selected month ──────────────────────────
  const { monthStr, daysInMonth, label: monthLabel } = useMemo(() => getMonthMeta(monthOffset), [monthOffset])

  const dailyData = useMemo(() => {
    if (!habitudes.length) return []
    const total = habitudes.length
    return Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1
      const dateStr = `${monthStr}-${String(dayNum).padStart(2, '0')}`
      const isFuture = dateStr > todayStr
      if (isFuture) return { day: dayNum, dateStr, pct: null, done: 0, total, isToday: false }
      const done = new Set(
        allLogs.filter((l) => l.date === dateStr).map((l) => l.habitude_id)
      ).size
      const pct = Math.round((done / total) * 100)
      return { day: dayNum, dateStr, pct, done, total, isToday: dateStr === todayStr }
    })
  }, [allLogs, habitudes, monthStr, daysInMonth, todayStr])

  const stats = useMemo(() => {
    const valid = dailyData.filter((d) => d.pct !== null)
    if (!valid.length) return null
    const best = Math.max(...valid.map((d) => d.pct))
    const avg = Math.round(valid.reduce((s, d) => s + d.pct, 0) / valid.length)
    const perfect = valid.filter((d) => d.pct === 100).length
    return { best, avg, perfect }
  }, [dailyData])

  // X axis: show every 5th day to avoid crowding
  const xTicks = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1).filter((d) => d === 1 || d % 5 === 0),
    [daysInMonth]
  )

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
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const daysSoFar = now.getDate()
    const logsThisMonth = allLogs.filter((l) => l.date.startsWith(currentMonthStr))
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
  const DotRenderer = useMemo(() => renderDot(todayStr), [todayStr])

  if (!habitudes.length) return null

  return (
    <div ref={sectionRef} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
        📈 Développement de la discipline
      </p>

      {/* Chart 1 — Daily view with month selector */}
      <ChartCard
        header={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
                  Taux de réalisation quotidien
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '3px 0 0' }}>
                  % d'habitudes complétées chaque jour du mois sélectionné
                </p>
              </div>
              {/* Month selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '4px 8px' }}
                  onClick={() => setMonthOffset((v) => v - 1)}
                >
                  <ChevronLeft size={15} />
                </button>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', minWidth: 96, textAlign: 'center' }}>
                  {monthLabel}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '4px 8px' }}
                  onClick={() => setMonthOffset((v) => v + 1)}
                  disabled={monthOffset >= 0}
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>
        }
      >
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={dailyData} margin={{ top: 10, right: 56, left: -14, bottom: 0 }}>
            <defs>
              <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6B35" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#FF6B35" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#F5F5F7" vertical={false} />
            <XAxis
              dataKey="day"
              ticks={xTicks}
              tick={{ fontSize: 11, fill: '#BBB' }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11, fill: '#BBB' }}
              axisLine={false} tickLine={false}
            />
            <Tooltip content={<DailyTooltip />} />
            <ReferenceLine
              y={80} stroke="#FF6B35" strokeDasharray="5 4" strokeWidth={1.5}
              label={{ value: 'Objectif 80%', position: 'right', fontSize: 11, fill: '#FF6B35', fontWeight: 600 }}
            />
            <Area
              type="monotone" dataKey="pct" connectNulls={false}
              stroke="#FF6B35" strokeWidth={2.5}
              fill="url(#orangeGrad)"
              dot={<DotRenderer />}
              activeDot={{ r: 6, fill: '#FF6B35' }}
              isAnimationActive={isVisible}
              animationBegin={0}
              animationDuration={1200}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Summary stats */}
        {stats && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
            <StatPill>🏆 Meilleur jour : {stats.best}%</StatPill>
            <StatPill>📊 Moyenne du mois : {stats.avg}%</StatPill>
            <StatPill>🔥 Jours à 100% : {stats.perfect} jour{stats.perfect > 1 ? 's' : ''}</StatPill>
          </div>
        )}
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
                tick={{ fontSize: 11, fill: '#555' }}
                axisLine={false} tickLine={false}
              />
              <Tooltip
                formatter={(v) => [`${v} jours`, 'Complétés']}
                contentStyle={{ borderRadius: 10, border: '1px solid #EEE', fontSize: 12 }}
              />
              <Bar dataKey="days" radius={[0, 6, 6, 0]} isAnimationActive={isVisible} animationBegin={0} animationDuration={900}>
                {topHabitsData.map((entry) => (
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
