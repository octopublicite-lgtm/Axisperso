import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import './login.css'

const Logo = () => (
  <svg width={40} height={40} viewBox="0 0 32 32" fill="none">
    <path d="M9 6 L24 21 L20 25 L5 10 Z" fill="#1A1A2E" opacity="0.18" />
    <path d="M22 6 L26 10 L11 25 L7 21 Z" fill="#1A1A2E" opacity="0.18" />
    <path d="M11 4 L26 19 L22 23 L7 8 Z" fill="#FF6B35" />
    <path d="M24 4 L28 8 L13 23 L9 19 Z" fill="#FF6B35" />
    <circle cx="17.5" cy="13.5" r="2" fill="#FFFFFF" />
  </svg>
)

const Spinner = () => (
  <svg className="spin" width={18} height={18} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.35)" strokeWidth="3" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
  </svg>
)

const GeoIllustration = () => (
  <svg width="300" height="300" viewBox="0 0 300 300" fill="none">
    {/* Background circle */}
    <circle cx="150" cy="150" r="120" fill="rgba(255,107,53,0.06)" />
    <circle cx="150" cy="150" r="80" fill="rgba(255,107,53,0.05)" />

    {/* Floating orange X shapes */}
    <g className="geo-a">
      <path d="M80 60 L110 90 L103 97 L73 67 Z" fill="#FF6B35" />
      <path d="M103 60 L110 67 L80 97 L73 90 Z" fill="#FF6B35" />
      <circle cx="91.5" cy="78.5" r="5" fill="#fff" />
    </g>

    <g className="geo-b">
      <path d="M185 40 L208 63 L203 68 L180 45 Z" fill="rgba(255,107,53,0.7)" />
      <path d="M203 40 L208 45 L185 68 L180 63 Z" fill="rgba(255,107,53,0.7)" />
      <circle cx="194" cy="54" r="3.5" fill="#fff" opacity="0.8" />
    </g>

    <g className="geo-c">
      <path d="M200 190 L228 218 L221 225 L193 197 Z" fill="#FF6B35" />
      <path d="M221 190 L228 197 L200 225 L193 218 Z" fill="#FF6B35" />
      <circle cx="210.5" cy="207.5" r="4.5" fill="#fff" />
    </g>

    {/* Connecting lines */}
    <line x1="91" y1="90" x2="150" y2="150" stroke="rgba(255,107,53,0.25)" strokeWidth="1.5" strokeDasharray="4 4" />
    <line x1="194" y1="60" x2="150" y2="150" stroke="rgba(255,107,53,0.2)" strokeWidth="1.5" strokeDasharray="4 4" />
    <line x1="210" y1="210" x2="150" y2="150" stroke="rgba(255,107,53,0.25)" strokeWidth="1.5" strokeDasharray="4 4" />

    {/* Center logo */}
    <circle cx="150" cy="150" r="32" fill="rgba(255,107,53,0.15)" />
    <path d="M136 134 L158 156 L153 161 L131 139 Z" fill="#FF6B35" />
    <path d="M153 134 L158 139 L136 161 L131 156 Z" fill="#FF6B35" />
    <circle cx="144.5" cy="147.5" r="4" fill="#fff" />

    {/* Orbiting dots */}
    <circle cx="150" cy="58" r="4" fill="rgba(255,255,255,0.15)" />
    <circle cx="242" cy="150" r="4" fill="rgba(255,255,255,0.15)" />
    <circle cx="150" cy="242" r="4" fill="rgba(255,255,255,0.15)" />
    <circle cx="58" cy="150" r="4" fill="rgba(255,255,255,0.15)" />

    {/* Small accent dots */}
    <circle cx="120" cy="220" r="6" fill="rgba(255,107,53,0.4)" />
    <circle cx="230" cy="100" r="5" fill="rgba(255,107,53,0.3)" />
    <circle cx="60" cy="200" r="3" fill="rgba(255,255,255,0.2)" />
    <circle cx="260" cy="210" r="3" fill="rgba(255,255,255,0.2)" />
  </svg>
)

const FEATURES = [
  '🎯 Objectifs par domaine de vie',
  '📊 Suivi de fortune personnelle',
  '🔥 Streaks & habitudes quotidiennes',
  '📓 Journal & réflexion structurée',
]

