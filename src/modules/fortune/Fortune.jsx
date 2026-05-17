import { useState } from 'react'
import PageWrapper from '../../components/layout/PageWrapper'
import Patrimoine from './Patrimoine'
import Flux from './Flux'
import Bilan from './Bilan'

const TABS = ['Patrimoine', 'Flux', 'Bilan']

export default function Fortune() {
  const [tab, setTab] = useState(0)

  return (
    <PageWrapper>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Fortune</h1>
          <p className="page-subtitle">Suivi de votre patrimoine & flux financiers</p>
        </div>
      </div>
      <div className="tabs" style={{ marginBottom: 28 }}>
        {TABS.map((t, i) => (
          <button key={t} className={`tab${tab === i ? ' active' : ''}`} onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>
      {tab === 0 && <Patrimoine />}
      {tab === 1 && <Flux />}
      {tab === 2 && <Bilan />}
    </PageWrapper>
  )
}
