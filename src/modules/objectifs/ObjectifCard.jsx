import { useNavigate } from 'react-router-dom'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'
import { useApp } from '../../context/AppContext'
import { getDomainColor, getDomainLight } from '../../utils/colors'
import { DOMAINS, HORIZON_LABEL } from '../../utils/constants'
import { Pencil, Trash2 } from 'lucide-react'

function fmtDate(d) {
  if (!d) return null
  return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

const STATUT_COLORS = {
  'En cours':  { color: '#FF6B35', bg: '#FFF0EB' },
  'Atteint':   { color: '#10B981', bg: '#E6FAF5' },
  'Suspendu':  { color: '#AAAAAA', bg: '#F5F5F5' },
}

export default function ObjectifCard({ objectif: o, onEdit }) {
  const { deleteObjectif, addToast } = useApp()
  const navigate = useNavigate()

  const domain = DOMAINS.find((d) => d.id === o.domaine)
  const color = getDomainColor(o.domaine)
  const light = getDomainLight(o.domaine)
  const statut = STATUT_COLORS[o.status] ?? STATUT_COLORS['En cours']

  function handleDelete(e) {
    e.stopPropagation()
    if (confirm(`Supprimer "${o.titre}" ?`)) {
      deleteObjectif(o.id)
      addToast('Objectif supprimé', 'info')
    }
  }

  function handleEdit(e) {
    e.stopPropagation()
    onEdit(o)
  }

  return (
    <div
      className="objectif-card"
      style={{ '--c': color }}
      onClick={() => navigate(`/objectifs/${o.id}`)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div className="title">{o.titre}</div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button onClick={handleEdit} aria-label="Modifier" className="btn-icon">
            <Pencil size={13} />
          </button>
          <button onClick={handleDelete} aria-label="Supprimer" className="btn-icon">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {o.description && <div className="desc">{o.description}</div>}

      <div className="badges-row">
        <Badge color={color} bg={light}>{domain?.icon} {domain?.label}</Badge>
        <Badge color={statut.color} bg={statut.bg}>{o.status}</Badge>
        <Badge color="#666" bg="#EEEEEE">{HORIZON_LABEL[o.horizon] ?? o.horizon}</Badge>
      </div>

      <div className="progress-row">
        <ProgressBar value={o.progress} color={color} />
        <span className="pct">{o.progress}%</span>
      </div>

      {(o.date_debut || o.date_fin) && (
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
          📅 {fmtDate(o.date_debut)} → {fmtDate(o.date_fin)}
        </div>
      )}

      {o.kpi && <div className="kpi-line">🎯 {o.kpi}</div>}

      {o.milestones?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          {o.milestones.map((m) => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className={`checkbox${m.done ? ' checked' : ''}`} style={{ '--c': color, width: 16, height: 16 }} onClick={(e) => e.stopPropagation()}>
                {m.done && <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
              </div>
              <span style={{ fontSize: 12, color: m.done ? 'var(--text-3)' : 'var(--text-2)', textDecoration: m.done ? 'line-through' : 'none' }}>{m.texte}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
