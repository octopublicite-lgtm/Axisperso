import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Target, Calendar, BarChart2, BookOpen, Settings, Landmark } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const NAV = [
  { to: '/',          icon: <Home size={18} strokeWidth={2} />,      label: 'Dashboard',  end: true },
  { to: '/objectifs', icon: <Target size={18} strokeWidth={2} />,    label: 'Objectifs',  end: false },
  { to: '/planning',  icon: <Calendar size={18} strokeWidth={2} />,  label: 'Planning',   end: false },
  { to: '/suivi',     icon: <BarChart2 size={18} strokeWidth={2} />, label: 'Suivi',      end: false },
  { to: '/fortune',   icon: <Landmark size={18} strokeWidth={2} />,  label: 'Fortune',    end: false },
  { to: '/reflexion', icon: <BookOpen size={18} strokeWidth={2} />,  label: 'Réflexion',  end: false },
]

const Logo = () => (
  <svg width={32} height={32} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
    <path d="M9 6 L24 21 L20 25 L5 10 Z" fill="#1A1A2E" opacity="0.18" />
    <path d="M22 6 L26 10 L11 25 L7 21 Z" fill="#1A1A2E" opacity="0.18" />
    <path d="M11 4 L26 19 L22 23 L7 8 Z" fill="#FF6B35" />
    <path d="M24 4 L28 8 L13 23 L9 19 Z" fill="#FF6B35" />
    <circle cx="17.5" cy="13.5" r="2" fill="#FFFFFF" />
  </svg>
)

export default function Sidebar() {
  const { settings } = useApp()
  const navigate = useNavigate()
  const nom = settings?.nom ?? 'Vous'
  const initials = nom.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sidebar hidden md:flex">
        <div className="sidebar-brand">
          <Logo />
          <div className="brand-wordmark">
            <span className="brand-axis">AXIS</span> <span className="brand-life">LIFE</span>
          </div>
        </div>
        <div className="sidebar-divider" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="sidebar-bottom">
          <NavLink
            to="/parametres"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Settings size={18} strokeWidth={2} />
            <span>Paramètres</span>
          </NavLink>
          <div className="sidebar-user">
            <div className="avatar">{initials}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="name">{nom}</div>
              <div className="role">Axis Life Pro</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav — 6 items, no Paramètres */}
      <nav className="mobile-nav">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
