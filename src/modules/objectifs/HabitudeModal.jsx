import { useState, useEffect } from 'react'
import Modal from '../../components/ui/Modal'
import Input, { Textarea, Select } from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useApp } from '../../context/AppContext'
import { FREQUENCE_LABEL } from '../../utils/constants'

const ICON_CATEGORIES = [
  { label: 'Sport & Santé',        icons: ['🏃', '🚴', '🏋️', '🤸', '🧘', '🏊', '⚽', '🥗', '💧', '🍎', '😴', '🚶'] },
  { label: 'Spiritualité & Mindset', icons: ['🙏', '📖', '🤲', '☪️', '✨', '🧠', '🫀', '🌙', '⭐', '🕌', '📿', '💭'] },
  { label: 'Business & Travail',   icons: ['💼', '📊', '💻', '📝', '📞', '🎯', '🔥', '⚡', '🏆', '💡', '📈', '🤝'] },
  { label: 'Apprentissage',        icons: ['📚', '🎓', '✏️', '🔬', '🌍', '🗣️', '🎨', '🎵', '🧩', '📰', '🖊️', '🔭'] },
  { label: 'Lifestyle',            icons: ['⏰', '🌅', '🧹', '🛏️', '👗', '🌿', '🪴', '🍳', '☕', '🎮', '📱', '🚫'] },
  { label: 'Finance',              icons: ['💰', '💳', '🏦', '📉', '🪙', '💎', '🏠', '🚗', '💵', '📋', '🤑', '💹'] },
]
const FREQ_OPTIONS = ['quotidien', 'hebdomadaire', '3x_semaine', '5x_semaine']

const EMPTY = { titre: '', description: '', frequence: 'quotidien', icon: '📖', actif: true }

export default function HabitudeModal({ isOpen, onClose, editTarget, domaine }) {
  const { addHabitude, updateHabitude, addToast } = useApp()
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    if (editTarget) {
      setForm({
        titre: editTarget.titre || editTarget.nom || '',
        description: editTarget.description || '',
        frequence: editTarget.frequence || 'quotidien',
        icon: editTarget.icon || '📖',
        actif: editTarget.actif !== false,
      })
    } else {
      setForm({ ...EMPTY })
    }
  }, [editTarget, isOpen])

  function set(field, value) { setForm((prev) => ({ ...prev, [field]: value })) }

  function handleSubmit() {
    if (!form.titre.trim()) return
    if (editTarget) {
      updateHabitude(editTarget.id, { ...form, domaine })
      addToast('Habitude mise à jour')
    } else {
      addHabitude({ ...form, domaine, createdAt: new Date().toISOString() })
      addToast('Habitude créée !')
    }
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editTarget ? "Modifier l'habitude" : 'Nouvelle habitude'} size="md">
      <div className="flex flex-col gap-4">
        <Input
          label="Titre *"
          value={form.titre}
          onChange={(e) => set('titre', e.target.value)}
          placeholder="Mon habitude..."
        />
        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={2}
          placeholder="Détails, contexte..."
        />
        <Select label="Fréquence" value={form.frequence} onChange={(e) => set('frequence', e.target.value)}>
          {FREQ_OPTIONS.map((f) => <option key={f} value={f}>{FREQUENCE_LABEL[f] ?? f}</option>)}
        </Select>

        <div>
          <label className="text-xs font-semibold text-secondary tracking-wide uppercase block mb-2">Icône</label>
          <div style={{ maxHeight: 260, overflowY: 'auto', paddingRight: 4 }}>
            {ICON_CATEGORIES.map((cat) => (
              <div key={cat.label} style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                  {cat.label}
                </p>
                <div className="grid grid-cols-6 gap-2">
                  {cat.icons.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => set('icon', ic)}
                      className={`text-2xl p-2 rounded-lg border-2 transition-all ${form.icon === ic ? 'border-accent bg-[#FFF0EB]' : 'border-border hover:border-accent'}`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2 border-t border-border">
          <Button variant="secondary" onClick={onClose} className="flex-1">Annuler</Button>
          <Button onClick={handleSubmit} disabled={!form.titre.trim()} className="flex-1">
            {editTarget ? 'Mettre à jour' : "Créer l'habitude"}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
