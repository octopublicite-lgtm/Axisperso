import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './landing.css'

const XLogo = ({ size = 26 }) => (
  <span className="x-logo" style={{ '--logo-size': `${size}px` }}>
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M5 6 L26 27 M26 6 L5 27" stroke="#FF6B35" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="15.5" cy="16.5" r="2.5" fill="#FF6B35" />
    </svg>
  </span>
)

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const TrustCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export default function LandingPage() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollTo(id) {
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.offsetTop - 60, behavior: 'smooth' })
  }

  const goLogin = () => navigate('/login')
  const goSignup = () => navigate('/login?signup=1')

  return (
    <div className="lp-page">

      {/* ============ NAVBAR ============ */}
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <a className="wordmark on-dark" onClick={goLogin} style={{ cursor: 'pointer' }}>
            <XLogo size={26} />
            <span><span className="axis">AXIS</span> <span className="life">LIFE</span></span>
          </a>
          <div className="nav-links">
            <button className="nav-link" onClick={() => scrollTo('features')}>Fonctionnalités</button>
            <button className="nav-link" onClick={() => scrollTo('how')}>Comment ça marche</button>
            <button className="nav-link" onClick={() => scrollTo('pricing')}>Tarifs</button>
            <button className="nav-link" onClick={() => scrollTo('testimonials')}>Témoignages</button>
          </div>
          <div className="nav-actions">
            <button className="btn btn-ghost-light" onClick={goLogin}>Se connecter</button>
            <button className="btn btn-primary" onClick={goSignup}>Commencer →</button>
          </div>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="hero-badge"><span>✦</span> Productivité personnelle nouvelle génération</div>
            <h1>
              Pilotez votre <span className="underlined orange">vie</span>.<br />
              Chaque domaine.<br />
              Chaque jour.
            </h1>
            <p className="sub">
              Le système de productivité pour entrepreneurs qui veulent construire une vie intentionnelle — objectifs, habitudes, fortune personnelle et réflexion structurée.
            </p>
            <div className="hero-ctas">
              <button className="btn btn-primary btn-lg" onClick={goSignup}>Commencer →</button>
              <button className="btn btn-ghost-light btn-lg" onClick={() => scrollTo('features')}>Voir la démo</button>
            </div>
            <div className="trust">
              <span><TrustCheck /> Aucune carte bancaire</span>
              <span className="sep">•</span>
              <span><TrustCheck /> Accès immédiat</span>
              <span className="sep">•</span>
              <span><TrustCheck /> Données 100% privées</span>
            </div>
          </div>

          {/* Hero mockup */}
          <div className="hero-mockup-wrap">
            <div className="mockup">
              <div className="mockup-inner">
                <div className="mockup-side">
                  <div className="item active">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/>
                      <rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>
                    </svg>
                  </div>
                  <div className="item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/>
                    </svg>
                  </div>
                  <div className="item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="17" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/>
                    </svg>
                  </div>
                  <div className="item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>
                  </div>
                  <div className="item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 1 4 17.5v-13z"/>
                    </svg>
                  </div>
                </div>
                <div className="mockup-main">
                  <div className="mockup-greet">Vendredi 16 mai</div>
                  <div className="mockup-title">Bonjour Thomas 👋</div>
                  <div className="mockup-kpis">
                    <div className="kpi-mock"><div className="l">Objectifs</div><div className="v orange">12</div></div>
                    <div className="kpi-mock"><div className="l">Habitudes</div><div className="v green">5/8</div></div>
                    <div className="kpi-mock"><div className="l">Streak</div><div className="v purple">29j</div></div>
                  </div>
                  <div className="mock-list">
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
                      Priorités du jour · 1/3
                    </div>
                    <div className="mock-row done"><span className="dot done" /><span>Finaliser la proposition SaaS</span></div>
                    <div className="mock-row"><span className="dot" /><span>Séance fractionné — 8×400m</span></div>
                    <div className="mock-row"><span className="dot" /><span>Écrire l'épisode 12 du podcast</span></div>
                  </div>
                  <div className="mock-list">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                      <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>MRR Axis Management</span>
                      <span style={{ color: '#FF6B35', fontWeight: 700 }}>31.2K€</span>
                    </div>
                    <div className="mock-progress"><div className="fill" style={{ width: '62%' }} /></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="float-chip chip-streak"><span className="ic">🔥</span> Streak 29 jours</div>
            <div className="float-chip chip-fortune"><span className="ic">💰</span> Fortune +12%</div>
            <div className="float-chip chip-habit"><span className="ic">✅</span> 5/8 habitudes</div>
          </div>
        </div>
      </section>

      {/* ============ SOCIAL PROOF ============ */}
      <section className="proof">
        <div className="container">
          <div className="proof-label">Rejoignez les entrepreneurs qui pilotent leur vie avec intention</div>
          <div className="proof-logos">
            <div className="proof-logo"><span style={{ fontSize: 22 }}>◆</span> NORDIK</div>
            <div className="proof-logo"><span style={{ fontSize: 22 }}>▲</span> Méridien</div>
            <div className="proof-logo"><span style={{ fontSize: 22 }}>●</span> Studio K</div>
            <div className="proof-logo"><span style={{ fontSize: 22 }}>✦</span> Halcyon</div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="section bg-white" id="features">
        <div className="container">
          <div className="section-eyebrow">Fonctionnalités</div>
          <h2>Tout ce dont vous avez besoin</h2>
          <p className="lead">Un seul outil. Tous les domaines de votre vie.</p>
          <div className="features">
            <div className="feature-card">
              <div className="feature-icon" style={{ '--ic-bg': '#FFF0EB', '--ic-fg': '#FF6B35' }}>🎯</div>
              <h3>Objectifs par domaine</h3>
              <p>Business, Sport, Finance, Spiritualité… structurés et suivis avec milestones et KPIs.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ '--ic-bg': '#E6FAF4', '--ic-fg': '#00C896' }}>🔥</div>
              <h3>Habitudes & Streaks</h3>
              <p>Rituels quotidiens avec suivi de séries, heatmap annuelle et rappels intelligents.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ '--ic-bg': '#FEF3D7', '--ic-fg': '#F5A623' }}>💰</div>
              <h3>Fortune personnelle</h3>
              <p>Patrimoine net, flux financiers, créances — votre tableau de bord financier complet.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ '--ic-bg': '#EEEBFF', '--ic-fg': '#6C63FF' }}>📅</div>
              <h3>Planning intelligent</h3>
              <p>Rituel matin, time blocks, plan du jour et vue hebdomadaire en un clic.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ '--ic-bg': '#E0F4FE', '--ic-fg': '#0EA5E9' }}>📊</div>
              <h3>KPIs personnels</h3>
              <p>Vos métriques clés avec graphes, tendances et alertes automatiques.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ '--ic-bg': '#FCE7F3', '--ic-fg': '#E91E8C' }}>📓</div>
              <h3>Réflexion structurée</h3>
              <p>Journal quotidien, leçons apprises, blocages et revue de système.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="section bg-gray" id="how">
        <div className="container">
          <div className="section-eyebrow">Démarrer en 3 étapes</div>
          <h2>3 étapes pour piloter votre vie</h2>
          <p className="lead">De zéro à un système qui tient, en quelques minutes.</p>
          <div className="steps">
            <div className="step first">
              <div className="step-num">01</div>
              <h3>Créez votre compte</h3>
              <p>En 30 secondes, sans carte bancaire. Vos données sont privées et sécurisées.</p>
            </div>
            <div className="step">
              <div className="step-num">02</div>
              <h3>Configurez vos domaines</h3>
              <p>Ajoutez objectifs, habitudes, KPIs et fortune selon vos priorités de vie.</p>
            </div>
            <div className="step">
              <div className="step-num">03</div>
              <h3>Pilotez chaque jour</h3>
              <p>Dashboard live, rituel matin guidé, suivi en temps réel de tout ce qui compte.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section className="section bg-white" id="pricing">
        <div className="container">
          <div className="section-eyebrow">Tarifs</div>
          <h2>Un prix simple et honnête</h2>
          <p className="lead">Accès complet à toutes les fonctionnalités. Un seul paiement.</p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="plan plan-pro" style={{ maxWidth: 480, width: '100%' }}>
              <div className="plan-badge">⭐ OFFRE UNIQUE</div>
              <div className="plan-crossed" style={{ marginBottom: 4 }}><s>1 080 MAD/an</s></div>
              <div className="plan-price" style={{ alignItems: 'baseline', gap: 6 }}>
                <span className="price" style={{ fontSize: 64 }}>300 MAD</span>
                <span className="per" style={{ fontSize: 20 }}>/an</span>
              </div>
              <div style={{ marginBottom: 16 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E6FAF4', color: '#00C896', fontWeight: 700, fontSize: 13, padding: '4px 12px', borderRadius: 99 }}>
                  ✓ Vous économisez 780 MAD
                </span>
              </div>
              <div className="plan-label" style={{ textTransform: 'none', fontSize: 14, letterSpacing: 0, marginBottom: 20 }}>
                Un seul paiement. Une année complète.
              </div>
              <ul className="plan-features">
                <li className="yes"><CheckIcon /> Dashboard complet</li>
                <li className="yes"><CheckIcon /> Objectifs illimités</li>
                <li className="yes"><CheckIcon /> Habitudes &amp; streaks illimités</li>
                <li className="yes"><CheckIcon /> Fortune &amp; patrimoine complet</li>
                <li className="yes"><CheckIcon /> KPIs personnalisés</li>
                <li className="yes"><CheckIcon /> Bilans hebdo &amp; mensuel</li>
                <li className="yes"><CheckIcon /> Journal personnel</li>
                <li className="yes"><CheckIcon /> Support prioritaire</li>
              </ul>
              <button className="btn btn-primary" style={{ width: '100%', height: 56, fontSize: 16, borderRadius: 12 }} onClick={goSignup}>
                Démarrer maintenant →
              </button>
              <div className="plan-note" style={{ marginTop: 14 }}>
                🔒 Paiement sécurisé · ↩️ Remboursé si non satisfait · 🇲🇦 Prix en Dirhams
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="section bg-gray" id="testimonials">
        <div className="container">
          <div className="section-eyebrow">Témoignages</div>
          <h2>Ce qu'en disent nos utilisateurs</h2>
          <p className="lead">Des entrepreneurs qui ont remplacé Notion, Todoist et 4 spreadsheets par un seul système.</p>
          <div className="testimonials">
            <div className="testimonial">
              <div className="stars">★★★★★</div>
              <p className="quote">"Axis Life a transformé ma façon de gérer mes deux business. Tout est centralisé, structuré, vivant."</p>
              <div className="author">
                <div className="avatar" style={{ background: '#FF6B35' }}>KM</div>
                <div><div className="name">Karim M.</div><div className="role">Entrepreneur e-commerce</div></div>
              </div>
            </div>
            <div className="testimonial">
              <div className="stars">★★★★★</div>
              <p className="quote">"Le module Fortune m'a enfin permis de voir ma situation financière réelle. J'ai découvert que j'avais plus d'actifs que je pensais."</p>
              <div className="author">
                <div className="avatar" style={{ background: '#6C63FF' }}>SL</div>
                <div><div className="name">Sarah L.</div><div className="role">Freelance design</div></div>
              </div>
            </div>
            <div className="testimonial">
              <div className="stars">★★★★★</div>
              <p className="quote">"Le rituel matin dans l'app m'a aidé à démarrer chaque journée avec clarté. Mon score de semaine ne descend plus sous 80%."</p>
              <div className="author">
                <div className="avatar" style={{ background: '#00C896' }}>AK</div>
                <div><div className="name">Amine K.</div><div className="role">CEO startup</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="final-cta">
        <div className="container">
          <h2>Prêt à prendre le contrôle ?</h2>
          <p>Rejoignez les entrepreneurs qui pilotent leur vie avec intention.</p>
          <button className="btn btn-primary btn-xl" onClick={goSignup}>Créer mon compte gratuit →</button>
          <div className="small-link">Déjà un compte ? <button onClick={goLogin}>Se connecter →</button></div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              <a className="wordmark on-dark" onClick={goLogin} style={{ cursor: 'pointer' }}>
                <XLogo size={24} />
                <span><span className="axis" style={{ color: 'white' }}>AXIS</span> <span className="life">LIFE</span></span>
              </a>
              <div className="footer-tagline">Le système de productivité pour piloter chaque domaine de votre vie.</div>
            </div>
            <div className="footer-links">
              <button className="footer-link" onClick={() => scrollTo('features')}>Fonctionnalités</button>
              <button className="footer-link" onClick={() => scrollTo('pricing')}>Tarifs</button>
              <button className="footer-link">Contact</button>
              <button className="footer-link">Confidentialité</button>
              <button className="footer-link">CGU</button>
            </div>
            <div className="footer-copy">© 2026 Axis Life.<br />Tous droits réservés.</div>
          </div>
        </div>
      </footer>

    </div>
  )
}
