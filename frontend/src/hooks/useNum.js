import { useState, useEffect, useRef } from 'react'

export const useNum = (v) => {
  const [n, setN] = useState(v),
    r = useRef(v)
  useEffect(() => {
    let f
    const a = r.current,
      st = performance.now()
    const t = (now) => {
      const p = Math.min(1, (now - st) / 700),
        e = 1 - Math.pow(1 - p, 3)
      setN(Math.round(a + (v - a) * e))
      if (p < 1) f = requestAnimationFrame(t)
      else r.current = v
    }
    f = requestAnimationFrame(t)
    return () => cancelAnimationFrame(f)
  }, [v])
  return n
}
