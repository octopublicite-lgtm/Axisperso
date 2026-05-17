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

function AuthLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
    }}>
      <svg style={{ animation: 'spin 0.8s linear infinite' }} width={40} height={40} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="rgba(255,107,53,0.25)" strokeWidth="3" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="#FF6B35" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export default function App() {
  const { session, loading } = useAuth()

  if (loading) return <AuthLoader />

  if (!session) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
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
    </div>
  )
}
