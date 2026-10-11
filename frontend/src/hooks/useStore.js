import { useState, useEffect } from 'react'
import { INIT } from '../data/initialState.js'

export const useStore = () => {
  const [s, set] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('runway')) || INIT
    } catch {
      return INIT
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem('runway', JSON.stringify(s))
    } catch {
      // Storage can be unavailable (private mode); the app still works in memory.
    }
  }, [s])
  return [s, set]
}
