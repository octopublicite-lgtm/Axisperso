import { useNavigate } from 'react-router-dom'
import './landing.css'

const Logo = () => (
  <svg width={32} height={32} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
    <path d="M9 6 L24 21 L20 25 L5 10 Z" fill="rgba(255,255,255,0.18)" />
    <path d="M22 6 L26 10 L11 25 L7 21 Z" fill="rgba(255,255,255,0.18)" />
    <path d="M11 4 L26 19 L22 23 L7 8 Z" fill="#FF6B35" />
    <path d="M24 4 L28 8 L13 23 L9 19 Z" fill="#FF6B35" />
    <circle cx="17.5" cy="13.5" r="2" fill="#FFFFFF" />
  </svg>
)

const DashboardMockup = () => (
  <div className="lp-mockup">
    <div className="lp-mockup-bar">
      <div className="lp-mockup-dot" style={{ background: '#FF5F57' }} />
      <div className="lp-mockup-dot" style={{ background: '#FFBD2E' }} />
      <div className="lp-mockup-dot" style={{ background: '#28C840' }} />
    </div>
    <svg viewBox="0 0 800 380" fill="none" style={{ width: '100%', display: 'block' }}>
      {/* Sidebar */}
      <rect x="0" y="0" width="180" height="380" fill="rgba(255,255,255,0.03)" />
      <rect x="16" y="20" width="120" height="14" rx="4" fill="rgba(255,107,53,0.5)" />
      {[60, 86, 112, 138, 164, 190].map((y, i) => (
        <g key={i}>
          <rect x="20" y={y} width="10" height="10" rx="2" fill={i === 0 ? '#FF6B35' : 'rgba(255,255,255,0.15)'} />
          <rect x="36" y={y + 1} width={60 + (i % 3) * 15} height="8" rx="3" fill={i === 0 ? 'rgba(255,107,53,0.4)' : 'rgba(255,255,255,0.08)'} />
        </g>
      ))}

      {/* Main area */}
      {/* Greeting */}
      <rect x="200" y="20" width="180" height="18" rx="5" fill="rgba(255,255,255,0.2)" />
      <rect x="200" y="44" width="120" height="10" rx="4" fill="rgba(255,255,255,0.08)" />

      {/* Stat cards row */}
      {[0, 1, 2, 3].map(i => (
        <g key={i}>
          <rect x={200 + i * 148} y="72" width="136" height="68" rx="10" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <rect x={212 + i * 148} y="84" width="60" height="8" rx="3" fill="rgba(255,255,255,0.12)" />
          <rect x={212 + i * 148} y="98" width="80" height="16" rx="4" fill={i === 0 ? 'rgba(255,107,53,0.5)' : 'rgba(255,255,255,0.18)'} />
          <rect x={212 + i * 148} y="120" width="50" height="8" rx="3" fill="rgba(255,255,255,0.07)" />
        </g>
      ))}

      {/* Objectives list */}
      <rect x="200" y="160" width="380" height="14" rx="4" fill="rgba(255,255,255,0.12)" />
      {[0, 1, 2, 3].map(i => (
        <g key={i}>
          <rect x="200" y={185 + i * 44} width="380" height="36" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <rect x="214" y={193 + i * 44} width="8" height="8" rx="2" fill={['rgba(255,107,53,0.7)', 'rgba(99,102,241,0.7)', 'rgba(34,197,94,0.7)', 'rgba(251,191,36,0.7)'][i]} />
          <rect x="228" y={193 + i * 44} width={[120, 90, 140, 100][i]} height="8" rx="3" fill="rgba(255,255,255,0.15)" />
          <rect x="214" y={206 + i * 44} width={[180, 220, 160, 200][i]} height="5" rx="2.5" fill="rgba(255,255,255,0.06)" />
          <rect x="214" y={206 + i * 44} width={[90, 150, 60, 130][i]} height="5" rx="2.5" fill={['rgba(255,107,53,0.6)', 'rgba(99,102,241,0.6)', 'rgba(34,197,94,0.6)', 'rgba(251,191,36,0.6)'][i]} />
        </g>
      ))}

      {/* Right panel */}
      <rect x="596" y="160" width="190" height="200" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <rect x="608" y="174" width="100" height="10" rx="3" fill="rgba(255,255,255,0.12)" />
      {[0,1,2,3,4].map(i => (
        <g key={i}>
          <rect x="608" y={194 + i * 30} width="166" height="22" rx="5" fill="rgba(255,255,255,0.03)" />
          <rect x="616" y={200 + i * 30} width="8" height="8" rx="2" fill="rgba(255,107,53,0.4)" />
          <rect x="630" y={201 + i * 30} width={[80, 60, 100, 70, 90][i]} height="7" rx="3" fill="rgba(255,255,255,0.1)" />
        </g>
      ))}

      {/* Habit heatmap dots */}
      {Array.from({ length: 35 }, (_, i) => (
        <rect key={i} x={200 + (i % 7) * 14} y={360 + Math.floor(i / 7) * 0} width="11" height="11" rx="2"
          fill={Math.random() > 0.35 ? 'rgba(255,107,53,0.6)' : 'rgba(255,255,255,0.07)'} />
      ))}
    </svg>
  </div>
)

