import { useRef } from 'react'

export function Tilt({ children, className = '' }) {
  const r = useRef()
  return (
    <div
      ref={r}
      className={'tilt ' + className}
      onMouseMove={(e) => {
        const b = r.current.getBoundingClientRect(),
          x = (e.clientX - b.left) / b.width - 0.5,
          y = (e.clientY - b.top) / b.height - 0.5
        r.current.style.transform = `perspective(900px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(6px)`
      }}
      onMouseLeave={() => (r.current.style.transform = '')}
    >
      {children}
    </div>
  )
}
