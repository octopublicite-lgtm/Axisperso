import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper'
import { useApp } from '../../context/AppContext'
import { DOMAINS, HORIZONS, HORIZON_LABEL, STATUTS } from '../../utils/constants'
import { getDomainColor, getDomainLight } from '../../utils/colors'
import ObjectifCard from './ObjectifCard'
import ObjectifModal from './ObjectifModal'
import HabitsDomaine from './HabitsDomaine'
import SuiviDomaine from './SuiviDomaine'
import HabitudeModal from './HabitudeModal'
import { Plus } from 'lucide-react'

function MobileDomainPills({ activeDomain, setActiveDomain, domainCounts, objectifs, visibleDomains }) {
  return (
    <div className="domain-pills-mobile">
      <div
        className={`domain-pill-item${!activeDomain ? ' active' : ''}`}
        onClick={() => setActiveDomain(null)}
      >
        🎯 Tous ({objectifs.length})
      </div>
      {visibleDomains.map((d) => {
        const color = getDomainColor(d.id)
        const active = activeDomain === d.id
        return (
          <div
            key={d.id}
            className={`domain-pill-item${active ? ' active' : ''}`}
            style={active ? { '--c': color } : undefined}
            onClick={() => setActiveDomain(active ? null : d.id)}
          >
            {d.icon} {d.label} ({domainCounts[d.id] ?? 0})
          </div>
        )
      })}
    </div>
  )
}

function useFortuneNette() {
  try {
    const actifs  = JSON.parse(localStorage.getItem('axislife_fortune_actifs')  ?? 'null')
    const passifs = JSON.parse(localStorage.getItem('axislife_fortune_passifs') ?? 'null')
    if (!actifs && !passifs) return null
    const a = (actifs  ?? []).reduce((s, i) => s + Number(i.valeur), 0)
    const p = (passifs ?? []).reduce((s, i) => s + Number(i.valeur), 0)
    return a - p
  } catch { return null }
}

function FinanceBanner() {
  const net = useFortuneNette()
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px', borderRadius: 10,
      background: '#FFF8EC', borderLeft: '4px solid #F5A623',
      marginBottom: 16, fontSize: 13,
    }}>
      <span>💰</span>
      {net !== null ? (
        <>
          <span style={{ color: 'var(--text-2)' }}>
            Fortune nette actuelle :{' '}
            <strong style={{ color: '#F5A623' }}>{Number(net).toLocaleString('fr-MA')} MAD</strong>
          </span>
          <Link to="/fortune" style={{ marginLeft: 'auto', color: '#F5A623', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>Voir le détail →</Link>
        </>
      ) : (
        <>
          <span style={{ color: 'var(--text-2)' }}>Aucune donnée de fortune.</span>
          <Link to="/fortune" style={{ marginLeft: 'auto', color: '#F5A623', fontWeight: 600, textDecoration: 'none' }}>Configurer →</Link>
        </>
      )}
    </div>
  )
}

