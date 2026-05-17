import { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { getDomainColor } from '../../utils/colors'
import { getStreakColor } from '../../utils/colors'
import ProgressBar from '../../components/ui/ProgressBar'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

function getLast30Days() {
  const days = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

export default function SuiviDomaine({ domaine }) {
  const { objectifs, habitudes, isLogged, getStreak } = useApp()
  const [tab, setTab] = useState('objectifs')
  const color = getDomainColor(domaine)

  const domainObjectifs = objectifs.filter((o) => o.domaine === domaine && o.status === 'En cours')
  const domainHabitudes = habitudes.filter((h) => h.domaine === domaine)
  const last30 = useMemo(() => getLast30Days(), [])

  const daysElapsed = new Date().getDate()

  return (
    <div className="mt-8">
      <h2 className="text-base font-bold text-primary mb-4">Suivi &amp; Réalisation</h2>

      <div className="flex gap-1 mb-5 bg-bg rounded-lg p-1 w-fit">
        {['objectifs', 'habitudes'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
              tab === t ? 'bg-surface shadow-sm text-primary' : 'text-muted hover:text-primary'
            }`}
          >
            {t === 'objectifs' ? 'Objectifs' : 'Habitudes'}
          </button>
        ))}
      </div>

      {tab === 'objectifs' && (
        <div className="flex flex-col gap-5">
          {domainObjectifs.length === 0 && (
            <p className="text-sm text-muted">Aucun objectif en cours pour ce domaine.</p>
          )}
          {domainObjectifs.map((o) => {
            const history = o.progressHistory ?? []
            const chartData = history.map((h) => ({
              date: h.date.slice(5).replace('-', '/'),
              value: h.value,
            }))
            return (
              <div key={o.id} className="bg-surface border border-border rounded-xl p-4">
                <p className="text-sm font-bold text-primary mb-2">{o.titre}</p>
                <div className="flex items-center gap-2 mb-3">
                  <ProgressBar value={o.progress} color={color} height={6} className="flex-1" />
                  <span className="text-xs font-bold text-secondary w-8 text-right">{o.progress}%</span>
                </div>
                {chartData.length <= 1 ? (
                  <p className="text-xs text-muted italic">
                    Mettez à jour la progression pour voir l&apos;évolution
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={80}>
                    <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} width={28} />
                      <Tooltip
                        formatter={(v) => [`${v}%`, 'Progression']}
                        contentStyle={{ fontSize: 11, padding: '4px 8px' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2}
                        dot={{ r: 3, fill: color }}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            )
          })}
        </div>
      )}

      {tab === 'habitudes' && (
        <div className="flex flex-col gap-4">
          {domainHabitudes.length === 0 && (
            <p className="text-sm text-muted">Aucune habitude pour ce domaine.</p>
          )}
          {domainHabitudes.map((h) => {
            const streak = getStreak(h.id)
            const doneThisMonth = last30.slice(-daysElapsed).filter((d) => isLogged(h.id, d)).length
            const completion = daysElapsed > 0 ? Math.round((doneThisMonth / daysElapsed) * 100) : 0
            const name = h.titre || h.nom

            return (
              <div key={h.id} className="bg-surface border border-border rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">{h.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary truncate">{name}</p>
                    <p className="text-xs text-muted">{h.frequence}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {streak > 0 && (
                      <p className="text-sm font-bold" style={{ color: getStreakColor(streak) }}>🔥 {streak}</p>
                    )}
                    <p className="text-xs text-muted">{completion}% ce mois</p>
                  </div>
                </div>
                <div className="flex gap-0.5 flex-wrap">
                  {last30.map((day) => (
                    <div
                      key={day}
                      title={day}
                      className="w-4 h-4 rounded-sm flex-shrink-0"
                      style={{ background: isLogged(h.id, day) ? color : '#EEEEEE' }}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
