import { useState } from 'react'
import PageWrapper from '../../components/layout/PageWrapper'
import HabitudesTab from './HabitudesTab'
import KPIsTab from './KPIsTab'
import BilanHebdo from './BilanHebdo'
import BilanMensuel from './BilanMensuel'

const TABS = ['Habitudes', 'KPIs', 'Bilan Hebdo', 'Bilan Mensuel']

export default function Suivi() {
  const [tab, setTab] = useState(0)

  return (
    <PageWrapper>
      <h1 className="page-title">Suivi</h1>
      <div className="tabs" style={{ marginBottom: 28 }}>
        {TABS.map((t, i) => (
          <button key={t} className={`tab${tab === i ? ' active' : ''}`} onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>
      {tab === 0 && <HabitudesTab />}
      {tab === 1 && <KPIsTab />}
      {tab === 2 && <BilanHebdo />}
      {tab === 3 && <BilanMensuel />}
    </PageWrapper>
  )
}
