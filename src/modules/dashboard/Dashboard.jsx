import PageWrapper from '../../components/layout/PageWrapper'
import MeteoBlock from './MeteoBlock'
import PrioritesBlock from './PrioritesBlock'
import ObjectifsBlock from './ObjectifsBlock'
import HabitudesBlock from './HabitudesBlock'
import { formatDateFR } from '../../utils/dates'
import { useApp } from '../../context/AppContext'
import { getLast7Days, todayKey } from '../../utils/dates'
import { useLocalStorage } from '../../hooks/useLocalStorage'

function useWeekScore() {
  const days = getLast7Days()
  const scores = days.map(day => {
    const [p] = [JSON.parse(localStorage.getItem(`priorites_${day}`) || '[]')]
    if (!p.length) return null
    return Math.round((p.filter(x => x.done).length / p.length) * 100)
  }).filter(x => x !== null)
  return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
}

export default function Dashboard() {
  const { settings, objectifs, habitudes, getStreak, isLogged } = useApp()
  const today = todayKey()
  const nom = settings?.nom ?? 'Vous'

  const actifsCount = objectifs.filter(o => o.status === 'En cours').length
  const habitsDone = habitudes.filter(h => isLogged(h.id, today)).length
  const habitsTotal = habitudes.length

  const avgStreak = habitudes.length
    ? Math.round(habitudes.reduce((a, h) => a + getStreak(h.id), 0) / habitudes.length)
    : 0

  const weekScore = useWeekScore()
  const dateStr = formatDateFR()

  return (
    <PageWrapper>
      {/* Greeting row */}
      <div className="greeting-row">
        <div>
          <h1 className="page-title">Bonjour, {nom} 👋</h1>
          <p className="page-subtitle" style={{ textTransform: 'capitalize' }}>{dateStr}</p>
        </div>
        <MeteoBlock />
      </div>

      {/* Stats grid */}
      <div className="stats-grid">
        <div className="stat-card scale-in" style={{ animationDelay: '0ms' }}>
          <span className="label">Objectifs actifs</span>
          <span className="value" style={{ '--c': '#FF6B35' }}>{actifsCount}</span>
          <span className="delta">en cours de réalisation</span>
        </div>
        <div className="stat-card scale-in" style={{ animationDelay: '60ms' }}>
          <span className="label">Habitudes du jour</span>
          <span className="value" style={{ '--c': '#00C896' }}>
            {habitsDone}<span style={{ fontSize: 18, color: 'var(--text-3)' }}>/{habitsTotal}</span>
          </span>
          <span className="delta">{habitsTotal === 0 ? 'aucune habitude' : habitsDone === habitsTotal ? 'tout accompli ✨' : 'en progression'}</span>
        </div>
        <div className="stat-card scale-in" style={{ animationDelay: '120ms' }}>
          <span className="label">Streak moyen</span>
          <span className="value" style={{ '--c': '#6C63FF' }}>
            {avgStreak}<span style={{ fontSize: 16, color: 'var(--text-3)' }}> j</span>
          </span>
          <span className="delta">sur toutes les habitudes</span>
        </div>
        <div className="stat-card scale-in" style={{ animationDelay: '180ms' }}>
          <span className="label">Score semaine</span>
          <span className="value" style={{ '--c': '#F5A623' }}>
            {weekScore !== null ? `${weekScore}%` : '—'}
          </span>
          <span className="delta">priorités accomplies</span>
        </div>
      </div>

      {/* Priorités */}
      <div className="section-block">
        <div className="section-header">
          <p className="section-label">Mes 3 priorités du jour</p>
        </div>
        <PrioritesBlock />
      </div>

      {/* Habitudes */}
      <div className="section-block">
        <div className="section-header">
          <p className="section-label">Habitudes du jour · {habitsDone}/{habitsTotal}</p>
        </div>
        <HabitudesBlock />
      </div>

      {/* Objectifs à surveiller */}
      <div className="section-block">
        <div className="section-header">
          <p className="section-label">Objectifs à surveiller</p>
          <a href="/objectifs" style={{ fontSize: 12, color: 'var(--orange)', fontWeight: 600, textDecoration: 'none' }}>
            Tous les objectifs →
          </a>
        </div>
        <ObjectifsBlock />
      </div>
    </PageWrapper>
  )
}
