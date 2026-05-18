import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', fontFamily: 'system-ui, sans-serif', background: '#F9FAFB', padding: 24,
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 8 }}>
            Une erreur s'est produite
          </h1>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 24, textAlign: 'center' }}>
            L'application a rencontré une erreur inattendue.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px', background: '#FF6B35', color: '#fff', border: 'none',
              borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Recharger la page
          </button>
          <details style={{ marginTop: 24, fontSize: 12, color: '#999', maxWidth: 500 }}>
            <summary style={{ cursor: 'pointer' }}>Détails de l'erreur</summary>
            <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {this.state.error?.toString()}
            </pre>
          </details>
        </div>
      )
    }
    return this.props.children
  }
}
