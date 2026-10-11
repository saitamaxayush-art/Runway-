import { COL } from '../data/constants.js'
import { inr } from '../utils/format.js'

export function Legend({ parts }) {
  return (
    <ul className="legend">
      {parts
        .filter((p) => p.v > 0)
        .map((p) => (
          <li key={p.l}>
            <i style={{ background: COL[p.l] }} />
            {p.l}
            <b>{inr(p.v)}</b>
          </li>
        ))}
    </ul>
  )
}
