export function toDateKey(date = new Date()) {
  return date.toISOString().split('T')[0]
}

export function todayKey() {
  return toDateKey(new Date())
}

export function formatDateFR(date = new Date()) {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateShortFR(dateStr) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export function getISOWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

export function getWeekKey(date = new Date()) {
  return `${date.getFullYear()}-W${String(getISOWeek(date)).padStart(2, '0')}`
}

export function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function getWeekDays(date = new Date()) {
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(date.setDate(diff))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return toDateKey(d)
  })
}

export function getDayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date - start
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function getWeekDaysForOffset(weekOffset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + weekOffset * 7)
  return getWeekDays(new Date(d))
}

export function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - 6 + i)
    return toDateKey(d)
  })
}

export function getLast12Weeks() {
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (11 - i) * 7)
    return getWeekKey(d)
  })
}

export function getWeekDayLabels() {
  return ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
}

export function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return toDateKey(d)
}

export function getLast365Days() {
  const days = []
  for (let i = 364; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(toDateKey(d))
  }
  return days
}