const FEATURES = [
  { icon: '🎯', title: 'Objectifs par domaine', desc: 'Business, Sport, Finance, Spiritualité… Chaque domaine de vie structuré et suivi.' },
  { icon: '🔥', title: 'Habitudes & Streaks', desc: 'Créez des rituels quotidiens et suivez vos séries de réussite.' },
  { icon: '💰', title: 'Fortune personnelle', desc: 'Calculez votre patrimoine net, suivez vos flux et vos créances.' },
  { icon: '📅', title: 'Planning intelligent', desc: 'Rituel matin, time blocks, plan du jour et vue hebdomadaire.' },
  { icon: '📊', title: 'KPIs personnels', desc: 'Vos métriques clés en un coup d\'œil, avec graphes et tendances.' },
  { icon: '📓', title: 'Journal & Réflexion', desc: 'Capturez vos leçons, débloquez vos blocages, évoluez chaque semaine.' },
]

const STEPS = [
  { num: '1', title: 'Créez votre compte', desc: 'En 30 secondes, sans carte bancaire.' },
  { num: '2', title: 'Configurez vos domaines', desc: 'Ajoutez vos objectifs, habitudes et KPIs.' },
  { num: '3', title: 'Pilotez chaque jour', desc: 'Dashboard, rituel matin, suivi en temps réel.' },
]

const FREE_FEATURES = [
  { text: 'Dashboard complet', on: true },
  { text: "Jusqu'à 3 objectifs", on: true },
  { text: '5 habitudes maximum', on: true },
  { text: 'Journal personnel', on: true },
  { text: 'Fortune & patrimoine', on: false },
  { text: 'KPIs personnalisés', on: false },
  { text: 'Bilan mensuel', on: false },
]

const PRO_FEATURES = [
  { text: 'Dashboard complet', on: true },
  { text: 'Objectifs illimités', on: true },
  { text: 'Habitudes illimitées', on: true },
  { text: 'Journal personnel', on: true },
  { text: 'Fortune & patrimoine complet', on: true },
  { text: 'KPIs personnalisés', on: true },
  { text: 'Bilans hebdo & mensuel', on: true },
  { text: 'Support prioritaire', on: true },
]

