import { Routes, Route } from 'react-router-dom'
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

export default function App() {
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
