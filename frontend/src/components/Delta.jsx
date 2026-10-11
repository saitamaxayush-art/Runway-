import { inr } from '../utils/format.js'

export function Delta({ a, b, f = inr, inv }) {
  const d = b - a,
    good = inv ? d < 0 : d > 0
  return (
    <span className={d === 0 ? '' : good ? 'good' : 'bad'}>
      {d > 0 ? '+' : ''}
      {f(d)}
    </span>
  )
}
