import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Sidebar from './components/layout/Sidebar'
import ToastContainer from './components/ui/Toast'
import Dashboard from './modules/dashboard/Dashboard'
import Objectifs from './modules/objectifs/Objectifs'
import ObjectifDetail from './modules/objectifs/ObjectifDetail'
import Planning from './modules/planning/Planning'
import Suivi from './modules/suivi/Suivi'
import Reflexion from './modules/reflexion/Reflexion'
import Fortune from './modules/fortune/Fortune'
import Parametres from './modules/parametres/Parametres'
import LandingPage from './modules/landing/LandingPage'
import LoginPage from './modules/auth/LoginPage'

// Skeleton that mirrors the authenticated app shell — never blocks interaction
function AppSkeleton() {
  return (
    <div className="app" aria-hidden="true">
      {/* Sidebar skeleton */}
      <aside className="sidebar hidden md:flex" style={{ pointerEvents: 'none' }}>
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          <div className="skeleton" style={{ width: 120, height: 22, marginBottom: 20 }} />
          {[100, 85, 90, 80, 95, 88].map((w, i) => (
            <div key={i} className="skeleton" style={{ height: 36, width: `${w}%`, borderRadius: 8 }} />
          ))}
        </div>
      </aside>
      {/* Main content skeleton */}
      <main className="main">
        <div className="skeleton" style={{ width: 220, height: 26, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: 150, height: 14, marginBottom: 28 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 140, borderRadius: 14 }} />
          ))}
        </div>
      </main>
    </div>
  )
}

// Standalone connection error toast — does not depend on AppContext
function ConnectionToast({ onDismiss }) {
  return (
    <div className="conn-toast">
      <span>⚠ Erreur de connexion — vérifiez votre réseau</span>
      <button onClick={onDismiss} aria-label="Fermer">×</button>
    </div>
  )
}

export default function App() {
  const { session, loading, timedOut } = useAuth()
  const [showConnError, setShowConnError] = useState(false)

  useEffect(() => {
    if (timedOut) setShowConnError(true)
  }, [timedOut])

  if (loading) return <AppSkeleton />

  if (!session) {
    return (
      <>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        {showConnError && <ConnectionToast onDismiss={() => setShowConnError(false)} />}
      </>
    )
  }

  return (
    <div className="app">
      <Sidebar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/objectifs" element={<Objectifs />} />
        <Route path="/objectifs/:id" element={<ObjectifDetail />} />
        <Route path="/planning" element={<Planning />} />
        <Route path="/suivi" element={<Suivi />} />
        <Route path="/fortune" element={<Fortune />} />
        <Route path="/reflexion" element={<Reflexion />} />
        <Route path="/parametres" element={<Parametres />} />
      </Routes>
      <ToastContainer />
      {showConnError && <ConnectionToast onDismiss={() => setShowConnError(false)} />}
    </div>
  )
}
