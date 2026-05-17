import { useApp } from '../../context/AppContext'
import { X } from 'lucide-react'

export default function ToastContainer() {
  const { toasts, removeToast } = useApp()

  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <span style={{ flex: 1 }}>{t.message}</span>
          <button onClick={() => removeToast(t.id)} aria-label="Fermer" style={{ color: 'var(--text-3)', display: 'grid', placeItems: 'center' }}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