export default function Objectifs() {
  const { objectifs, settings } = useApp()
  const [activeDomain, setActiveDomain] = useState(null)
  const [filterHorizon, setFilterHorizon] = useState('Tous')
  const [filterStatut, setFilterStatut] = useState('Tous')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [habitModalOpen, setHabitModalOpen] = useState(false)

  const filtered = useMemo(() => {
    return objectifs.filter((o) => {
      if (activeDomain && o.domaine !== activeDomain) return false
      if (filterHorizon !== 'Tous' && o.horizon !== filterHorizon) return false
      if (filterStatut !== 'Tous' && o.status !== filterStatut) return false
      return true
    })
  }, [objectifs, activeDomain, filterHorizon, filterStatut])

  const visibleDomains = useMemo(() => {
    const ids = settings.domainesActifs
    return ids ? DOMAINS.filter((d) => ids.includes(d.id)) : DOMAINS
  }, [settings.domainesActifs])

  const domainCounts = useMemo(() => {
    const map = {}
    objectifs.forEach((o) => { map[o.domaine] = (map[o.domaine] ?? 0) + 1 })
    return map
  }, [objectifs])

  function openCreate() { setEditTarget(null); setModalOpen(true) }
  function openEdit(obj) { setEditTarget(obj); setModalOpen(true) }

  return (
    <PageWrapper>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Objectifs</h1>
          <p className="page-subtitle">{filtered.length} sur {objectifs.length} affichés · {visibleDomains.length} domaines</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={15} strokeWidth={2.4} /> Nouvel objectif
        </button>
      </div>

      {/* Mobile domain pills — hidden on desktop via CSS */}
      <MobileDomainPills
        activeDomain={activeDomain}
        setActiveDomain={setActiveDomain}
        domainCounts={domainCounts}
        objectifs={objectifs}
        visibleDomains={visibleDomains}
      />

      <div className="with-side">
        {/* Domains sidebar */}
        <div className="side-panel">
          <p className="section-label" style={{ padding: '4px 12px 8px' }}>Domaines</p>
          <div className="domains-list">
            <div
              className={`domain-item${!activeDomain ? ' active' : ''}`}
              style={!activeDomain ? { '--c': '#1A1A2E' } : undefined}
              onClick={() => setActiveDomain(null)}
            >
              <span className="emoji">🎯</span>
              <span className="name">Tous</span>
              <span className="count">{objectifs.length}</span>
            </div>
            {visibleDomains.map((d) => {
              const color = getDomainColor(d.id)
              const active = activeDomain === d.id
              return (
                <div
                  key={d.id}
                  className={`domain-item${active ? ' active' : ''}`}
                  style={active ? { '--c': color } : undefined}
                  onClick={() => setActiveDomain(active ? null : d.id)}
                >
                  <span className="emoji">{d.icon}</span>
                  <span className="name">{d.label}</span>
                  <span className="count">{domainCounts[d.id] ?? 0}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Main content */}
        <div>
          {activeDomain === 'finance' && <FinanceBanner />}
          <div className="filter-row">
            <span className="filter-label">Période</span>
            {['Tous', ...HORIZONS].map((h) => (
              <div
                key={h}
                className={`pill${filterHorizon === h ? ' active' : ''}`}
                onClick={() => setFilterHorizon(h)}
              >
                {HORIZON_LABEL[h] ?? h}
              </div>
            ))}
          </div>
          <div className="filter-row" style={{ marginBottom: 24 }}>
            <span className="filter-label">Statut</span>
            {['Tous', ...STATUTS].map((s) => (
              <div
                key={s}
                className={`pill${filterStatut === s ? ' active' : ''}`}
                onClick={() => setFilterStatut(s)}
              >
                {s}
              </div>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="card empty-state">
              <div className="emoji">🎯</div>
              <div className="title">Aucun objectif pour ces filtres</div>
              <div className="desc">Essayez de relâcher la période ou le domaine.</div>
            </div>
          ) : (
            <div className="objectifs-grid">
              {filtered.map((o) => (
                <ObjectifCard key={o.id} objectif={o} onEdit={openEdit} />
              ))}
            </div>
          )}

          {activeDomain && (
            <>
              <HabitsDomaine domaine={activeDomain} />
              <SuiviDomaine domaine={activeDomain} />
            </>
          )}
        </div>
      </div>

      {/* Mobile FAB */}
      <button className="fab" onClick={openCreate} aria-label="Nouvel objectif">
        <Plus size={28} strokeWidth={2.5} />
      </button>

      <ObjectifModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editTarget={editTarget}
        defaultDomain={activeDomain}
      />
      <HabitudeModal
        isOpen={habitModalOpen}
        onClose={() => setHabitModalOpen(false)}
        editTarget={null}
        domaine={activeDomain ?? 'mindstyle'}
      />
    </PageWrapper>
  )
}
