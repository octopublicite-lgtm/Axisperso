import ProgressBar from '../../components/ui/ProgressBar'
import Badge from '../../components/ui/Badge'
import { useApp } from '../../context/AppContext'
import { getDomainColor, getDomainLight } from '../../utils/colors'
import { DOMAINS, HORIZON_LABEL } from '../../utils/constants'
import { useNavigate } from 'react-router-dom'

export default function ObjectifsBlock() {
  const { objectifs } = useApp()
  const navigate = useNavigate()

  const actifs = [...objectifs]
    .filter((o) => o.status === 'En cours')
    .sort((a, b) => a.progress - b.progress)
    .slice(0, 3)

  if (actifs.length === 0) {
    return (
      <div className="card empty-state">
        <div className="emoji">🎯</div>
        <div className="title">Aucun objectif en cours</div>
        <div className="desc">Créez votre premier objectif pour commencer.</div>
      </div>
    )
  }

  return (
    <div className="watch-grid">
      {actifs.map((o) => {
        const domain = DOMAINS.find((d) => d.id === o.domaine)
        const color = getDomainColor(o.domaine)
        const light = getDomainLight(o.domaine)
        return (
          <div
            key={o.id}
            className="objectif-card"
            style={{ '--c': color }}
            onClick={() => navigate(`/objectifs/${o.id}`)}
          >
            <div className="title">{o.titre}</div>
            <div className="badges-row">
              <Badge color={color} bg={light}>{domain?.icon} {domain?.label}</Badge>
              <Badge color="#666" bg="#EEEEEE">{HORIZON_LABEL[o.horizon] ?? o.horizon}</Badge>
            </div>
            <div className="progress-row">
              <ProgressBar value={o.progress} color={color} />
              <span className="pct">{o.progress}%</span>
            </div>
            {o.kpi && (
              <div className="kpi-line">🎯 {o.kpi}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
