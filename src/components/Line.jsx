import { series } from '../engine/finance.js'

export function Line({ s }) {
  const ys = series(s),
    mx = Math.max(s.budget, ...ys),
    mn = Math.min(0, ...ys),
    X = (i) => 20 + i * (560 / 29),
    Y = (v) => 165 - ((v - mn) / (mx - mn)) * 145
  const a = ys
      .slice(0, s.day)
      .map((v, i) => `${X(i)},${Y(v)}`)
      .join(' '),
    p = ys
      .slice(s.day - 1)
      .map((v, i) => `${X(i + s.day - 1)},${Y(v)}`)
      .join(' ')
  return (
    <svg
      viewBox="0 0 600 190"
      className="line"
      role="img"
      aria-label="Balance forecast across 30 days"
    >
      <line x1="20" x2="580" y1={Y(0)} y2={Y(0)} className="zero" />
      <polyline key={'a' + s.day} points={a} className="act draw" pathLength="1" />
      <polyline points={p} className="proj" />
      <circle cx={X(s.day - 1)} cy={Y(ys[s.day - 1])} r="5" fill="var(--acc)" />
      <text x="20" y="186" className="ax">
        Day 1
      </text>
      <text x="580" y="186" textAnchor="end" className="ax">
        Day 30
      </text>
      <text x="24" y={Y(0) - 6} className="ax">
        Zero
      </text>
    </svg>
  )
}
