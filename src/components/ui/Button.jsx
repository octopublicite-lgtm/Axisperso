export default function Button({ children, onClick, variant = 'primary', size = 'md', className = '', disabled = false, type = 'button', style = {} }) {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : ''
  const variantClass = `btn-${variant}`
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={`btn ${variantClass} ${sizeClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  )
}
