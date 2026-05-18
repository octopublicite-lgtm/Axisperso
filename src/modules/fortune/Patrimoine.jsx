import { useState, useMemo, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { push, pull } from '../../lib/cloudSync'
import { todayKey } from '../../utils/dates'
import { FORTUNE_ACTIF_CATEGORIES, FORTUNE_PASSIF_CATEGORIES, SEED_FORTUNE_ACTIFS, SEED_FORTUNE_PASSIFS } from '../../utils/constants'
import { Trash2, Pencil, ChevronDown, ChevronRight, Plus, Check, X } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

const fmt = (n) => Number(n).toLocaleString('fr-MA') + ' MAD'

function ItemRow({ item, color, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(item.valeur)
  const [editHover, setEditHover] = useState(false)
  const [delHover, setDelHover] = useState(false)

  function commit() {
    const n = Number(val)
    if (!isNaN(n) && n >= 0) onEdit(item.id, { valeur: n })
    setEditing(false)
  }

  const iconBtn = (hovered) => ({
    width: 28, height: 28, borderRadius: 6, border: 'none', flexShrink: 0,
    background: hovered ? '#F7F7F9' : 'transparent',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.12s',
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)' }}>{item.nom}</span>
        <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 8 }}>{item.date_maj}</span>
      </div>
      {editing ? (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            type="number" value={val} onChange={(e) => setVal(e.target.value)}
            className="input" style={{ width: 120, textAlign: 'right', padding: '4px 8px' }}
            autoFocus onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
          />
          <button onClick={commit} className="btn-icon" style={{ color: '#10B981' }}><Check size={14} /></button>
          <button onClick={() => setEditing(false)} className="btn-icon"><X size={14} /></button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color, minWidth: 110, textAlign: 'right' }}>
            {fmt(item.valeur)}
          </span>
          <button
            onClick={() => setEditing(true)}
            onMouseEnter={() => setEditHover(true)}
            onMouseLeave={() => setEditHover(false)}
            style={iconBtn(editHover)}
            title="Modifier"
          >
            <Pencil size={14} style={{ color: '#AAAAAA' }} />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            onMouseEnter={() => setDelHover(true)}
            onMouseLeave={() => setDelHover(false)}
            style={iconBtn(delHover)}
            title="Supprimer"
          >
            <Trash2 size={14} style={{ color: delHover ? '#EF4444' : '#AAAAAA', transition: 'color 0.12s' }} />
          </button>
        </div>
      )}
    </div>
  )
}

