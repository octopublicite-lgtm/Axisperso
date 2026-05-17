import { useApp } from '../../context/AppContext'
import { todayKey } from '../../utils/dates'
import { getDomainColor } from '../../utils/colors'
import { DOMAINS } from '../../utils/constants'

export default function HabitudesBlock() {
  const { habitudes, toggleLog, isLogged, getStreak } = useApp()
  const today = todayKey()

  if (habitudes.length === 0) {
    return (
      <div className="card empty-state">
        <div className="emoji">🔁</div>
        <div className="title">Aucune habitude</div>
        <div className="desc">Ajoutez vos habitudes dans la section Objectifs.</div>
      </div>
    )
  }

  return (
    <div className="habits-scroll">
      {habitudes.map((h) => {
        const domain = DOMAINS.find((d) => d.id === h.domaine)
        const color = getDomainColor(h.domaine)
        const logged = isLogged(h.id, today)
        const streak = getStreak(h.id)
        const name = h.titre || h.nom
        return (
          <div
            key={h.id}
            className={`habit-card${logged ? ' done' : ''}`}
            style={{ '--c': color }}
            onClick={() => toggleLog(h.id, today)}
          >
            <span className="emoji">{h.icon}</span>
            <div className="info">
              <div className="title">{name}</div>
              <div className="streak">
                <span className="flame">🔥</span>
                {streak > 0 ? `${streak}j` : domain?.label ?? ''}
              </div>
            </div>
            <div
              className={`checkbox${logged ? ' checked' : ''}`}
              style={{ '--c': color }}
              onClick={(e) => { e.stopPropagation(); toggleLog(h.id, today) }}
            >
              {logged && (
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
