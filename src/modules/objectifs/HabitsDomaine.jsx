import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { getDomainColor } from '../../utils/colors'
import { getStreakColor } from '../../utils/colors'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import HabitudeModal from './HabitudeModal'

export default function HabitsDomaine({ domaine }) {
  const { habitudes, deleteHabitude, getStreak, addToast } = useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)

  const domainHabitudes = habitudes.filter((h) => h.domaine === domaine)
  const color = getDomainColor(domaine)

  function openCreate() { setEditTarget(null); setModalOpen(true) }
  function openEdit(h) { setEditTarget(h); setModalOpen(true) }

  function handleDelete(h) {
    if (confirm(`Supprimer "${h.titre || h.nom}" ?`)) {
      deleteHabitude(h.id)
      addToast('Habitude supprimée', 'info')
    }
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-primary">Habitudes du domaine</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          style={{ background: color }}
        >
          <Plus size={13} /> Nouvelle habitude
        </button>
      </div>

      {domainHabitudes.length === 0 ? (
        <p className="text-sm text-muted">
          Aucune habitude pour ce domaine.{' '}
          <button onClick={openCreate} className="hover:underline" style={{ color }}>
            Créer une habitude
          </button>
        </p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {domainHabitudes.map((h) => (
            <HabitudeCard
              key={h.id}
              habitude={h}
              color={color}
              streak={getStreak(h.id)}
              onEdit={() => openEdit(h)}
              onDelete={() => handleDelete(h)}
            />
          ))}
        </div>
      )}

      <HabitudeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editTarget={editTarget}
        domaine={domaine}
      />
    </div>
  )
}

function HabitudeCard({ habitude: h, color, streak, onEdit, onDelete }) {
  const [hovering, setHovering] = useState(false)

  return (
    <div
      className="relative flex-shrink-0 w-40 rounded-xl p-3 border transition-all"
      style={{
        borderColor: hovering ? color : '#E8E8F0',
        background: '#FFFFFF',
        boxShadow: hovering ? `0 2px 12px ${color}22` : 'none',
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className={`absolute top-2 right-2 flex gap-0.5 transition-opacity ${hovering ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={onEdit}
          className="p-1 rounded text-muted hover:text-primary transition-colors"
          aria-label="Modifier"
        >
          <Pencil size={11} />
        </button>
        <button
          onClick={onDelete}
          className="p-1 rounded text-muted hover:text-red-500 transition-colors"
          aria-label="Supprimer"
        >
          <Trash2 size={11} />
        </button>
      </div>

      <div className="text-2xl mb-2">{h.icon}</div>
      <p className="text-xs font-semibold text-primary leading-tight mb-2 pr-8">{h.titre || h.nom}</p>
      <div className="flex items-center justify-between gap-1">
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full truncate"
          style={{ background: color + '22', color }}
        >
          {h.frequence}
        </span>
        {streak > 0 && (
          <span className="text-[10px] font-bold flex-shrink-0" style={{ color: getStreakColor(streak) }}>
            🔥 {streak}
          </span>
        )}
      </div>
    </div>
  )
}
