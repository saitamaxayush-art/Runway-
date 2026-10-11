import { clamp } from '../utils/math.js'
import { Story } from '../pages/Story.jsx'

export function Ladder({ p, my, jump }) {
  const N = 36,
    ac = clamp(0.25 + p * 0.5 + (my - 0.5) * 0.14, 0.12, 0.88) * (N - 1)
  return (
    <div
      className="ladder"
      role="slider"
      tabIndex={0}
      aria-label="Story chapter"
      aria-valuemin={0}
      aria-valuemax={5}
      aria-valuenow={Math.min(5, Math.floor(p * 6))}
      onKeyDown={(e) => {
        const k = Math.min(5, Math.floor(p * 6))
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') jump(clamp(k + 1, 0, 5))
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') jump(clamp(k - 1, 0, 5))
      }}
      onClick={(e) => {
        const b = e.currentTarget.getBoundingClientRect()
        jump(clamp(Math.floor(((e.clientY - b.top) / b.height) * 6), 0, 5))
      }}
    >
      {Array.from({ length: N }, (_, i) => {
        const d = Math.abs(i - ac)
        return <i key={i} style={{ width: d <= 1.5 ? 26 : d <= 2.5 ? 22 : d <= 3.5 ? 18 : 14 }} />
      })}
    </div>
  )
}