export default function LoginPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [remember, setRemember] = useState(false)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [prenom, setPrenom] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  function switchTab(t) { setTab(t); setError(''); setSuccess('') }

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    const { error: err } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword })
    setLoading(false)
    if (err) {
      setError(
        err.message.includes('Invalid login credentials')
          ? 'Email ou mot de passe incorrect.'
          : err.message
      )
    } else {
      navigate('/')
    }
  }

  async function handleSignup(e) {
    e.preventDefault()
    if (signupPassword !== confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return }
    if (signupPassword.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return }
    setLoading(true); setError(''); setSuccess('')
    const { error: err } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: { data: { nom: prenom } },
    })
    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      setSuccess('Compte créé ! Vérifiez votre email pour confirmer votre inscription.')
    }
  }

  async function handleForgotPassword() {
    if (!loginEmail) { setError("Entrez votre email d'abord."); return }
    setLoading(true); setError(''); setSuccess('')
    await supabase.auth.resetPasswordForEmail(loginEmail, { redirectTo: window.location.origin })
    setLoading(false)
    setSuccess('Email de réinitialisation envoyé. Vérifiez votre boîte mail.')
  }

  const pwMismatch = tab === 'signup' && confirmPassword && signupPassword !== confirmPassword

  return (
    <div className="login-page">
      {/* ---- Left: card ---- */}
      <div className="login-left">
        <div className="login-card">
          <div className="login-logo">
            <Logo />
            <div className="login-brand">
              <span style={{ color: '#FF6B35', fontWeight: 800 }}>AXIS</span>
              <span style={{ fontWeight: 800, color: '#1A1A2E' }}> LIFE</span>
            </div>
          </div>
          <p className="login-tagline">Pilotez votre vie. Chaque jour.</p>

          <div className="login-tabs">
            <button className={`login-tab${tab === 'login' ? ' active' : ''}`} onClick={() => switchTab('login')}>
              Se connecter
            </button>
            <button className={`login-tab${tab === 'signup' ? ' active' : ''}`} onClick={() => switchTab('signup')}>
              Créer un compte
            </button>
          </div>

          {error && <div className="login-error">⚠ {error}</div>}
          {success && <div className="login-success">✓ {success}</div>}

          {tab === 'login' && (
            <form onSubmit={handleLogin} className="login-form" key="login">
              <div className="login-field">
                <label>Email</label>
                <input
                  type="email" autoComplete="email"
                  placeholder="votre@email.com"
                  value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                  required className={error ? 'has-error' : ''}
                />
              </div>
              <div className="login-field">
                <label>Mot de passe</label>
                <input
                  type="password" autoComplete="current-password"
                  placeholder="••••••••"
                  value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                  required className={error ? 'has-error' : ''}
                />
              </div>
              <div className="login-row">
                <label className="login-check">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                  Se souvenir de moi
                </label>
                <button type="button" className="login-link" onClick={handleForgotPassword}>
                  Mot de passe oublié ?
                </button>
              </div>
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? <><Spinner /> Connexion en cours...</> : 'Se connecter'}
              </button>
            </form>
          )}

          {tab === 'signup' && (
            <form onSubmit={handleSignup} className="login-form" key="signup">
              <div className="login-field">
                <label>Prénom</label>
                <input
                  type="text" autoComplete="given-name"
                  placeholder="Votre prénom"
                  value={prenom} onChange={e => setPrenom(e.target.value)}
                  required
                />
              </div>
              <div className="login-field">
                <label>Email</label>
                <input
                  type="email" autoComplete="email"
                  placeholder="votre@email.com"
                  value={signupEmail} onChange={e => setSignupEmail(e.target.value)}
                  required
                />
              </div>
              <div className="login-field">
                <label>Mot de passe</label>
                <input
                  type="password" autoComplete="new-password"
                  placeholder="••••••••"
                  value={signupPassword} onChange={e => setSignupPassword(e.target.value)}
                  required
                />
              </div>
              <div className="login-field">
                <label>Confirmer le mot de passe</label>
                <input
                  type="password" autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  required className={pwMismatch ? 'has-error' : ''}
                />
              </div>
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? <><Spinner /> Création en cours...</> : 'Créer mon compte'}
              </button>
              <p className="login-terms">En créant un compte, vous acceptez nos conditions d'utilisation.</p>
            </form>
          )}

          <div className="login-switch">
            {tab === 'login' ? (
              <>Pas encore de compte ?&nbsp;<button type="button" className="login-link" onClick={() => switchTab('signup')}>Créer un compte →</button></>
            ) : (
              <>Déjà un compte ?&nbsp;<button type="button" className="login-link" onClick={() => switchTab('login')}>Se connecter →</button></>
            )}
          </div>
        </div>
      </div>

      {/* ---- Right: illustration (desktop only) ---- */}
      <div className="login-right">
        <div className="login-right-inner">
          <div className="login-right-title">
            Pilotez votre vie.<br />
            <span>Chaque domaine.</span><br />
            Chaque jour.
          </div>
          <div className="login-geo">
            <GeoIllustration />
          </div>
          <div className="login-features-list">
            {FEATURES.map((f, i) => (
              <div key={i} className="login-feature-item">{f}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
