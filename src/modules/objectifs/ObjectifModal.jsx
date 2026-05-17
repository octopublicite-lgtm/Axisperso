import { useState, useEffect } from 'react'
import Modal from '../../components/ui/Modal'
import Input, { Textarea, Select } from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useApp } from '../../context/AppContext'
import { DOMAINS, HORIZONS, STATUTS } from '../../utils/constants'
import { Plus, X } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

const EMPTY = {
  domaine: 'business',
  titre: '',
  description: '',
  horizon: '6 mois',
  status: 'En cours',
  progress: 0,
  kpi: '',
  milestones: [],
}

export default function ObjectifModal({ isOpen, onClose, editTarget, defaultDomain }) {
  const { addObjectif, updateObjectif, addToast, settings } = useApp()
  const visibleDomains = settings.domainesActifs
    ? DOMAINS.filter((d) => settings.domainesActifs.includes(d.id))
    : DOMAINS
  const [form, setForm] = useState(EMPTY)
  const [milestoneInput, setMilestoneInput] = useState('')

  useEffect(() => {
    if (editTarget) {
      setForm(editTarget)
    } else {
      setForm({ ...EMPTY, domaine: defaultDomain ?? 'business' })
    }
    setMilestoneInput('')
  }, [editTarget, defaultDomain, isOpen])

  function set(field, value) { setForm((prev) => ({ ...prev, [field]: value })) }

  function addMilestone() {
    if (!milestoneInput.trim()) return
    set('milestones', [...(form.milestones ?? []), { id: uuidv4(), texte: milestoneInput.trim(), done: false }])
    setMilestoneInput('')
  }

  function removeMilestone(id) {
    set('milestones', form.milestones.filter((m) => m.id !== id))
  }

  function handleSubmit() {
    if (!form.titre.trim()) return
    if (editTarget) {
      updateObjectif(editTarget.id, form)
      addToast('Objectif mis à jour')
    } else {
      addObjectif(form)
      addToast('Objectif créé !')
    }
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editTarget ? 'Modifier l\'objectif' : 'Nouvel objectif'} size="lg">
      <div className="flex flex-col gap-4">
        <Select label="Domaine" value={form.domaine} onChange={(e) => set('domaine', e.target.value)}>
          {visibleDomains.map((d) => <option key={d.id} value={d.id}>{d.icon} {d.label}</option>)}
        </Select>

        <Input label="Titre *" value={form.titre} onChange={(e) => set('titre', e.target.value)} placeholder="Mon objectif..." />

        <Textarea label="Description" value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} placeholder="Contexte, motivation..." />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          <Select label="Horizon" value={form.horizon} onChange={(e) => set('horizon', e.target.value)}>
            {HORIZONS.map((h) => <option key={h} value={h}>{h}</option>)}
          </Select>
          <Select label="Statut" value={form.status} onChange={(e) => set('status', e.target.value)}>
            {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>

        <Input label="KPI (résultat mesurable)" value={form.kpi} onChange={(e) => set('kpi', e.target.value)} placeholder="ex: 5 000 followers" />

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-secondary tracking-wide uppercase">Progression : {form.progress}%</label>
          <input
            type="range" min={0} max={100}
            value={form.progress}
            onChange={(e) => set('progress', Number(e.target.value))}
            className="w-full accent-accent"
          />
        </div>

        {/* Milestones */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-secondary tracking-wide uppercase">Jalons</label>
          {(form.milestones ?? []).map((m) => (
            <div key={m.id} className="flex items-center gap-2 bg-bg px-3 py-2 rounded-lg">
              <span className="flex-1 text-sm text-primary">{m.texte}</span>
              <button onClick={() => removeMilestone(m.id)} aria-label="Supprimer" className="text-muted hover:text-red-500">
                <X size={14} />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              value={milestoneInput}
              onChange={(e) => setMilestoneInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addMilestone()}
              placeholder="Ajouter un jalon..."
              className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button onClick={addMilestone} aria-label="Ajouter jalon" className="p-2 rounded-lg bg-bg border border-border hover:border-accent text-secondary hover:text-accent transition-all">
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-2 border-t border-border">
          <Button variant="secondary" onClick={onClose} className="flex-1">Annuler</Button>
          <Button onClick={handleSubmit} disabled={!form.titre.trim()} className="flex-1">
            {editTarget ? 'Mettre à jour' : 'Créer l\'objectif'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