function CategoryGroup({ cat, items, color, onDelete, onEdit, onAdd }) {
  const [open, setOpen] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState({ nom: '', valeur: '' })
  const subtotal = items.reduce((s, i) => s + i.valeur, 0)

  function handleAdd() {
    if (!form.nom.trim() || !form.valeur) return
    onAdd({ nom: form.nom, categorie: cat, valeur: Number(form.valeur), date_maj: todayKey() })
    setForm({ nom: '', valeur: '' })
    setShowAddForm(false)
  }

  return (
    <div style={{ borderBottom: '1.5px solid var(--border)' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', cursor: 'pointer', background: 'var(--bg)' }}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <ChevronDown size={14} style={{ color: 'var(--text-3)' }} /> : <ChevronRight size={14} style={{ color: 'var(--text-3)' }} />}
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>{cat}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{fmt(subtotal)}</span>
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(true); setShowAddForm(true) }}
          className="btn-icon" style={{ marginLeft: 6 }}
        >
          <Plus size={13} />
        </button>
      </div>
      {open && (
        <>
          {items.map((item) => (
            <ItemRow key={item.id} item={item} color={color} onDelete={onDelete} onEdit={onEdit} />
          ))}
          {showAddForm && (
            <div style={{ display: 'flex', gap: 8, padding: '8px 16px', background: 'color-mix(in srgb, var(--orange) 4%, white)' }}>
              <input value={form.nom} onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))} placeholder="Nom…" className="input" style={{ flex: 1 }} />
              <input type="number" value={form.valeur} onChange={(e) => setForm((p) => ({ ...p, valeur: e.target.value }))} placeholder="Montant MAD" className="input" style={{ width: 130 }} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
              <button onClick={handleAdd} className="btn btn-primary btn-sm"><Check size={14} /></button>
              <button onClick={() => setShowAddForm(false)} className="btn-icon"><X size={14} /></button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Section({ title, data, setData, categories, color, emptyText }) {
  const [showTopForm, setShowTopForm] = useState(false)
  const [topForm, setTopForm] = useState({ nom: '', categorie: categories[0], valeur: '' })

  const grouped = useMemo(() => {
    const map = {}
    categories.forEach((c) => { map[c] = [] })
    data.forEach((item) => {
      if (!map[item.categorie]) map[item.categorie] = []
      map[item.categorie].push(item)
    })
    return map
  }, [data, categories])

  const activeCategories = categories.filter((c) => grouped[c]?.length > 0)

  function addItem(item) {
    setData((prev) => [...prev, { ...item, id: uuidv4() }])
  }

  function deleteItem(id) {
    setData((prev) => prev.filter((i) => i.id !== id))
  }

  function editItem(id, patch) {
    setData((prev) => prev.map((i) => i.id === id ? { ...i, ...patch } : i))
  }

  function handleTopAdd() {
    if (!topForm.nom.trim() || !topForm.valeur) return
    addItem({ nom: topForm.nom, categorie: topForm.categorie, valeur: Number(topForm.valeur), date_maj: todayKey() })
    setTopForm({ nom: '', categorie: categories[0], valeur: '' })
    setShowTopForm(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>{title}</h3>
        <button className="btn btn-ghost btn-sm" onClick={() => setShowTopForm((v) => !v)}>
          <Plus size={14} /> Ajouter
        </button>
      </div>

      {showTopForm && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <input value={topForm.nom} onChange={(e) => setTopForm((p) => ({ ...p, nom: e.target.value }))} placeholder="Nom…" className="input" style={{ flex: 1, minWidth: 150 }} />
          <select value={topForm.categorie} onChange={(e) => setTopForm((p) => ({ ...p, categorie: e.target.value }))} className="input" style={{ flex: 1, minWidth: 180 }}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="number" value={topForm.valeur} onChange={(e) => setTopForm((p) => ({ ...p, valeur: e.target.value }))} placeholder="Montant MAD" className="input" style={{ width: 130 }} onKeyDown={(e) => e.key === 'Enter' && handleTopAdd()} />
          <button onClick={handleTopAdd} className="btn btn-primary btn-sm"><Check size={14} /></button>
          <button onClick={() => setShowTopForm(false)} className="btn-icon"><X size={14} /></button>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {data.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-3)', padding: 20 }}>{emptyText}</p>
        ) : (
          activeCategories.map((cat) => (
            <CategoryGroup
              key={cat}
              cat={cat}
              items={grouped[cat]}
              color={color}
              onDelete={deleteItem}
              onEdit={editItem}
              onAdd={addItem}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default function Patrimoine() {
  const { session } = useAuth()
  const userId = session?.user?.id
  const [actifs, setActifs] = useState(null)
  const [passifs, setPassifs] = useState(null)
  const actifsMounted = useRef(false)
  const passifsMounted = useRef(false)

  function legacyLS(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') } catch { return null }
  }

  // Load from Supabase on login; fall back to localStorage, then seed
  useEffect(() => {
    if (!userId) return
    pull(userId, 'fortune_actifs').then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setActifs(data)
      } else {
        const legacy = legacyLS('axislife_fortune_actifs')
        if (Array.isArray(legacy) && legacy.length > 0) {
          setActifs(legacy)
          push(userId, 'fortune_actifs', legacy)
        } else {
          const seeded = SEED_FORTUNE_ACTIFS.map((a) => ({ ...a, id: uuidv4(), date_maj: todayKey() }))
          setActifs(seeded)
          push(userId, 'fortune_actifs', seeded)
        }
      }
    }).catch(() => {
      const legacy = legacyLS('axislife_fortune_actifs')
      setActifs(Array.isArray(legacy) && legacy.length > 0
        ? legacy
        : SEED_FORTUNE_ACTIFS.map((a) => ({ ...a, id: uuidv4(), date_maj: todayKey() })))
    })

    pull(userId, 'fortune_passifs').then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setPassifs(data)
      } else {
        const legacy = legacyLS('axislife_fortune_passifs')
        if (Array.isArray(legacy) && legacy.length > 0) {
          setPassifs(legacy)
          push(userId, 'fortune_passifs', legacy)
        } else {
          const seeded = SEED_FORTUNE_PASSIFS.map((p) => ({ ...p, id: uuidv4(), date_maj: todayKey() }))
          setPassifs(seeded)
          push(userId, 'fortune_passifs', seeded)
        }
      }
    }).catch(() => {
      const legacy = legacyLS('axislife_fortune_passifs')
      setPassifs(Array.isArray(legacy) && legacy.length > 0
        ? legacy
        : SEED_FORTUNE_PASSIFS.map((p) => ({ ...p, id: uuidv4(), date_maj: todayKey() })))
    })
  }, [userId]) // eslint-disable-line

  // Push actifs to Supabase on change
  useEffect(() => {
    if (!actifsMounted.current) { actifsMounted.current = true; return }
    push(userId, 'fortune_actifs', actifs)
  }, [actifs]) // eslint-disable-line

  // Push passifs to Supabase on change
  useEffect(() => {
    if (!passifsMounted.current) { passifsMounted.current = true; return }
    push(userId, 'fortune_passifs', passifs)
  }, [passifs]) // eslint-disable-line

  const safeActifs = actifs ?? []
  const safePassifs = passifs ?? []

  const totalActifs = safeActifs.reduce((s, a) => s + a.valeur, 0)
  const totalPassifs = safePassifs.reduce((s, p) => s + p.valeur, 0)
  const fortuneNette = totalActifs - totalPassifs

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Summary */}
      <div className="fortune-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div className="card" style={{ borderTop: '3px solid #00C896' }}>
          <p className="section-label" style={{ marginBottom: 6 }}>Total Actifs</p>
          <p style={{ fontSize: 24, fontWeight: 800, color: '#00C896', letterSpacing: '-0.02em' }}>{fmt(totalActifs)}</p>
        </div>
        <div className="card" style={{ borderTop: '3px solid #EF4444' }}>
          <p className="section-label" style={{ marginBottom: 6 }}>Total Passifs</p>
          <p style={{ fontSize: 24, fontWeight: 800, color: '#EF4444', letterSpacing: '-0.02em' }}>{fmt(totalPassifs)}</p>
        </div>
        <div className="card" style={{ borderTop: '3px solid #F5A623' }}>
          <p className="section-label" style={{ marginBottom: 6 }}>Fortune Nette</p>
          <p style={{ fontSize: 36, fontWeight: 800, color: '#F5A623', letterSpacing: '-0.03em', lineHeight: 1.1 }}>{fmt(fortuneNette)}</p>
        </div>
      </div>

      <Section
        title="Actifs"
        data={safeActifs}
        setData={setActifs}
        categories={FORTUNE_ACTIF_CATEGORIES}
        color="#00C896"
        emptyText="Aucun actif enregistré. Ajoutez votre premier actif."
      />
      <Section
        title="Passifs"
        data={safePassifs}
        setData={setPassifs}
        categories={FORTUNE_PASSIF_CATEGORIES}
        color="#EF4444"
        emptyText="Aucun passif enregistré."
      />
    </div>
  )
}
