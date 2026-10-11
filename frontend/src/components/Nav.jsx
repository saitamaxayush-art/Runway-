import { useEffect, useState, useRef } from 'react'

export function Nav({ route }) {
  const [scrolled, setScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)

  const L = [
    ['/overview', 'Overview'],
    ['/dashboard', 'Dashboard'],
    ['/simulate', 'Simulator'],
    ['/plan', 'Plan'],
  ]

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? Math.min(1, Math.max(0, y / docHeight)) : 0

      setScrollProgress(progress)
      setScrolled(y > 24)

      if (y > 140 && y > lastY.current + 10) {
        setHidden(true)
      } else if (y < lastY.current - 6 || y < 60) {
        setHidden(false)
      }
      lastY.current = y
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''} ${hidden ? 'nav-hidden' : ''}`}>
      <div
        className="nav-scrub"
        style={{ transform: `scaleX(${scrollProgress})` }}
        aria-hidden="true"
      />
      <a href="#/" className="brand">
        Runway
      </a>
      <nav aria-label="Primary">
        {L.map(([h, t]) => {
          const isOn =
            route === h ||
            (h === '/simulate' && ['/simulate', '/simulator', '/sim'].includes(route)) ||
            (h === '/dashboard' && ['/dashboard', '/dash'].includes(route)) ||
            (h === '/plan' && ['/plan', '/goals', '/shocks'].includes(route))
          return (
            <a
              key={h}
              href={'#' + h}
              className={isOn ? 'on' : ''}
              aria-current={isOn ? 'page' : undefined}
            >
              {t}
            </a>
          )
        })}
      </nav>
    </header>
  )
}
