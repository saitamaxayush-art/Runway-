import { useState, useEffect } from 'react'

export const useHash = () => {
  const [h, setH] = useState(location.hash || '#/')
  useEffect(() => {
    const f = () => {
      setH(location.hash || '#/')
      scrollTo(0, 0)
    }
    addEventListener('hashchange', f)
    return () => removeEventListener('hashchange', f)
  }, [])
  return h.slice(1) || '/'
}
