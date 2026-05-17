import { useState, useCallback } from 'react'

const PREFIX = 'axislife_'

export function useLocalStorage(key, initialValue) {
  const prefixedKey = PREFIX + key

  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(prefixedKey)
      return item !== null ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    setStoredValue((prev) => {
      const next = typeof value === 'function' ? value(prev) : value
      try {
        localStorage.setItem(prefixedKey, JSON.stringify(next))
      } catch {}
      return next
    })
  }, [prefixedKey])

  const removeValue = useCallback(() => {
    localStorage.removeItem(prefixedKey)
    setStoredValue(initialValue)
  }, [prefixedKey, initialValue])

  return [storedValue, setValue, removeValue]
}

export function getRaw(key) {
  try {
    const item = localStorage.getItem(PREFIX + key)
    return item !== null ? JSON.parse(item) : null
  } catch {
    return null
  }
}

export function setRaw(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {}
}
