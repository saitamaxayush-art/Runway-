import { useCallback, useEffect, useRef, useState } from 'react'

const HALF = 850

/** Intercepts in-app hash links and plays the emerald wipe between routes. Returns the wipe phase. */
export function useRouteTransition() {
  const [phase, setPhase] = useState('')
  const busy = useRef(false)
  const go = useCallback((path) => {
    if (busy.current || path === (location.hash.slice(1) || '/')) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      location.hash = path
      return
    }
    busy.current = true
    setPhase('in')
    setTimeout(() => {
      location.hash = path
      setPhase('out')
      setTimeout(() => {
        setPhase('')
        busy.current = false
      }, HALF)
    }, HALF)
  }, [])
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest?.('a[href^="#/"]')
      if (a && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        go(a.getAttribute('href').slice(1))
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [go])
  return phase
}
