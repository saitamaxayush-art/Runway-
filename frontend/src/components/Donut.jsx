import { COL } from '../data/constants.js'

export function Donut({ parts, total, label }) {
  const R = 70,
    C = 2 * Math.PI * R
  let off = 0
  return (
    <svg
      viewBox="0 0 200 200"
      className="donut"
      role="img"
      aria-label={`Allocation chart: ${label[0]} ${label[1]}`}
    >
      {parts
        .filter((p) => p.v > 0)
        .map((p) => {
          const len = (p.v / total) * C,
            el = (
              <circle
                key={p.l}
                cx="100"
                cy="100"
                r={R}
                fill="none"
                stroke={COL[p.l]}
                strokeWidth="26"
                strokeDasharray={`${Math.max(0, len - 1.5)} ${C}`}
                strokeDashoffset={-off}
                transform="rotate(-90 100 100)"
                className="seg"
              />
            )
          off += len
          return el
        })}
      <text x="100" y="98" textAnchor="middle" className="dl">
        {label[0]}
      </text>
      <text x="100" y="118" textAnchor="middle" className="ds">
        {label[1]}
      </text>
    </svg>
  )
}
