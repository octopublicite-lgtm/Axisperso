import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { todayKey } from '../../utils/dates'
import { FLUX_REVENU_CATEGORIES, FLUX_DEPENSE_CATEGORIES } from '../../utils/constants'
import { Plus, Trash2, ChevronLeft, ChevronRight, Check, X } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

const fmt = (n) => Number(n || 0).toLocaleString('fr-MA') + ' MAD'
const fmtPct = (n) => (isNaN(n) || !isFinite(n) ? '0' : Math.round(n)) + '%'

const EMPTY_REVENU  = { source: '', categorie: FLUX_REVENU_CATEGORIES[0],  montant: '', frequence: 'Mensuel', date: todayKey() }
const EMPTY_DEPENSE = { libelle: '', categorie: FLUX_DEPENSE_CATEGORIES[0], montant: '', frequence: 'Mensuel', date: todayKey() }
const EMPTY_CREANCE = { description: '', personne: '', montant: '', type: 'À recevoir', date_echeance: '', statut: 'En attente' }

function getMonthKey(offset) {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key) {
  const [y, m] = key.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

const FREQ_BADGE = {
  Mensuel: { bg: '#FFF7ED', color: '#F97316' },
  Hebdo:   { bg: '#EFF6FF', color: '#3B82F6' },
  Annuel:  { bg: '#F5F3FF', color: '#7C3AED' },
  Unique:  { bg: '#F3F4F6', color: '#6B7280' },
}

function FrequenceBadge({ freq }) {
  const cfg = FREQ_BADGE[freq]
  if (!cfg) return null
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap', flexShrink: 0 }}>
      {freq}
    </span>
  )
}

function EntryRow({ item, label, onDelete, onToggleStatut }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)' }}>{label}</p>
        <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{item.categorie} · {item.date || item.date_echeance}</p>
      </div>
      {item.statut && (
        <button
          onClick={() => onToggleStatut && onToggleStatut(item.id)}
          style={{
            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, cursor: 'pointer', border: 'none',
            background: item.statut === 'Réglé' ? 'color-mix(in srgb, #10B981 12%, white)' : 'color-mix(in srgb, #F5A623 12%, white)',
            color: item.statut === 'Réglé' ? '#10B981' : '#F5A623',
          }}
        >
          {item.statut}
        </button>
      )}
      {item.frequence && <FrequenceBadge freq={item.frequence} />}
      <span style={{ fontSize: 14, fontWeight: 700, color: item.type === 'À payer' ? '#EF4444' : 'var(--text-1)', minWidth: 100, textAlign: 'right' }}>
        {fmt(item.montant)}
      </span>
      <button onClick={() => onDelete(item.id)} className="btn-icon"><Trash2 size={13} /></button>
    </div>
  )
}

function AddForm({ fields, onSave, onCancel }) {
  const [form, setForm] = useState(fields.initial)
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '10px 14px', background: 'color-mix(in srgb, var(--orange) 3%, white)', borderBottom: '1px solid var(--border)' }}>
      {fields.inputs.map(({ key, placeholder, type, options, style }) => (
        options ? (
          <select key={key} value={form[key]} onChange={(e) => set(key, e.target.value)} className="input" style={style}>
            {options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
          </select>
        ) : type === 'checkbox' ? (
          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-2)', cursor: 'pointer' }}>
            <input type="checkbox" checked={form[key]} onChange={(e) => set(key, e.target.checked)} />
            {placeholder}
          </label>
        ) : (
          <input key={key} type={type || 'text'} value={form[key]} onChange={(e) => set(key, type === 'checkbox' ? e.target.checked : e.target.value)} placeholder={placeholder} className="input" style={style} onKeyDown={(e) => e.key === 'Enter' && onSave(form)} />
        )
      ))}
      <button onClick={() => onSave(form)} className="btn btn-primary btn-sm"><Check size={14} /></button>
      <button onClick={onCancel} className="btn-icon"><X size={14} /></button>
    </div>
  )
}

