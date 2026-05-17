export default function Input({ label, id, className = '', style = {}, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={id} className="text-xs font-semibold text-secondary tracking-wide uppercase">{label}</label>}
      <input
        id={id}
        style={style}
        className={`w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent transition-all ${className}`}
        {...props}
      />
    </div>
  )
}

export function Textarea({ label, id, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={id} className="text-xs font-semibold text-secondary tracking-wide uppercase">{label}</label>}
      <textarea
        id={id}
        className={`w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none ${className}`}
        {...props}
      />
    </div>
  )
}

export function Select({ label, id, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={id} className="text-xs font-semibold text-secondary tracking-wide uppercase">{label}</label>}
      <select
        id={id}
        className={`w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}
