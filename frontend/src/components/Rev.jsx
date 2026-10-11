import { useState, useEffect, useRef } from 'react'

export function Rev({ children, d = 0 }) {
  const r = useRef(),
    [v, setV] = useState(false)
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => e.isIntersecting && setV(true), { threshold: 0.12 })
    o.observe(r.current)
    return () => o.disconnect()
  }, [])
  return (
    <div ref={r} className={'rev' + (v ? ' in' : '')} style={{ transitionDelay: d + 'ms' }}>
      {children}
    </div>
  )
}
