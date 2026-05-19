import { useState, useEffect, useMemo } from 'react'
import Badge from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { supabase } from '../../lib/supabase'
import { todayKey } from '../../utils/dates'
import { getDomainColor, getDomainLight } from '../../utils/colors'
import { DOMAINS } from '../../utils/constants'
import { Plus, Trash2, Search, X } from 'lucide-react'

const EMPTY = { titre: '', contenu: '', domaine: '', tags: [] }

export default function Lecons() {
  const { user } = useAuth()
  const { addToast } = useApp()
  const [lecons, setLecons] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [tagInput, setTagInput] = useState('')
  const [search, setSearch] = useState('')
  const [filterDomain, setFilterDomain] = useState('')
  const [filterTag, setFilterTag] = useState('')

  useEffect(() => {
    if (!user || !supabase) return
    ;(async () => {
      const { data, error } = await supabase
        .from('lecons').select('*').eq('user_id', user.id).order('date', { ascending: false })
      if (error) { addToast('Erreur de chargement leçons', 'error'); return }
      setLecons((data ?? []).map((l) => ({ ...l, tags: l.tags ?? [] })))
    })()
  }, [user]) // eslint-disable-line

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })) }

  function addTag() {
    if (!tagInput.trim() || form.tags.includes(tagInput.trim())) return
    set('tags', [...form.tags, tagInput.trim()])
    setTagInput('')
  }

  function removeTag(tag) { set('tags', form.tags.filter((t) => t !== tag)) }

  async function save() {
    if (!form.titre.trim() || !supabase || !user?.id) return
    const { data, error } = await supabase.from('lecons')
      .insert({ user_id: user.id, titre: form.titre, contenu: form.contenu, domaine: form.domaine, tags: form.tags, date: todayKey() })
      .select('*').single()
    if (error) { addToast('Erreur de sauvegarde — réessayez', 'error'); return }
    setLecons((prev) => [{ ...data, tags: data.tags ?? [] }, ...prev])
    setForm(EMPTY)
    setTagInput('')
    setShowForm(false)
  }

  async function deleteLecon(id) {
    if (!supabase || !user?.id) return
    const { error } = await supabase.from('lecons').delete().eq('id', id)
    if (error) { addToast('Erreur de sauvegarde — réessayez', 'error'); return }
    setLecons((prev) => prev.filter((l) => l.id !== id))
  }

  const allTags = useMemo(() => [...new Set(lecons.flatMap((l) => l.tags ?? []))], [lecons])

  const filtered = useMemo(() => lecons.filter((l) => {
    if (filterDomain && l.domaine !== filterDomain) return false
    if (filterTag && !(l.tags ?? []).includes(filterTag)) return false
    if (search) {
      const q = search.toLowerCase()
      return l.titre.toLowerCase().includes(q) || l.contenu.toLowerCase().includes(q)
    }
    return true
  }), [lecons, filterDomain, filterTag, search])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher…" className="input" style={{ paddingLeft: 36 }} />
        </div>
        <select value={filterDomain} onChange={(e) => setFilterDomain(e.target.value)} className="input" style={{ width: 'auto' }}>
          <option value="">Tous domaines</option>
          {DOMAINS.map((d) => <option key={d.id} value={d.id}>{d.icon} {d.label}</option>)}
        </select>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}>
          <Plus size={14} /> Nouvelle
        </button>
      </div>

      {allTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
              className="pill"
              style={filterTag === tag ? { background: 'var(--text-1)', color: 'white', borderColor: 'var(--text-1)' } : {}}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {showForm && (
        <div className="card" style={{ borderColor: 'var(--orange)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input value={form.titre} onChange={(e) => set('titre', e.target.value)} placeholder="Titre de la leçon *" className="input" />
            <textarea value={form.contenu} onChange={(e) => set('contenu', e.target.value)} placeholder="Contenu…" rows={4} className="input" style={{ resize: 'vertical' }} />
            <select value={form.domaine} onChange={(e) => set('domaine', e.target.value)} className="input">
              <option value="">Domaine (optionnel)</option>
              {DOMAINS.map((d) => <option key={d.id} value={d.id}>{d.icon} {d.label}</option>)}
            </select>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
              {form.tags.map((tag) => (
                <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 10px', background: 'var(--bg)', borderRadius: 99, fontSize: 12, color: 'var(--text-2)' }}>
                  #{tag}
                  <button onClick={() => removeTag(tag)} style={{ color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}><X size={10} /></button>
                </span>
              ))}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  placeholder="Tag…"
                  className="input"
                  style={{ padding: '3px 10px', borderRadius: 99, fontSize: 12, width: 90 }}
                />
                <button onClick={addTag} style={{ fontSize: 12, color: 'var(--orange)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Tag</button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Annuler</button>
              <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={save}>Sauvegarder</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Aucune leçon.</p>}
        {filtered.map((l) => {
          const color = l.domaine ? getDomainColor(l.domaine) : '#AAAAAA'
          const light = l.domaine ? getDomainLight(l.domaine) : '#F5F5F5'
          return (
            <div key={l.id} className="lesson-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginBottom: 8 }}>
                    {l.domaine && <Badge color={color} bg={light}>{DOMAINS.find((d) => d.id === l.domaine)?.icon} {DOMAINS.find((d) => d.id === l.domaine)?.label}</Badge>}
                    {(l.tags ?? []).map((tag) => <Badge key={tag} color="#666" bg="#EEEEEE">#{tag}</Badge>)}
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{l.date}</span>
                  </div>
                  <div className="title">{l.titre}</div>
                  {l.contenu && <div className="preview">{l.contenu}</div>}
                </div>
                <button onClick={() => deleteLecon(l.id)} aria-label="Supprimer" className="btn-icon" style={{ flexShrink: 0 }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
