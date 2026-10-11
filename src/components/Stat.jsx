import { inr } from '../utils/format.js'
import { useNum } from '../hooks/useNum.js'
import { Tilt } from './Tilt.jsx'

export function Stat({ l, v, f = inr, tone }) {
  const n = useNum(v)
  return (
    <Tilt className="card stat">
      <small>{l}</small>
      <b className={tone}>{f(n)}</b>
    </Tilt>
  )
}
