export default function PageWrapper({ children, className = '' }) {
  return (
    <main className={`main page-enter ${className}`}>
      {children}
    </main>
  )
}
