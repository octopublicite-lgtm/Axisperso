export default function Badge({ children, color, bg, className = '' }) {
  return (
    <span
      className={`badge ${className}`}
      style={{ color: color ?? '#666666', background: bg ?? '#F0F0F0' }}
    >
      {children}
    </span>
  )
}
