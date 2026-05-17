import { DOMAIN_COLORS } from './constants'

export function getDomainColor(domaine) {
  return DOMAIN_COLORS[domaine]?.color ?? '#AAAAAA'
}

export function getDomainLight(domaine) {
  return DOMAIN_COLORS[domaine]?.light ?? '#F5F5F5'
}

export function getStreakColor(streak) {
  if (streak === 0) return '#AAAAAA'
  if (streak < 7)  return '#FF6B35'
  return '#00C896'
}
