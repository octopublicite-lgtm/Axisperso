export default function Card({ children, className = '', style = {}, onClick, onMouseEnter, onMouseLeave }) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={style}
      className={`card ${onClick ? 'card-hover cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
