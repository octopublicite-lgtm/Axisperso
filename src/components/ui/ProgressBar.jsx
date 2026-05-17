export default function ProgressBar({ value = 0, color = '#FF6B35', height = 6, className = '' }) {
  const isLarge = height >= 8
  return (
    <div className={`progress ${isLarge ? 'progress-lg' : ''} ${className}`} style={{ height: height !== 5 && height !== 8 ? height : undefined }}>
      <div
        className="progress-fill"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, '--c': color }}
      />
    </div>
  )
}
