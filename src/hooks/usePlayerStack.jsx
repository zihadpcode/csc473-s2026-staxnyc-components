import { createContext, useContext, useEffect, useState } from 'react'
import { parseSavedPlayers } from '../lib/playerUtils'

const key = 'staxnyc:saved-players:v1'
const StackContext = createContext(null)

export function StackProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try {
      return parseSavedPlayers(localStorage.getItem(key))
    } catch {
      return []
    }
  })
  const [storageError, setStorageError] = useState('')
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(ids))
      setStorageError('')
    } catch {
      setStorageError(
        'Browser storage is unavailable. Your stack will last for this visit only.',
      )
    }
  }, [ids])
  useEffect(() => {
    const sync = (e) => {
      if (e.key === key) setIds(parseSavedPlayers(e.newValue))
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])
  function toggle(id) {
    const value = String(id)
    setIds((previous) =>
      previous.includes(value)
        ? previous.filter((item) => item !== value)
        : previous.length < 50
          ? [...previous, value]
          : previous,
    )
  }
  return (
    <StackContext.Provider value={{ ids, toggle, storageError }}>
      {children}
    </StackContext.Provider>
  )
}

export const usePlayerStack = () => useContext(StackContext)
