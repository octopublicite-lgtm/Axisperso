import { useState } from 'react'
import PageWrapper from '../../components/layout/PageWrapper'
import RituelMatin from './RituelMatin'
import PlanDuJour from './PlanDuJour'
import Semaine from './Semaine'
import TimeBlocksRecurrents from './TimeBlocksRecurrents'

const TABS = ['Rituel Matin', 'Plan du Jour', 'Semaine', 'Time Blocks']

export default function Planning() {
  const [tab, setTab] = useState(0)

  return (
    <PageWrapper>
      <h1 className="page-title">Planning</h1>
      <div className="tabs" style={{ marginBottom: 28 }}>
        {TABS.map((t, i) => (
          <button key={t} className={`tab${tab === i ? ' active' : ''}`} onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>
      {tab === 0 && <RituelMatin />}
      {tab === 1 && <PlanDuJour />}
      {tab === 2 && <div className="week-scroll-wrapper"><Semaine /></div>}
      {tab === 3 && <TimeBlocksRecurrents />}
    </PageWrapper>
  )
}
