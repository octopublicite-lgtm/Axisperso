import { useLocalStorage } from '../../hooks/useLocalStorage'
import { todayKey } from '../../utils/dates'
import { METEO_OPTIONS } from '../../utils/constants'

export default function MeteoBlock() {
  const key = `meteo_${todayKey()}`
  const [meteo, setMeteo] = useLocalStorage(key, null)

  return (
    <div className="mood-row">
      <span className="mood-label">Météo mentale</span>
      <div className="mood-btns">
        {METEO_OPTIONS.map((opt) => (
          <button
            key={opt.emoji}
            onClick={() => setMeteo(opt.emoji)}
            aria-label={opt.label}
            className={`mood-btn${meteo === opt.emoji ? ' active' : ''}`}
            title={opt.label}
          >
            {opt.emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
