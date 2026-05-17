import { useState, useRef } from 'react'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Toggle from '../../components/ui/Toggle'
import { useApp } from '../../context/AppContext'
import { DOMAINS } from '../../utils/constants'
import { getDomainColor } from '../../utils/colors'
import { Download, Upload, Trash2 } from 'lucide-react'

export default function Parametres() {
  const { settings, setSettings, exportData, importData, resetAll } = useApp()
  const [showConfirmReset, setShowConfirmReset] = useState(false)
  const fileRef = useRef(null)

  function updateSettings(k, v) { setSettings((p) => ({ ...p, [k]: v })) }

  function toggleDomain(id) {
    const actifs = settings.domainesActifs ?? []
    const next = actifs.includes(id) ? actifs.filter((d) => d !== id) : [...actifs, id]
    updateSettings('domainesActifs', next)
  }

  function handleImport(e) {
    const file = e.target.files?.[0]
    if (file) importData(file)
  }

  return (
    <PageWrapper>
      <h1 className="text-2xl font-extrabold text-primary mb-6">Paramètres</h1>

      <div className="flex flex-col gap-5 max-w-xl">
        {/* Profil */}
        <Card>
          <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">Profil</p>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-secondary uppercase tracking-wide">Ton prénom</label>
              <input value={settings.nom ?? ''} onChange={(e) => updateSettings('nom', e.target.value)}
                className="px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-secondary uppercase tracking-wide">Heure de démarrage du rituel</label>
              <input type="time" value={settings.heureRituel ?? '07:00'} onChange={(e) => updateSettings('heureRituel', e.target.value)}
                className="px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent w-32" />
            </div>
          </div>
        </Card>

        {/* Domaines actifs */}
        <Card>
          <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">Domaines actifs</p>
          <div className="flex flex-col gap-2">
            {DOMAINS.map((d) => {
              const active = (settings.domainesActifs ?? []).includes(d.id)
              const color = getDomainColor(d.id)
              return (
                <div key={d.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{d.icon}</span>
                    <span className="text-sm font-medium text-primary">{d.label}</span>
                  </div>
                  <Toggle checked={active} onChange={() => toggleDomain(d.id)} id={`domain-${d.id}`} />
                </div>
              )
            })}
          </div>
        </Card>

        {/* Export / Import */}
        <Card>
          <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">Données</p>
          <div className="flex flex-col gap-3">
            <Button onClick={exportData} variant="secondary" className="w-full justify-center">
              <Download size={15} /> Exporter les données (JSON)
            </Button>
            <Button onClick={() => fileRef.current?.click()} variant="secondary" className="w-full justify-center">
              <Upload size={15} /> Importer des données (JSON)
            </Button>
            <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          </div>
        </Card>

        {/* Reset */}
        <Card>
          <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">Zone de danger</p>
          <p className="text-xs text-muted mb-4">Cette action efface toutes tes données. Elle est irréversible.</p>
          {!showConfirmReset ? (
            <Button variant="danger" onClick={() => setShowConfirmReset(true)} className="w-full justify-center">
              <Trash2 size={15} /> Réinitialiser toutes les données
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setShowConfirmReset(false)} className="flex-1">Annuler</Button>
              <Button variant="danger" onClick={resetAll} className="flex-1">Confirmer la réinitialisation</Button>
            </div>
          )}
        </Card>
      </div>
    </PageWrapper>
  )
}
