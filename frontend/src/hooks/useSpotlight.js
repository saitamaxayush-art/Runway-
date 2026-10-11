import { useEffect } from 'react'

/** Feeds the pointer position into CSS variables so cards can render a hover spotlight. */
export function useSpotlight() {
  useEffect(() => {
    const onMove = (e) => {
      const c = e.target.closest?.('.card')
      if (!c) return
      const b = c.getBoundingClientRect()
      c.style.setProperty('--mx', e.clientX - b.left + 'px')
      c.style.setProperty('--my', e.clientY - b.top + 'px')
    }
    document.addEventListener('mousemove', onMove)
    return () => document.removeEventListener('mousemove', onMove)
  }, [])
}