export default function Flux() {
  const { user } = useAuth()
  const [monthOffset, setMonthOffset] = useState(0)
  const monthKey = getMonthKey(monthOffset)

  const [revenus, setRevenus] = useState([])
  const [depenses, setDepenses] = useState([])
  const [creances, setCreances] = useLocalStorage(`axislife_creances_${monthKey}`, [])

  const [showRevenuForm, setShowRevenuForm] = useState(false)
  const [showDepenseForm, setShowDepenseForm] = useState(false)
  const [showCreanceForm, setShowCreanceForm] = useState(false)

  // Load revenus and depenses from Supabase for this month
  useEffect(() => {
    if (!user || !supabase) return
    const load = async () => {
      const { data: rev, error: revErr } = await supabase
        .from('flux_revenus')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', monthKey + '-01')
        .lte('date', monthKey + '-31')
      if (revErr) console.error('[Flux] revenus error:', revErr.message)
      else setRevenus(rev ?? [])

      const { data: dep, error: depErr } = await supabase
        .from('flux_depenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', monthKey + '-01')
        .lte('date', monthKey + '-31')
      if (depErr) console.error('[Flux] depenses error:', depErr.message)
      else setDepenses(dep ?? [])
    }
    load()
  }, [user, monthKey])

  async function addRevenu(f) {
    if (!supabase || !user?.id) return
    const { data, error } = await supabase
      .from('flux_revenus')
      .insert({ user_id: user.id, source: f.source, categorie: f.categorie, montant: Number(f.montant), frequence: f.frequence, date: f.date })
      .select('*')
      .single()
    if (error) { console.error('[addRevenu] error:', error.message); return }
    setRevenus((prev) => [...prev, data])
  }

  async function deleteRevenu(id) {
    if (!supabase || !user?.id) return
    const { error } = await supabase.from('flux_revenus').delete().eq('id', id)
    if (error) { console.error('[deleteRevenu] error:', error.message); return }
    setRevenus((prev) => prev.filter((r) => r.id !== id))
  }

  async function addDepense(f) {
    if (!supabase || !user?.id) return
    const { data, error } = await supabase
      .from('flux_depenses')
      .insert({ user_id: user.id, libelle: f.libelle, categorie: f.categorie, montant: Number(f.montant), frequence: f.frequence, date: f.date })
      .select('*')
      .single()
    if (error) { console.error('[addDepense] error:', error.message); return }
    setDepenses((prev) => [...prev, data])
  }

  async function deleteDepense(id) {
    if (!supabase || !user?.id) return
    const { error } = await supabase.from('flux_depenses').delete().eq('id', id)
    if (error) { console.error('[deleteDepense] error:', error.message); return }
    setDepenses((prev) => prev.filter((d) => d.id !== id))
  }

  function addCreance(f) {
    setCreances((prev) => [...(prev ?? []), { ...f, id: uuidv4(), statut: 'En attente' }])
  }

  function deleteCreance(id) {
    setCreances((prev) => (prev ?? []).filter((c) => c.id !== id))
  }

  function toggleCreanceStatut(id) {
    setCreances((prev) => (prev ?? []).map((c) => c.id === id ? { ...c, statut: c.statut === 'Réglé' ? 'En attente' : 'Réglé' } : c))
  }

  const totalRevenus  = revenus.reduce((s, r) => s + Number(r.montant), 0)
  const totalDepenses = depenses.reduce((s, d) => s + Number(d.montant), 0)
  const solde         = totalRevenus - totalDepenses
  const tauxEpargne   = totalRevenus > 0 ? (solde / totalRevenus) * 100 : 0
  const safeCreances  = creances ?? []

  const revenuFields = {
    initial: EMPTY_REVENU,
    inputs: [
      { key: 'source',    placeholder: 'Source…',    style: { flex: 1, minWidth: 120 } },
      { key: 'categorie', options: FLUX_REVENU_CATEGORIES, style: { flex: 1, minWidth: 160 } },
      { key: 'montant',   placeholder: 'Montant MAD', type: 'number', style: { width: 120 } },
      { key: 'frequence', options: [{ label: 'Mensuel', value: 'Mensuel' }, { label: 'Hebdomadaire', value: 'Hebdo' }, { label: 'Annuel', value: 'Annuel' }, { label: 'Unique', value: 'Unique' }], style: { width: 140 } },
      { key: 'date',      type: 'date', style: { width: 140 } },
    ],
  }

  const depenseFields = {
    initial: EMPTY_DEPENSE,
    inputs: [
      { key: 'libelle',   placeholder: 'Libellé…',    style: { flex: 1, minWidth: 120 } },
      { key: 'categorie', options: FLUX_DEPENSE_CATEGORIES, style: { flex: 1, minWidth: 160 } },
      { key: 'montant',   placeholder: 'Montant MAD', type: 'number', style: { width: 120 } },
      { key: 'frequence', options: [{ label: 'Mensuel', value: 'Mensuel' }, { label: 'Hebdomadaire', value: 'Hebdo' }, { label: 'Annuel', value: 'Annuel' }, { label: 'Unique', value: 'Unique' }], style: { width: 140 } },
      { key: 'date',      type: 'date', style: { width: 140 } },
    ],
  }

  const creanceFields = {
    initial: EMPTY_CREANCE,
    inputs: [
      { key: 'description',   placeholder: 'Description…', style: { flex: 1, minWidth: 120 } },
      { key: 'personne',      placeholder: 'Personne…',    style: { width: 110 } },
      { key: 'montant',       placeholder: 'Montant MAD',  type: 'number', style: { width: 110 } },
      { key: 'type',          options: ['À recevoir', 'À payer'], style: { width: 120 } },
      { key: 'date_echeance', type: 'date', style: { width: 140 } },
    ],
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
        <button onClick={() => setMonthOffset((v) => v - 1)} className="btn btn-ghost btn-sm" style={{ padding: '6px 8px' }}><ChevronLeft size={16} /></button>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', textTransform: 'capitalize', minWidth: 140, textAlign: 'center' }}>{monthLabel(monthKey)}</span>
        <button onClick={() => setMonthOffset((v) => v + 1)} disabled={monthOffset >= 0} className="btn btn-ghost btn-sm" style={{ padding: '6px 8px' }}><ChevronRight size={16} /></button>
      </div>

      {/* Summary bar */}
      <div className="flux-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Revenus du mois', value: fmt(totalRevenus),   color: '#00C896' },
          { label: 'Dépenses du mois', value: fmt(totalDepenses),  color: '#EF4444' },
          { label: 'Solde net',        value: fmt(solde),          color: solde >= 0 ? '#F5A623' : '#EF4444' },
          { label: "Taux d'épargne",   value: fmtPct(tauxEpargne), color: tauxEpargne >= 20 ? '#10B981' : '#F5A623' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: '14px 16px' }}>
            <p className="section-label" style={{ marginBottom: 4 }}>{label}</p>
            <p style={{ fontSize: 20, fontWeight: 800, color, letterSpacing: '-0.02em' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Revenus */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>Revenus</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowRevenuForm((v) => !v)}><Plus size={14} /> Ajouter un revenu</button>
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {showRevenuForm && (
            <AddForm
              fields={revenuFields}
              onSave={(f) => { addRevenu(f); setShowRevenuForm(false) }}
              onCancel={() => setShowRevenuForm(false)}
            />
          )}
          {revenus.length === 0 && !showRevenuForm && (
            <p style={{ fontSize: 13, color: 'var(--text-3)', padding: 20 }}>Aucun revenu ce mois.</p>
          )}
          {revenus.map((r) => (
            <EntryRow key={r.id} item={r} label={r.source} onDelete={deleteRevenu} />
          ))}
          {revenus.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 14px', background: 'color-mix(in srgb, #00C896 5%, white)' }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#00C896' }}>Total : {fmt(totalRevenus)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Dépenses */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>Dépenses</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowDepenseForm((v) => !v)}><Plus size={14} /> Ajouter une dépense</button>
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {showDepenseForm && (
            <AddForm
              fields={depenseFields}
              onSave={(f) => { addDepense(f); setShowDepenseForm(false) }}
              onCancel={() => setShowDepenseForm(false)}
            />
          )}
          {depenses.length === 0 && !showDepenseForm && (
            <p style={{ fontSize: 13, color: 'var(--text-3)', padding: 20 }}>Aucune dépense ce mois.</p>
          )}
          {depenses.map((d) => (
            <EntryRow key={d.id} item={d} label={d.libelle} onDelete={deleteDepense} />
          ))}
          {depenses.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 14px', background: 'color-mix(in srgb, #EF4444 5%, white)' }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#EF4444' }}>Total : {fmt(totalDepenses)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Créances */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>Créances</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowCreanceForm((v) => !v)}><Plus size={14} /> Ajouter une créance</button>
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {showCreanceForm && (
            <AddForm
              fields={creanceFields}
              onSave={(f) => { addCreance(f); setShowCreanceForm(false) }}
              onCancel={() => setShowCreanceForm(false)}
            />
          )}
          {safeCreances.length === 0 && !showCreanceForm && (
            <p style={{ fontSize: 13, color: 'var(--text-3)', padding: 20 }}>Aucune créance.</p>
          )}
          {safeCreances.map((c) => (
            <EntryRow key={c.id} item={c} label={`${c.description} (${c.personne})`} onDelete={deleteCreance} onToggleStatut={toggleCreanceStatut} />
          ))}
        </div>
      </div>
    </div>
  )
}
