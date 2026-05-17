import { useState } from 'react'
import PageWrapper from '../../components/layout/PageWrapper'
import Journal from './Journal'
import Lecons from './Lecons'
import Blocages from './Blocages'
import RevueSysteme from './RevueSysteme'

const TABS = ['Journal', 'Leçons', 'Blocages', 'Revue Système']

export default function Reflexion() {
  const [tab, setTab] = useState(0)

  return (
    <PageWrapper>
      <h1 className="page-title">Réflexion</h1>
      <div className="tabs" style={{ marginBottom: 28 }}>
        {TABS.map((t, i) => (
          <button key={t} className={`tab${tab === i ? ' active' : ''}`} onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>
      {tab === 0 && <Journal />}
      {tab === 1 && <Lecons />}
      {tab === 2 && <Blocages />}
      {tab === 3 && <RevueSysteme />}
    </PageWrapper>
  )
}
