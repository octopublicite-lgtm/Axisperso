import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const maxWidths = { sm: 480, md: 560, lg: 720, xl: 900 }

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        background: 'rgba(26,26,46,0.45)', backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="modal-sheet"
        style={{
          background: 'var(--surface)',
          borderRadius: 18,
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          width: '100%',
          maxWidth: maxWidths[size],
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px 16px', borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="btn-icon"
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ overflowY: 'auto', padding: 20, flex: 1 }}>{children}</div>
      </div>
    </div>
  )
}