const TESTIMONIALS = [
  { quote: "Axis Life a changé ma façon de gérer mes business. Tout est au même endroit.", name: 'Karim M.', role: 'Entrepreneur', initials: 'KM' },
  { quote: "Le suivi de fortune m'a ouvert les yeux sur ma situation financière réelle.", name: 'Sarah L.', role: 'Freelance', initials: 'SL' },
  { quote: "Le rituel matin dans l'app m'a aidé à être 3x plus productif.", name: 'Amine K.', role: 'CEO', initials: 'AK' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const goLogin = () => navigate('/login')

  return (
    <div className="lp-root">
      {/* ---- Navbar ---- */}
      <nav className="lp-nav">
        <div className="lp-nav-logo">
          <Logo />
          <span><span className="lp-nav-logo-axis">AXIS</span> LIFE</span>
        </div>
        <button className="lp-nav-btn" onClick={goLogin}>Se connecter</button>
      </nav>

      {/* ---- Hero ---- */}
      <section className="lp-hero">
        <div className="lp-hero-badge">✦ Productivité personnelle pour entrepreneurs</div>
        <h1 className="lp-hero-h1">
          Pilotez votre vie.<br />
          <span>Chaque domaine.</span> Chaque jour.
        </h1>
        <p className="lp-hero-sub">
          Axis Life est le système de productivité personnelle pour les entrepreneurs qui veulent construire une vie intentionnelle — objectifs, habitudes, fortune, réflexion.
        </p>
        <div className="lp-hero-ctas">
          <button className="lp-btn-primary" onClick={goLogin}>Commencer gratuitement →</button>
          <a href="#features" className="lp-btn-ghost">Voir les fonctionnalités</a>
        </div>
        <div className="lp-hero-trust">
          <span>Aucune carte bancaire requise</span>
          <span>Accès immédiat</span>
          <span>Données 100% privées</span>
        </div>
        <div className="lp-mockup-wrap">
          <DashboardMockup />
        </div>
      </section>

      {/* ---- Features ---- */}
      <section className="lp-section lp-features-bg" id="features">
        <div className="lp-container">
          <h2 className="lp-section-title">Tout ce dont vous avez besoin<br />pour piloter votre vie</h2>
          <p className="lp-section-sub">Six modules intégrés, un seul système. Rien de superflu.</p>
          <div className="lp-features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="lp-feature-card">
                <span className="lp-feature-icon">{f.icon}</span>
                <h3 className="lp-feature-title">{f.title}</h3>
                <p className="lp-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- How it works ---- */}
      <section className="lp-section lp-how-bg">
        <div className="lp-container">
          <h2 className="lp-section-title">Comment ça marche ?</h2>
          <p className="lp-section-sub">Opérationnel en moins de deux minutes.</p>
          <div className="lp-steps">
            {STEPS.map((s, i) => (
              <>
                <div key={s.num} className="lp-step">
                  <div className="lp-step-num">{s.num}</div>
                  <h3 className="lp-step-title">{s.title}</h3>
                  <p className="lp-step-desc">{s.desc}</p>
                </div>
                {i < STEPS.length - 1 && <div className="lp-step-arrow">→</div>}
              </>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Pricing ---- */}
      <section className="lp-section lp-pricing-bg" id="pricing">
        <div className="lp-container">
          <h2 className="lp-section-title">Un prix simple et honnête</h2>
          <p className="lp-section-sub">Payez une fois par mois. Annulez quand vous voulez.</p>
          <div className="lp-pricing-grid">
            {/* Free */}
            <div className="lp-price-card">
              <div className="lp-price-name">Gratuit</div>
              <div className="lp-price-amount">0 MAD <span>/ mois</span></div>
              <ul className="lp-price-features">
                {FREE_FEATURES.map(f => (
                  <li key={f.text} className={f.on ? '' : 'off'}>{f.text}</li>
                ))}
              </ul>
              <button className="lp-price-btn outline" onClick={goLogin}>Commencer gratuitement</button>
            </div>

            {/* Pro */}
            <div className="lp-price-card pro">
              <div className="lp-price-badge">POPULAIRE</div>
              <div className="lp-price-name">Pro</div>
              <div className="lp-price-amount">300 MAD <span>/ mois</span></div>
              <ul className="lp-price-features">
                {PRO_FEATURES.map(f => (
                  <li key={f.text}>{f.text}</li>
                ))}
              </ul>
              <button className="lp-price-btn filled" onClick={goLogin}>Démarrer l'essai gratuit</button>
            </div>
          </div>
          <div className="lp-price-footer">
            <span>💳 Paiement sécurisé</span>
            <span>🔒 Données privées</span>
            <span>↩️ Remboursement 7 jours</span>
          </div>
        </div>
      </section>

      {/* ---- Testimonials ---- */}
      <section className="lp-section lp-testi-bg">
        <div className="lp-container">
          <h2 className="lp-section-title">Ce qu'en disent les premiers utilisateurs</h2>
          <p className="lp-section-sub" style={{ marginBottom: 48 }}>Ils ont changé leur façon de piloter leur vie.</p>
          <div className="lp-testi-grid">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="lp-testi-card">
                <div className="lp-testi-stars">★★★★★</div>
                <p className="lp-testi-text">{t.quote}</p>
                <div className="lp-testi-author">
                  <div className="lp-testi-avatar">{t.initials}</div>
                  <div>
                    <div className="lp-testi-name">{t.name}</div>
                    <div className="lp-testi-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Final CTA ---- */}
      <section className="lp-cta-bg">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="lp-cta-h2">Prêt à prendre le contrôle<br />de votre vie ?</h2>
          <p className="lp-cta-sub">Rejoignez les entrepreneurs qui pilotent leur vie avec intention.</p>
          <button className="lp-btn-primary" style={{ margin: '0 auto' }} onClick={goLogin}>
            Créer mon compte gratuit →
          </button>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div>
            <div className="lp-footer-logo">
              <Logo />
              <div>
                <div className="lp-footer-brand">
                  <span className="lp-footer-brand-axis">AXIS</span> LIFE
                </div>
                <div className="lp-footer-tagline">Pilotez votre vie. Chaque jour.</div>
              </div>
            </div>
          </div>
          <div className="lp-footer-copy">© 2026 Axis Life. Tous droits réservés.</div>
          <div className="lp-footer-links">
            <a href="#">Confidentialité</a>
            <a href="#">CGU</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
