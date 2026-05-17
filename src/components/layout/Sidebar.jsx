import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Target, Calendar, BarChart2, BookOpen, Settings, Landmark, LogOut, User, Moon } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const NAV = [
  { to: '/',          icon: <Home size={18} strokeWidth={2} />,      label: 'Dashboard',  end: true },
  { to: '/objectifs', icon: <Target size={18} strokeWidth={2} />,    label: 'Objectifs',  end: false },
  { to: '/planning',  icon: <Calendar size={18} strokeWidth={2} />,  label: 'Planning',   end: false },
  { to: '/suivi',     icon: <BarChart2 size={18} strokeWidth={2} />, label: 'Suivi',      end: false },
  { to: '/fortune',   icon: <Landmark size={18} strokeWidth={2} />,  label: 'Fortune',    end: false },
  { to: '/reflexion', icon: <BookOpen size={18} strokeWidth={2} />,  label: 'Réflexion',  end: false },
]

const MOBILE_NAV = NAV.slice(0, 5) // Dashboard → Fortune; Profil replaces the 6th slot

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
  const { session } = useAuth()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)

  const nom = settings?.nom ?? 'Vous'
  const initials = nom.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const email = session?.user?.email ?? ''

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  function goSettings() {
    setProfileOpen(false)
    navigate('/parametres')
  }

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
          <button
            onClick={handleLogout}
            className="nav-item"
            style={{ color: '#EF4444', width: '100%', textAlign: 'left' }}
            onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
            onMouseLeave={e => e.currentTarget.style.background = ''}
          >
            <LogOut size={18} strokeWidth={2} style={{ color: '#EF4444' }} />
            <span>Se déconnecter</span>
          </button>
          <div className="sidebar-user">
            <div className="avatar">{initials}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="name">{nom}</div>
              <div className="role">Axis Life Pro</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav — 5 nav items + Profil */}
      <nav className="mobile-nav">
        {MOBILE_NAV.map((item) => (
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
        <button
          className="mobile-nav-item"
          onClick={() => setProfileOpen(true)}
          aria-label="Profil"
        >
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: '#FF6B35', color: '#fff',
            fontSize: 9, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {initials || <User size={12} />}
          </div>
          <span>Profil</span>
        </button>
      </nav>

      {/* Profile bottom sheet (mobile only) */}
      {profileOpen && (
        <>
          <div
            className="profile-sheet-backdrop"
            style={{ display: 'block' }}
            onClick={() => setProfileOpen(false)}
          />
          <div className="profile-sheet" style={{ display: 'block' }}>
            <div className="profile-sheet-handle" />

            <div className="profile-sheet-user">
              <div className="profile-sheet-avatar">{initials}</div>
              <div>
                <div className="profile-sheet-name">{nom}</div>
                {email && <div className="profile-sheet-email">{email}</div>}
              </div>
            </div>

            <div className="profile-sheet-divider" />

            <button className="profile-sheet-item" onClick={goSettings}>
              <Settings size={18} strokeWidth={2} color="#666" />
              Paramètres
            </button>
            <button className="profile-sheet-item" onClick={() => setProfileOpen(false)}>
              <Moon size={18} strokeWidth={2} color="#666" />
              Thème
            </button>

            <div className="profile-sheet-divider" style={{ marginTop: 8 }} />

            <button className="profile-sheet-item danger" onClick={handleLogout}>
              <LogOut size={18} strokeWidth={2} />
              Se déconnecter
            </button>

            <div style={{ height: 16 }} />
          </div>
        </>
      )}
    </>
  )
}
