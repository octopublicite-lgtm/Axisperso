import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { DOMAINS } from '../../utils/constants'
import { getDomainColor } from '../../utils/colors'
import { Plus, Trash2, Pencil } from 'lucide-react'

const JOURS_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const EMPTY = { nom: '', jours: [], debut: '09:00', fin: '10:00', domaine: '' }

export default function TimeBlocksRecurrents() {
  const { timeblocks, addTimeblock, updateTimeblock, deleteTimeblock, addToast } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })) }

  function toggleJour(i) {
    set('jours', form.jours.includes(i) ? form.jours.filter((j) => j !== i) : [...form.jours, i])
  }

  function handleSave() {
    if (!form.nom.trim()) return
    if (editId) {
      updateTimeblock(editId, form)
      addToast('Time block mis à jour')
    } else {
      addTimeblock(form)
      addToast('Time block créé')
    }
    setForm(EMPTY)
    setEditId(null)
    setShowForm(false)
  }

  function handleEdit(tb) {
    setForm({ nom: tb.nom, jours: tb.jours ?? [], debut: tb.debut, fin: tb.fin, domaine: tb.domaine ?? '' })
    setEditId(tb.id)
    setShowForm(true)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 13, color: 'var(--text-2)' }}>Créneaux récurrents affichés dans la vue semaine.</p>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(true) }}>
          <Plus size={14} /> Nouveau
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ borderColor: 'var(--orange)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input value={form.nom} onChange={(e) => set('nom', e.target.value)} placeholder="Nom du créneau *" className="input" />
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, marginBottom: 8 }}>Jours</p>
              <div style={{ display: 'flex', gap: 6 }}>
                {JOURS_LABELS.map((l, i) => (
                  <button
                    key={i}
                    onClick={() => toggleJour(i)}
                    style={{
                      width: 36, height: 36, borderRadius: '50%', fontSize: 11, fontWeight: 700,
                      background: form.jours.includes(i) ? 'var(--orange)' : 'var(--bg)',
                      color: form.jours.includes(i) ? 'white' : 'var(--text-3)',
                      border: form.jours.includes(i) ? '1.5px solid var(--orange)' : '1.5px solid var(--border)',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>Début</label>
                <input type="time" value={form.debut} onChange={(e) => set('debut', e.target.value)} className="input" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>Fin</label>
                <input type="time" value={form.fin} onChange={(e) => set('fin', e.target.value)} className="input" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>Domaine</label>
                <select value={form.domaine} onChange={(e) => set('domaine', e.target.value)} className="input">
                  <option value="">Aucun</option>
                  {DOMAINS.map((d) => <option key={d.id} value={d.id}>{d.icon} {d.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Annuler</button>
              <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={handleSave}>{editId ? 'Mettre à jour' : 'Créer'}</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {timeblocks.length === 0 && !showForm && (
          <p style={{ fontSize: 13, color: 'var(--text-3)', gridColumn: '1 / -1' }}>Aucun time block récurrent.</p>
        )}
        {timeblocks.map((tb) => {
          const color = tb.domaine ? getDomainColor(tb.domaine) : '#AAAAAA'
          return (
            <div key={tb.id} className="timeblock-card" style={{ '--c': color }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{tb.nom}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
                    {tb.debut} – {tb.fin} · {(tb.jours ?? []).map((j) => JOURS_LABELS[j]).join(', ')}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => handleEdit(tb)} aria-label="Modifier" className="btn-icon"><Pencil size={13} /></button>
                  <button onClick={() => deleteTimeblock(tb.id)} aria-label="Supprimer" className="btn-icon"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
